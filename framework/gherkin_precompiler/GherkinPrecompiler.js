const Gherkin = require("gherkin");
const fs = require("fs");
const glob = require("glob");
const parser = new (require("cucumber-tag-expressions").TagExpressionParser)();
const path = require("path");
const protractorConf = require(path.resolve("./protractor.conf.js"));
const util = require("util");
const _ = require("lodash");

class GherkinPrecompiler {

    /**
     * Construct precompiler object
     * @param {Array<string>} specs - glob expression for specs
     * @param {string} tagExpression - tag expression to parse
     * @param {string} tempFolder - path to temp folder
     */
    constructor(specs, tagExpression = "", tempFolder = "./test/temp_features/") {
        this.specs = specs;
        this.tagExpression = tagExpression;
        this.tempFolder = tempFolder;
    }

    /**
     * Compile and create
     * @return {Promise.<void>}
     */
    async compile() {
        const filePaths = await this._getFilesPathsFromGlob();
        const featureTexts = this._readFiles(filePaths);
        const asts = this._parseGherkinFiles(featureTexts);
        asts.forEach(ast => {
            const featureTemplate = this._getFeatureTemplate(ast);
            const features = this._splitFeature(ast.feature.children, featureTemplate);
            const filteredFeatures = this._filterFeaturesByTag(features, this.tagExpression);
            filteredFeatures.forEach((splitFeature, index) => {
                const escapedFileName = splitFeature.feature.name.replace(/[/\s]/g,"_");
                fs.writeFileSync(`${this.tempFolder}/${escapedFileName}${index}.feature`, this._writeFeature(splitFeature.feature), "utf8");
            })
        });
    }

    /**
     * Read file paths by glob pattern
     * @private
     * @return {Promise}
     */
    async _getFilesPathsFromGlob() {
        const notNormalizedFilePaths = await Promise.all(this.specs.map(spec => util.promisify(glob)(spec)));
        return _.uniq(_.flatten(notNormalizedFilePaths))
    }

    /**
     * Read file content by provided paths
     * @private
     * @param filePaths
     * @return {Array}
     */
    _readFiles(filePaths) {
        return filePaths.map(filePath => fs.readFileSync(filePath, "utf8"))
    }

    /**
     * Parse gherkin files to ASTs
     * @private
     * @param features
     * @return {Array}
     */
    _parseGherkinFiles(features) {
        const parser = new Gherkin.Parser(new Gherkin.AstBuilder());
        const matcher = new Gherkin.TokenMatcher();

        return features.map(feature => {
            const scanner = new Gherkin.TokenScanner(feature);
            return parser.parse(scanner, matcher)
        });
    }

    /**
     * Get feature template for splitting
     * @private
     * @param feature
     * @return {*}
     */
    _getFeatureTemplate(feature) {
        const featureTemplate = Object.assign({}, feature);
        featureTemplate.feature = Object.assign({}, feature.feature);
        featureTemplate.feature.children = featureTemplate.feature.children.filter(scenario => scenario.type === "Background");
        return featureTemplate
    }

    /**
     * Split feature
     * @param scenarios
     * @param featureTemplate
     * @return {wdpromise.Promise<any[]>}
     * @private
     */
    _splitFeature(scenarios, featureTemplate) {
        return scenarios
            .filter(scenario => scenario.type !== "Background")
            .map(scenario => {
                const feature = Object.assign({}, featureTemplate);
                feature.feature = Object.assign({}, featureTemplate.feature);
                feature.feature.children = [...featureTemplate.feature.children];
                const updatedScenario = Object.assign({}, scenario);
                updatedScenario.tags = [...scenario.tags].concat(featureTemplate.feature.tags);
                feature.feature.children.push(updatedScenario);
                return feature
            })
    }

    /**
     * Write features to files
     * @param feature
     * @return {string}
     * @private
     */
    _writeFeature(feature) {
        const LINE_DELIMETER = "\n";

        let featureString = `${feature.type}: ${feature.name}${LINE_DELIMETER}`;

        if (feature.tags) {
            feature.tags.forEach(tag => {
                featureString += `${tag.name}${LINE_DELIMETER}`
            });
        }

        feature.children.forEach(scenario => {
            if (scenario.tags) {
                scenario.tags.forEach(tag => {
                    featureString += `${tag.name}${LINE_DELIMETER}`
                });
            }
            featureString += `${scenario.keyword}: ${scenario.name}${LINE_DELIMETER}`;

            scenario.steps.forEach(step => {
                featureString += `${step.keyword}${step.text}${LINE_DELIMETER}`;
            });

            if (scenario.examples) {
                const example = scenario.examples[0];
                featureString += `Examples:${LINE_DELIMETER}`;
                featureString += `|${example.tableHeader.cells.map(cell => `${cell.value}|`).join("")}${LINE_DELIMETER}`;
                example.tableBody.forEach(tableRow => {
                    featureString += `|${tableRow.cells.map(cell => `${cell.value}|`).join("")}${LINE_DELIMETER}`;
                })
            }
        });

        return featureString;
    }

    /**
     * Filter features by tag expression
     * @param features
     * @param tagExpression
     * @return {Array}
     * @private
     */
    _filterFeaturesByTag(features, tagExpression) {
        const expressionNode = parser.parse(tagExpression);
        return features.filter(feature => {
            return feature.feature.children.some(scenario => {
                if (scenario.tags) {
                    return expressionNode.evaluate(scenario.tags.map(tag => tag.name))
                }
            })
        });
    }

}

module.exports = GherkinPrecompiler;