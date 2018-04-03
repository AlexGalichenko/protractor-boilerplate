const fs = require("fs");
const path = require("path");

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
 * @param env {{env, tags, browser, instances, baseUrl}}
 * @return {Array} array of args
 */
function parseGulpArgs(env) {
    const args = [
        "--params.environment", env.env,
        "--cucumberOpts.tags", env.tags,
        "--capabilities.browserName", env.browser || "chrome",
    ];

    if (env.instances > 1) {
        args.push("--capabilities.shardTestFiles");
        args.push("--capabilities.maxInstances");
        args.push(env.instances)
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
    parseGulpArgs
};