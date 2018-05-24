const child_process = require("child_process");
const path = require("path");
const fs = require("fs");

class GridLauncher {

    /**
     * Constructor of grid launcher
     */
    constructor() {
        this.binariesFolder = path.resolve("./node_modules/protractor/node_modules/webdriver-manager/selenium");
        this.defaultConfigFolder = path.resolve("./node_modules/protractor-cucumber-boilerplate/framework/grid_launcher");
    }

    /**
     * Start hub
     * @param {string} [config] - path to hub config
     */
    startHub(config = path.resolve(this.defaultConfigFolder + "/defaultConfig.json")) {
        this._getBinariesPath();
        this.config = config;

        const args = [
            "-jar", this.seleniumServerPath,
            "-role", "hub",
            "-hubConfig", this.config
        ];

        this.hub = child_process.spawn("java", args);
    }

    /**
     * Start node
     * @param {string} [nodeConfig] - path to node config
     */
    startNode(nodeConfig = path.resolve(this.defaultConfigFolder + "/defaultNodeConfig.json")) {
        this._getBinariesPath();
        if (!this.nodes) {
            this.nodes = [];
        }
        const args = [
            "-Dwebdriver.chrome.driver=" + this.chromedriverPath,
            "-Dwebdriver.gecko.driver=" + this.geckodriverPath,
            "-jar", this.seleniumServerPath,
            "-role", "node",
            "-nodeConfig", nodeConfig,
        ];

        this.nodes.push(child_process.spawn("java", args));
    }

    /**
     * Stop hub and nodes
     */
    stop() {
        if (this.nodes) {
            this.nodes.forEach(node => node.kill());
        }
        if (this.hub) {
            this.hub.kill();
        }
    }

    /**
     * Get driver binaries paths
     * @private
     */
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

module.exports = GridLauncher;