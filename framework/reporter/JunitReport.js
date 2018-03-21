"use strict";

class JunitReport {

    constructor(jsonData) {
        this.jsonData = JSON.parse(jsonData);
    }

    /**
     * Build xml
     */
    build() {
        return {
            testsuites: this.jsonData.map((testSuiteData) => {
                return {
                    testsuite: {
                        $: this._getTestSuiteAttrs(testSuiteData),
                        properties: this._getProperties(testSuiteData),
                        testcase: this._getTestCases(testSuiteData)
                    }
                }
            })
        }
    }

    /**
     * Get test cases data
     * @param testSuiteData
     * @return {Array}
     * @private
     */
    _getTestCases(testSuiteData) {
        return testSuiteData.elements.map((testCase) => {
            let tc = {
                $: {
                    name: testCase.name,
                    classname: testSuiteData.name
                }
            };
            const failedStep = testCase.steps.find((testStep) => {
                return testStep.result.status === "failed"
            });

            if (failedStep) {
                tc.failure = failedStep.result.error_message
            }
            return tc
        })
    }

    /**
     * Get properties data of test suite
     * @param testSuiteData
     * @return {Array}
     * @private
     */
    _getProperties(testSuiteData) {
        return [
            {
                property: {
                    $: {
                        name: "URI",
                        value: testSuiteData.uri
                    }
                }
            }
        ]
    }

    /**
     * Get test suite attrs
     * @param testSuiteData
     * @return {{name, package, id: number}}
     * @private
     */
    _getTestSuiteAttrs(testSuiteData) {
        return {
            name: testSuiteData.name,
            package: testSuiteData.name,
            id: testSuiteData.name
        }
    }
}


module.exports = JunitReport;