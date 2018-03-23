const gulp = require("gulp");
const path = require("path");
const util = require("gulp-util");
const clean = require("gulp-clean");
const protractor = require("gulp-protractor").protractor;
const gp = require("gulp-protractor");
const GulpHelpers = require("../helpers/GulpHelpers");
const webdriver_update = require("gulp-protractor").webdriver_update_specific;
const Reporter = require("../../framework/reporter/Reporter");
const TasksKiller = require("../../framework/taskskiller/TasksKiller");
const server = require("gulp-express");
const CredentialManager = require("../credential_manager/ServerCredentialManager");

module.exports = function (gulp, envs, credentialManagerClass = CredentialManager, serverPath = path.resolve("./credential_server.js")) {
    gulp.task("folders", () => {
        return gulp.src("test", {read: false})
            .pipe(clean());
    });

    gulp.task("test:prepare_folders", ["folders"], () => {
        return Promise.all([
            credentialManagerClass.createPool(envs[util.env.env].credentials),
            GulpHelpers.prepareFolders()
        ]);
    });

    gulp.task("test:driver_update", ["test:prepare_folders"], webdriver_update({
        browsers: ["chrome", "ie"]
    }));

    gulp.task("webdriver_server", ["test:driver_update"], gp.webdriver_standalone);

    gulp.task("test", ["test:driver_update", "c_server"], () => {

        const args = [
            "--params.environment", util.env.env,
            "--cucumberOpts.tags", util.env.tags,
            "--capabilities.browserName", util.env.browser || "chrome",
        ];

        if (util.env.instances > 1) {
            args.push("--capabilities.shardTestFiles");
            args.push("--capabilities.maxInstances");
            args.push(util.env.instances)
        }

        if (util.env.baseUrl) {
            args.push("--params.baseUrl");
            args.push(util.env.baseUrl);
        }

        gulp.src([])
            .pipe(protractor({
                configFile: path.resolve("./protractor.conf.js"),
                args: args,
                autoStartStopServer: true
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
        server.run([serverPath]);
    });
};