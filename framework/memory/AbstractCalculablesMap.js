const Memory = require("./Memory");

class AbstractCalculablesMap {

    constructor() {
        this.calculables = [];
    }

    /**
     * Define calculable value
     * @param signature - signature of calculable
     * @param lambda - function to calculate calculable
     */
    defineCalculable(signature, lambda) {
        this.calculables.push(new Calculable(signature, lambda))
    }

    /**
     * Get calculated value of defined calculable
     * @param signature - signature of calculable value
     * @return {*} - calculated value
     */
    getCalculable(signature) {
        const calculable = this.calculables.find(item => item.signature.test(signature));
        if (calculable) {
            return calculable.lambda(this._getArguments(signature));
        } else {
            throw new Error(`${signature} calculable is not defined`)
        }
    }

    /**
     * Parse signature and get arguments
     * @param signature - signature to parse
     * @return {Array<String>}
     * @private
     */
    _getArguments(signature) {
        const PARSE_REGEXP = /^.+?\((.+)\)$/;
        const SPLIT_ARGS_REGEXP = /\s*,\s*/;
        if (PARSE_REGEXP.test(signature)) {
            return signature.match(PARSE_REGEXP)[1].split(SPLIT_ARGS_REGEXP)
        } else return []
    }

    /**
     * Assign map to memory
     */
    init() {
        Memory.setCalculablesInstance(this);
    }

}

class Calculable {

    /**
     * Constructor of calculable
     * @param signature {RegExp} - signature of calculable
     * @param lambda {Function} - function to calculate calculable
     */
    constructor (signature, lambda) {
        this.signature = signature;
        this.lambda = lambda;
    }

}

module.exports = AbstractCalculablesMap;