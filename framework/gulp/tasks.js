const gulp = require("gulp");
const fs = require("fs");
const path = require("path");
const {prepareFolders, parseGulpArgs, writeDurationMetadata} = require("../helpers/utils");
const yargs = require("../helpers/yargs").argv;
const clean = require("gulp-clean");
const {protractor, webdriver_update_specific} = require("gulp-protractor");
const server = require("gulp-express");
const Reporter = require("../../framework/reporter/Reporter");
const TasksKiller = require("../../framework/taskskiller/TasksKiller");
const CredentialManager = require("../credential_manager/ServerCredentialManager");
const GherkinPrecompiler = require("../gherkin_precompiler/GherkinPrecompiler");

module.exports = function (gulp, envs, credentialManagerClass = CredentialManager) {

    gulp.task("folders:clean", () => {
        return gulp.src("test", {read: false})
            .pipe(clean());
    });

    gulp.task("folders:create", ["folders:clean"], () => {
        if (!fs.existsSync("./test")) {
            fs.mkdirSync("./test");
            fs.mkdirSync("./test/temp_features");
        }
    });

    gulp.task("test:gherkin_precompile", ["test:create_pool"], () => {
        const config = require(path.resolve("./protractor.conf.js")).config;
        return new GherkinPrecompiler(config.specs, yargs.argv.tags).compile().catch(e => {
            throw e
        });
    });

    gulp.task("test:create_pool", ["folders:create", "c_server"], () => {
        return credentialManagerClass.createPool(envs[yargs.argv.env].credentials)
    });

    gulp.task("test:driver_update", webdriver_update_specific({
        webdriverManagerArgs: ["--ie32", "--chrome"]
    }));

    gulp.task("test", ["test:driver_update", "test:gherkin_precompile"], () => {
        const startTime = new Date();
        return gulp.src([])
            .pipe(protractor({
                configFile: path.resolve("./protractor.conf.js"),
                args: parseGulpArgs(yargs.argv),
                autoStartStopServer: true,
                debug: yargs.debug === "true"
            }))
            .on("end", function () {
                writeDurationMetadata(startTime);
                server.stop();
                console.log("E2E Testing complete");
            })
            .on("error", function (error) {
                writeDurationMetadata(startTime);
                server.stop();
                console.log("E2E Tests failed");
                console.log(error);
            });
    });

    gulp.task("kill", () => TasksKiller.kill(["chromedriver", "iedriverserver"]));

    gulp.task("report", () => {
        const metadata = Object.assign(require(path.resolve("./test/metadata.json")), require(path.resolve("./protractor.conf.js")).config.capabilities.metadata);
        Reporter.generateHTMLReport(metadata);
        Reporter.generateXMLReport("./test/report.json", "./test/report.xml");
    });

    gulp.task("c_server", () => {
        server.run([__dirname + "/credential_server.js", "--credentialServerPort", yargs.argv.credentialServerPort || 3099]);
    });

};