"use strict";

const fs = require("fs");
const path = require("path");
const report = require('multiple-cucumber-html-reporter');

class GulpHelpers {

    /**
     * Prepare folders before test
     */
    static prepareFolders() {
        return fs.exists(path.resolve("./test"), (isFolderExist) => {
            if (isFolderExist) {
                fs.readdir(path.resolve("./test"), (err, files) => {
                    if (err) throw err;
                    files.forEach((file) => {
                        let filePath = path.resolve("./test/" + file);
                        fs.lstat(filePath, (err, stat) => {
                            if (err) throw err;
                            if (stat.isFile()) {
                                fs.unlink(filePath);
                            } else {
                                fs.rmdir(filePath)
                            }
                        });
                    });
                });
            } else {
                return fs.mkdir(path.resolve("./test"));
            }
        });
    }

    /**
     * Generate HTML reports
     */
    static generateReport(capabilities) {
        const os = require("os");

        report.generate({
            jsonDir: './test/',
            reportPath: './test/',
            metadata: {
                browser: {
                    name: capabilities.get('browserName'),
                    version: capabilities.get('version')
                },
                device: "PC",
                platform: {
                    name: os.platform() === "win32" ? "windows" : os.platform(),
                    version: os.release()
                }
            }
        });
    }

}

module.exports = GulpHelpers;