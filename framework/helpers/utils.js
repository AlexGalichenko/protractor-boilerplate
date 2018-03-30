function parseArgv(argumentName, argv) {
    const ARGV_REGEXP = new RegExp(`^.+--${argumentName}\\s(.+?)(\\s.+$|$)`);
    let arg = null;
    try {
        arg = argv.join(" ").match(ARGV_REGEXP)[1];
    }
    catch(e) {}
    return arg
}

module.exports = {
    parseArgv
};