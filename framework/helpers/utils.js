function parseArgv(argumentName, argv) {
    const ARGV_REGEXP = new RegExp(`^.+--${argumentName}\\s(.+?)\\s*.*$`);
    let arg = null;
    try {
        const [_, arg] = argv.join(" ").match(ARGV_REGEXP);
        return arg
    } catch(e) {
        return arg
    }
}

module.exports = {
    parseArgv
};