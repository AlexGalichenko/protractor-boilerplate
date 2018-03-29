"use strict";

class Memory {

    /**
     * @param calculablesInstance - instance of calculables map
     */
    static setCalculables(calculablesInstance) {
        this.calculablesInstance = calculablesInstance;
    }
    /**
     * @param constantsInstance - instance of constants map
     */
    static setConstantsInstance(constantsInstance) {
        this.constantsInstance = constantsInstance;
    }

    /**
     * bind value to memory class
     * @param key
     * @param value
     */
    static setValue(key, value) {
        if (!this.memory) {
            this.memory = {}
        }

        this.memory[key] = value;
    }

    /**
     * return value if exists in memory
     * @param key
     * @return {string} parsed value
     * @throws {Error}
     */
    static parseValue(key) {
        const MEMORY_REGEXP = /^(\$|#|!|!!)?([^$#!].+)$/;
        const [_, prefix, parsedKey] = key.match(MEMORY_REGEXP);

        switch (prefix) {
            case "$": return this._getMemoryValue(parsedKey);
            case "#": return this._getCalculableValue(parsedKey);
            case "!": return this._getConstantValue(parsedKey);
            case "!!": return this._getFileConstantValue(parsedKey);
            case undefined: return parsedKey;
            default: throw new Error(`${parsedKey} is not defined`)
        }

    }

    /**
     * Return value from memory
     * @param alias
     * @return {*}
     * @private
     */
    static _getMemoryValue(alias) {
        if (this.memory[alias]) {
            return this.memory[alias];
        } else {
            throw new Error(`Value ${alias} doesn't exist in memory`)
        }
    }

    /**
     * Retuern calculated value
     * @param alias
     * @return {*}
     * @private
     */
    static _getCalculableValue(alias) {
        if (this.calculablesInstance) {
            return this.calculablesInstance.getCalculable(alias)
        }
        else throw new Error(`Instance of calculables is not defined`)
    }

    /**
     * Return constant value
     * @param key
     * @return {*}
     * @private
     */
    static _getConstantValue(key) {
        if (this.constantsInstance) {
            return this.constantsInstance.getConstant(key)
        }
        else throw new Error(`Instance of constant is not defined`)
    }

    /**
     * Return file constant value
     * @param key
     * @return {*}
     * @private
     */
    static _getFileConstantValue(key) {
        if (this.constantsInstance) {
            return this.constantsInstance.getFileConstant(key)
        }
        else throw new Error(`Instance of constant is not defined`)
    }

}

module.exports = Memory;