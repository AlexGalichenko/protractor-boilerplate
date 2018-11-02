const gulp = require("gulp");
const fs = require("fs-extra");
const path = require("path");
const {parseGulpArgs} = require("../helpers/utils");
const yargs = require("../helpers/yargs").argv;
const clean = require("gulp-clean");
const {protractor} = require("gulp-protractor");
const Reporter = require("../../framework/reporter/Reporter");
const TasksKiller = require("../../framework/taskskiller/TasksKiller");
const GherkinPrecompiler = require("../gherkin_precompiler/GherkinPrecompiler");
const child_process = require("child_process");
const {update} = require("webdriver-manager-replacement");

module.exports = function (gulp) {

    gulp.task("folders:create", () => {
        fs.emptyDirSync("./dist");
        fs.mkdirsSync("./dist/temp_features");
    });

    gulp.task("webdriver:update", () => {
        const browserDrivers = [
            {
                name: "chromedriver"
            },
            {
                name: "iedriver"
            }
        ];
        const server = {
            name: "selenium",
            runAsNode: false,
            runAsDetach: true,
        };
        return update({
            browserDrivers,
            server
        });
    });

    gulp.task("test:gherkin_precompile", ["webdriver:update", "folders:create"], () => {
        const config = getConfig();
        return new GherkinPrecompiler(config.specs, yargs.argv.tags).compile().catch(e => {
            throw e
        });
    });

    gulp.task("test", ["test:gherkin_precompile"], () => {
        const config = getConfig();
        return gulp.src([])
            .pipe(protractor({
                configFile: getConfigFile(),
                args: parseGulpArgs(yargs.argv),
                autoStartStopServer: true,
                debug: yargs.debug === "true"
            }))
            .on("end", function () {
                console.log("E2E Testing complete");
                generateReport(config);
            })
            .on("error", function (error) {
                generateReport(config);
                console.log("E2E Tests failed");
            })
    });

    gulp.task("kill", () => TasksKiller.kill(["chromedriver", "iedriverserver"]));

    gulp.task("report", () => {
        const config = getConfig();
        generateReport(config);
    });

};

function generateReport(config) {
    Reporter.generateHTMLReport(
        config.capabilities.metadata,
        config.boilerplateOpts.reportFolder,
        config.boilerplateOpts.reportFolder
    );
    Reporter.generateXMLReport(
        config.boilerplateOpts.reportFolder + "report.json",
        config.boilerplateOpts.reportFolder + "report.xml"
    );
}

function getConfig() {
    return yargs.argv.config
        ? require(path.resolve(yargs.argv.config)).config
        : require(path.resolve("./protractor.conf.js")).config
}

function getConfigFile() {
    return yargs.argv.config
        ? path.resolve(yargs.argv.config)
        : path.resolve("./protractor.conf.js")
}