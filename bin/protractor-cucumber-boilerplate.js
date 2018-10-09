const gulp = require("gulp");
const fs = require("fs-extra");
const path = require("path");
const {parseGulpArgs} = require("../framework/helpers/utils");
const yargs = require("../framework/helpers/yargs").argv;
const clean = require("gulp-clean");
const {protractor} = require("gulp-protractor");
const Reporter = require("../framework/reporter/Reporter");
const TasksKiller = require("../framework/taskskiller/TasksKiller");
const GherkinPrecompiler = require("../framework/gherkin_precompiler/GherkinPrecompiler");
const child_process = require("child_process");
const {update} = require("webdriver-manager-replacement");
const CredentialServer = require("../framework/credential_server/CredentialServer");
const credentialServer = child_process.spawn("node", ["./credential_server", "--credentialServerPort", 3099]);

(async () => {
    const config = getConfig();
    const configFile = getConfigFile();

    try {
        createFolders();
        await updateDriver();
        await precompileFeatures(config.specs, yargs.argv.tags);
        await runProtractor(configFile, yargs.argv);
        await kill();
    } catch (error) {
        throw error
    } finally {
        credentialServer.kill();
    }

})();

function runProtractor(confPath, cliArgs) {
    const PROTRACTOR_EXECUTABLE = path.resolve(process.cwd() + "/node_modules/protractor/bin/protractor");
    const args = [PROTRACTOR_EXECUTABLE, confPath].concat(parseGulpArgs(cliArgs));
    console.log(args);
    const protractorProcess = child_process.spawn("node", args);

    console.log("node", args.join(" "));
    protractorProcess.stdout.on('data', (data) => {
        console.log(data);
    });

    protractorProcess.stderr.on('data', (data) => {
        console.log(data);
    });

    return new Promise((resolve, reject) => {
        protractorProcess.on("close", (code) => {
            if (code !== 0) {
                reject(`protractor process exited with code ${code}`)
            }
            resolve()
        })
    }).catch(error => {throw error});
}
/**
 * Create folders
 * @param path
 */
function createFolders(path) {
    fs.emptyDirSync("./dist");
    fs.mkdirsSync("./dist/temp_features");
}

function updateDriver() {
    const browserDrivers = [
        {
            name: "chromedriver"
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
    }).catch(error => {throw error});
}

function precompileFeatures(specs, tags) {
    const compiler = new GherkinPrecompiler(specs, tags, path.resolve(process.cwd() + "/dist/temp_features"));
    return compiler.compile().catch(error => {throw error});
}

function kill() {
    return TasksKiller.kill(["chromedriver", "iedriverserver"]).catch(error => {throw error});
}

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