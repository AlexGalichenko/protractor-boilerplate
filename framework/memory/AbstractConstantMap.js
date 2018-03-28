const path = require("path");
const fs = require("fs");

class AbstractConstantMap {

    constructor() {
        this.constants = {};
        this.fileConstants = {};
    }

    /**
     * Define constant
     * @param key - key
     * @param givenValue - value
     */
    defineConstant(key, givenValue) {
        if (this.constants.hasOwnProperty(key)) {
            throw new Error(`Constant with such key: '${key}' is already created`);
        } else {
            Object.defineProperty(this, key, {
                value: givenValue,
                writable: false
            });
        }
    }

    /**
     * Define file constant
     * @param key - key of constant
     * @param path - path to file
     */
    defineFileConstant(key, path) {
        this.fileConstants[key] = path;
    }

    /**
     * Get constant value by key
     * @param key - key of file constant
     * @return {String}
     */
    getConstant(key) {
        if (!this.constants.hasOwnProperty(key)) {
            throw new Error(`No such key: '${key}'`);
        }
        return this.constants[key];
    }

    /**
     * Get file constant value by key
     * @param key - key of file constant
     * @return {String} - file content
     */
    getFileConstant(key) {
        if (this.fileConstants[key]) {
            return fs.readFileSync(path.resolve(this.fileConstants[key]))
        } else {
            throw new Error(`No such key: '${key}'`);
        }
    }

}

module.exports = AbstractConstantMap;