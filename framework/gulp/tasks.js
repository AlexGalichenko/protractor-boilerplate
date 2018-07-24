const gulp = require("gulp");
const fs = require("fs");
const path = require("path");
const {parseGulpArgs, writeDurationMetadata} = require("../helpers/utils");
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
        const config = yargs.argv.config ? require(yargs.argv.config).config : require("./protractor.conf.js").config;
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

    gulp.task("test", ["test:gherkin_precompile", "test:driver_update"], () => {
        const startTime = new Date();
        return gulp.src([])
            .pipe(protractor({
                configFile: yargs.argv.config ? path.resolve(yargs.argv.config) : path.resolve("./protractor.conf.js"),
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
            });
    });

    gulp.task("kill", () => TasksKiller.kill(["chromedriver", "iedriverserver"]));

    gulp.task("c_server", () => {
        if (yargs.argv.credentialServerPort) {
            server.run([__dirname + "/credential_server.js", "--credentialServerPort", yargs.argv.credentialServerPort]);
        }
    });

};