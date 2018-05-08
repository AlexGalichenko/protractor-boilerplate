const fs = require("fs");
const path = require("path");
const report = require("multiple-cucumber-html-reporter");
const xml2js = require("xml2js");
const JunitReport = require("./JunitReport");
const os = require("os");

/**
 * Reporter
 * @type {Reporter}
 */
class Reporter {

    /**
     * Generate multiple html cucumber report
     * @param {Object} capabilities - browser capabilities
     * @param {string} [reportPath] - path to store generated report
     * @param {string} [jsonDir] - path to jsonDir
     */
    static generateHTMLReport(capabilities, reportPath = "./test/", jsonDir = "./test/") {

        const GLUED_REPORT_PATH = "glued_report/";

        this.glueReports(jsonDir + "report.json", jsonReport => {
            const gluedReport = JSON.parse(jsonReport).reduce((report, feature) => {
                const featureIndex = report.findIndex(reportFeature => reportFeature.id === feature.id);
                if (featureIndex !== -1) {
                    report[featureIndex].elements.push(...feature.elements);
                } else {
                    report.push(feature);
                }
                return report
            }, []);

            if (!fs.existsSync(path.resolve(jsonDir + GLUED_REPORT_PATH))) {
                fs.mkdirSync(path.resolve(jsonDir + GLUED_REPORT_PATH))
            }
            fs.writeFileSync(path.resolve(jsonDir + GLUED_REPORT_PATH + "report.json"), JSON.stringify(gluedReport));

            report.generate({
                jsonDir: path.resolve(jsonDir + "glued_report"),
                reportPath: path.resolve(reportPath),
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
        });
    }


    /**
     * Generate junit xml report
     * @param {string} pathToJson - path to jsonDir
     * @param {string} pathToXml - path to store report
     */
    static generateXMLReport(pathToJson, pathToXml) {
        console.log(pathToJson);
        const builder = new xml2js.Builder();
        this.glueReports(pathToJson, jsonReport => {
            const xml =  builder.buildObject(new JunitReport(jsonReport).build());
            fs.writeFile(path.resolve(pathToXml), xml, (err) => {
                if (err) throw err
            })
        });
    }

    /**
     * Glue reports in case of parallels run
     * @param {string} pathToJson - path to json
     * @param {Function} cb - function called to glued report
     * @private
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