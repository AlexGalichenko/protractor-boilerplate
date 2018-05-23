const child_process = require("child_process");
const path = require("path");
const fs = require("fs");
const process = require("process");

class GridLauncher {

    /**
     *
     * @param url
     */
    constructor(url = "http://192.168.56.1:4444") {
        this.nodes = [];
        this.url = url;
        this.binariesFolder = path.resolve("../../node_modules/protractor/node_modules/webdriver-manager/selenium");
        this._getBinariesPath();
    }

    /**
     *
     */
    startHub() {
        const args = [
            "-jar", this.seleniumServerPath,
            "-role", "hub"
        ];
        this.hub = child_process.spawn("java", args);
    }

    startNode() {
        const args = [
            "-Dwebdriver.chrome.driver=" + this.chromedriverPath,
            "-Dwebdriver.gecko.driver=" + this.geckodriverPath,
            "-jar", this.seleniumServerPath,
            "-role", "node",
            "-hub", this.url + "/grid/register/"
        ];

        this.nodes.push(child_process.spawn("java", args));
    }

    _getBinariesPath() {
        const CHROME_DRIVER_REGEXP = /^chromedriver_.+\.exe$/;
        const GECKO_DRIVER_REGEXP = /^geckodriver.+\.exe$/;
        const SELENIUM_SERVER_REGEXP = /^selenium-server-standalone-.+\.jar$/;
        const binariesPaths = fs.readdirSync(this.binariesFolder);
        this.seleniumServerPath = path.resolve(this.binariesFolder + "/" + binariesPaths.find(binaryPath => SELENIUM_SERVER_REGEXP.test(binaryPath)));
        this.chromedriverPath = path.resolve(this.binariesFolder + "/" + binariesPaths.find(binaryPath => CHROME_DRIVER_REGEXP.test(binaryPath)));
        this.geckodriverPath = path.resolve(this.binariesFolder + "/" + binariesPaths.find(binaryPath => GECKO_DRIVER_REGEXP.test(binaryPath)));
    }

}

const gridLauncher = new GridLauncher();
gridLauncher.startHub();
gridLauncher.startNode();


module.exports = GridLauncher;