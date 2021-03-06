/**
 * Class representing Memory
 * @type {Memory}
 */
class Memory {

    /**
     * Set calculable instance
     * @example Memory.setCalculablesInstance(new yourCalculablesInstance())
     * @param {AbstractCalculablesMap} calculablesInstance - instance of calculables map
     */
    static setCalculablesInstance(calculablesInstance) {
        this.calculablesInstance = calculablesInstance;
    }

    /**
     * Set constant instance
     * @example Memory.setConstantsInstance(new yourConstantsInstance())
     * @param {AbstractConstantMap} constantsInstance - instance of constants map
     */
    static setConstantsInstance(constantsInstance) {
        this.constantsInstance = constantsInstance;
    }

    /**
     * Bind value to memory class
     * @param {string} key - key
     * @param {string} value - value
     * @example Memory.setValue("key", 1)
     */
    static setValue(key, value) {
        if (!this.memory) {
            this.memory = {}
        }

        this.memory[key] = value;
    }

    /**
     * Returns value if exists in memory
     * @param {string} key - key
     * @return {string|number|Object} - parsed value
     * @throws {Error}
     * @example Memory.parseValue("$key")
     */
    static parseValue(key) {
        const MEMORY_REGEXP = /^(\$|#|!{1,2})?([^$#!]?.+)$/;

        if (MEMORY_REGEXP.test(key)) {
            const [_, prefix, parsedKey] = key.match(MEMORY_REGEXP);
            switch (prefix) {
                case "$": return this._getMemoryValue(parsedKey);
                case "#": return this._getCalculableValue(parsedKey);
                case "!": return this._getConstantValue(parsedKey);
                case "!!": return this._getFileConstantValue(parsedKey);
                case undefined: return parsedKey;
                default: throw new Error(`${parsedKey} is not defined`)
            }
        } else {
            return key
        }
    }

    /**
     * Return value from memory
     * @param {string} alias - key
     * @return {string|number|Object} - value by key
     * @private
     */
    static _getMemoryValue(alias) {
        if (this.memory[alias] !== undefined) {
            return this.memory[alias];
        } else {
            throw new Error(`Value ${alias} doesn't exist in memory`)
        }
    }

    /**
     * Return calculated value
     * @param {string} alias - key
     * @return {string|number|Object} - value by key
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
     * @param {string} key - key
     * @return {string|number|Object} - value by key
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
     * @param {string} key - key
     * @return {string|Buffer} - value by key
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