"use strict";

const fs = require("fs");
const path = require("path");
const report = require("multiple-cucumber-html-reporter");
const xml2js = require("xml2js");
const JunitReport = require("./JunitReport");

class Reporter {

    /**
     * Generate multiple html cucumber report
     * @param capabilities
     */
    static generateHTMLReport(capabilities) {
        const os = require("os");

        report.generate({
            jsonDir: path.resolve('./test/'),
            reportPath: path.resolve('./test/'),
            metadata: {
                browser: {
                    name: capabilities.browserName,
                    version: capabilities.version
                },
                device: "PC",
                platform: {
                    name: os.platform() === "win32" ? "windows" : os.platform(),
                    version: os.release()
                }
            }
        });
    }

    /**
     * Generate junit xml report
     * @param pathToJson
     * @param pathToXml
     */
    static generateXMLReport(pathToJson, pathToXml) {
        const builder = new xml2js.Builder();

        this.glueReports(pathToJson, (jsonReport) => {
            const xml =  builder.buildObject(new JunitReport(jsonReport).build());

            fs.writeFile(path.resolve(pathToXml), xml, (err) => {
                if (err) {
                    throw err
                }
            })
        });
    }

    /**
     * Glue reports in case of parallels run
     * @param pathToJson
     * @param cb
     */
    static glueReports(pathToJson, cb) {
        return fs.access(path.resolve(pathToJson), (notExist) => {
            if (notExist) {
                const dirPath = pathToJson.replace(/^(.+[\/\\])(.+)$/g, (match, p1) => p1);
                fs.readdir(path.resolve(dirPath), (err, files) => {
                    const REPORT_REGEXP = /^report\.\d+\.json$/;
                    const reports = files.filter(item => REPORT_REGEXP.test(item));

                    const fullReport = reports
                        .map(item => require(path.resolve(dirPath + item)))
                        .reduce((prev, curr) => {
                            if (curr.length > 0) {
                                prev.push(curr[0]);
                            }
                            return prev
                        }, []);
                    cb(JSON.stringify(fullReport))
                })
            } else {
                cb(JSON.stringify(require(path.resolve(pathToJson))));
            }
        })
    }

}

module.exports = Reporter;