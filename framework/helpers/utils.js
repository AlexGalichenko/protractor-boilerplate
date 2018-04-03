function parseArgv(argumentName, argv) {
    const ARGV_REGEXP = new RegExp(`^.+--${argumentName}\\s(.+?)(\\s.+$|$)`);
    const joinedArgv = argv.join(" ");

    if (ARGV_REGEXP.test(joinedArgv)) {
        return joinedArgv.match(ARGV_REGEXP)[1]
    } else {
        return null
    }
}

module.exports = {
    parseArgv
};