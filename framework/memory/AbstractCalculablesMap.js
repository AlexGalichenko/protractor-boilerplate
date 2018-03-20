"use strict";

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
        this.calculables.push({
            signature: signature,
            lambda: lambda
        })
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
        const parsedSignature = signature.match(PARSE_REGEXP);

        if (parsedSignature && parsedSignature.length > 1) {
            return parsedSignature[1].split(/,\s*/);
        } else return []

    }

}

module.exports = AbstractCalculablesMap;