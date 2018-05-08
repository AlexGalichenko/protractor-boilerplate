const gulp = require("gulp");
const fs = require("fs");
const path = require("path");
const util = require("gulp-util");
const clean = require("gulp-clean");
const {protractor, webdriver_update_specific} = require("gulp-protractor");
const server = require("gulp-express");
const {prepareFolders, parseGulpArgs} = require("../helpers/utils");
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
        return new GherkinPrecompiler(config.cucumberOpts.features, util.env.tags).compile().catch(e => {
            throw e
        });
    });

    gulp.task("test:create_pool", ["folders:create", "c_server"], () => {
        return credentialManagerClass.createPool(envs[util.env.env].credentials)
    });

    gulp.task("test:driver_update", webdriver_update_specific({
        webdriverManagerArgs: ["--ie32", "--chrome"]
    }));

    gulp.task("test", ["test:driver_update", "test:gherkin_precompile"], () => {
        return gulp.src([])
            .pipe(protractor({
                configFile: path.resolve("./protractor.conf.js"),
                args: parseGulpArgs(util.env),
                autoStartStopServer: true,
            }))
            .on("end", function () {
                console.log("E2E Testing complete");
                process.exit();
            })
            .on("error", function (error) {
                console.log("E2E Tests failed");
                process.exit(1);
            });
    });

    gulp.task("kill", () => TasksKiller.kill(["chromedriver", "iedriverserver"]));

    gulp.task("report", () => {
        Reporter.generateHTMLReport(require(path.resolve("./protractor.conf.js")).config.capabilities.metadata);
        Reporter.generateXMLReport("./test/report.json", "./test/report.xml");
    });

    gulp.task("c_server", () => {
        server.run([__dirname + "/credential_server.js", "--credentialServerPort", util.env.credentialServerPort || 3099]);
    });

};