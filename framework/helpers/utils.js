const fs = require("fs");
const path = require("path");

/**
 * Get CLI argument by name
 * @private
 * @param {string} argumentName - name of argument
 * @param {Array<string>} argv - arguments to parse
 * @return {string|number|null} argv - value of argument
 */
function parseArgv(argumentName, argv) {
    const ARGV_REGEXP = new RegExp(`^.+--${argumentName}\\s(.+?)(\\s.+$|$)`);
    const joinedArgv = argv.join(" ");

    if (ARGV_REGEXP.test(joinedArgv)) {
        return joinedArgv.match(ARGV_REGEXP)[1]
    } else {
        return null
    }
}

/**
 * Prepare folders before test
 * @private
 * @throws {Error}
 */
function prepareFolders() {
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
 * Parse gulp args
 * @private
 * @param {{env, tags, browser, i, baseUrl}} env
 * @param {string} [tempSpec] - pattern for temporary spec
 * @return {Array} array of args
 */
function parseGulpArgs(env, tempSpec) {
    const args = [
        "--specs", tempSpec || "./dist/temp_features/*.feature",
        "--params.environment", env.env,
        "--cucumberOpts.tags", env.tags,
        "--capabilities.browserName", env.browser || "chrome",
    ];

    if (env.seleniumPort) {
        args.push("--seleniumPort", env.seleniumPort);
    }

    if (env.i > 1) {
        args.push("--capabilities.shardTestFiles");
        args.push("--capabilities.maxInstances");
        args.push(env.i)
    }

    if (env.baseUrl) {
        args.push("--params.baseUrl");
        args.push(env.baseUrl);
    }

    return args

}

module.exports = {
    parseArgv,
    prepareFolders,
    parseGulpArgs,
};