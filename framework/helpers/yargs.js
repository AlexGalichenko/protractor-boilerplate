module.exports.argv = require("yargs")
    .option("env", {
        demandOption: true,
        describe: "environment",
        message: "please set --env argument"
    })
    .option("tags", {
        describe: "tags",
    })
    .option("credentialServerPort", {
        alias: "csp",
        describe: "credentialServerPort",
    })
    .option("browserName", {
        alias: "browser",
        describe: "browserName",  
    })
    .option("maxInstances", {
        alias: "i",
        describe: "maxInstances",   
    })
    .option("baseUrl", {
        describe: "baseUrl",
    })
    .option("debug", {
        describe: "debug",
    });