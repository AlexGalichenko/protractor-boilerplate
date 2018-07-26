const gulp = require("gulp");
const fs = require("fs-extra");
const path = require("path");
const {parseGulpArgs} = require("../helpers/utils");
const yargs = require("../helpers/yargs").argv;
const clean = require("gulp-clean");
const {protractor, webdriver_update_specific} = require("gulp-protractor");
const server = require("gulp-express");
const Reporter = require("../../framework/reporter/Reporter");
const TasksKiller = require("../../framework/taskskiller/TasksKiller");
const CredentialManager = require("../credential_manager/ServerCredentialManager");
const GherkinPrecompiler = require("../gherkin_precompiler/GherkinPrecompiler");
const child_process = require("child_process");

// function getProtractorBinary(binaryName){
//     const pkgPath = require.resolve('protractor');
//     const protractorDir = path.resolve(path.join(path.dirname(pkgPath), '..', 'bin'));
//     return path.join(protractorDir, '/' + binaryName);
// }

module.exports = function (gulp, envs, credentialManagerClass = CredentialManager) {

    gulp.task("folders:create", () => {
        fs.emptyDirSync("./dist");
        fs.mkdirsSync("./dist/temp_features");
    });

    gulp.task("test:gherkin_precompile", ["test:create_pool"], () => {
        const config = yargs.argv.config
            ? require(path.resolve(yargs.argv.config)).config
            : require(path.resolve("./protractor.conf.js")).config;
        return new GherkinPrecompiler(config.specs, yargs.argv.tags).compile().catch(e => {
            throw e
        });
    });

    gulp.task("test:create_pool", ["folders:create", "c_server"], () => {
        if (yargs.argv.credentialServerPort) {
            return credentialManagerClass.createPool(envs[yargs.argv.env].credentials)
        }
    });

    gulp.task("test:driver_update", webdriver_update_specific({
        webdriverManagerArgs: ["--ie32", "--chrome"]
    }));


    // gulp.task("test:webdriver:start", ["test:driver_update"], () => {
    //     const config = yargs.argv.config
    //         ? require(path.resolve(yargs.argv.config)).config
    //         : require(path.resolve("./protractor.conf.js")).config;
    //     child_process.spawn("node", [getProtractorBinary("webdriver-manager"), "start", "--seleniumPort", config.seleniumPort || yargs.argv.seleniumPort || 4444], {
    //         stdio: "ignore"
    //     });
    // });

    gulp.task("test", ["test:gherkin_precompile", "test:driver_update"], () => {
        const config = yargs.argv.config
            ? require(path.resolve(yargs.argv.config)).config
            : require(path.resolve("./protractor.conf.js")).config;
        return gulp.src([])
            .pipe(protractor({
                configFile: yargs.argv.config ? path.resolve(yargs.argv.config) : path.resolve("./protractor.conf.js"),
                args: parseGulpArgs(yargs.argv),
                autoStartStopServer: true,
                debug: yargs.debug === "true"
            }))
            .on("end", function () {
                server.stop();
                // TasksKiller.killWebdriver(config.seleniumPort || yargs.argv.seleniumPort || 4444);
                console.log("E2E Testing complete");
                Reporter.generateHTMLReport(
                    config.capabilities.metadata,
                    config.boilerplateOpts.reportFolder,
                    config.boilerplateOpts.reportFolder
                );
                Reporter.generateXMLReport(
                    config.boilerplateOpts.reportFolder + "report.json",
                    config.boilerplateOpts.reportFolder + "report.xml"
                );
            })
            .on("error", function (error) {
                server.stop();
                Reporter.generateHTMLReport(
                    config.capabilities.metadata,
                    config.boilerplateOpts.reportFolder,
                    config.boilerplateOpts.reportFolder
                );
                Reporter.generateXMLReport(
                    config.boilerplateOpts.reportFolder + "report.json",
                    config.boilerplateOpts.reportFolder + "report.xml"
                );
                // TasksKiller.killWebdriver(config.seleniumPort || yargs.argv.seleniumPort || 4444);
                console.log("E2E Tests failed");
            });
    });

    gulp.task("kill", () => TasksKiller.kill(["chromedriver", "iedriverserver"]));

    gulp.task("c_server", () => {
        if (yargs.argv.credentialServerPort) {
            server.run([__dirname + "/credential_server.js", "--credentialServerPort", yargs.argv.credentialServerPort]);
        }
    });

};