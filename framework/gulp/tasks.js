const gulp = require("gulp");
const path = require("path");
const util = require("gulp-util");
const clean = require("gulp-clean");
const protractor = require("gulp-angular-protractor");
const server = require("gulp-express");
const {prepareFolders, parseGulpArgs} = require("../helpers/utils");
const Reporter = require("../../framework/reporter/Reporter");
const TasksKiller = require("../../framework/taskskiller/TasksKiller");
const CredentialManager = require("../credential_manager/ServerCredentialManager");

module.exports = function (gulp, envs, credentialManagerClass = CredentialManager) {
    gulp.task("folders", () => {
        return gulp.src("test", {read: false})
            .pipe(clean());
    });

    gulp.task("test:prepare_folders", ["folders"], () => {
        return Promise.all([
            credentialManagerClass.createPool(envs[util.env.env].credentials),
            prepareFolders()
        ]);
    });

    gulp.task("test", ["test:driver_update", "c_server"], () => {
        gulp.src([])
            .pipe(protractor({
                configFile: path.resolve("./protractor.conf.js"),
                args: parseGulpArgs(util.env),
                autoStartStopServer: true,
                webDriverUpdate: {
                    browsers: ["chrome", "ie"]
                }
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