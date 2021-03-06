const Memory = require("./Memory");
const path = require("path");
const fs = require("fs");

/**
 * Class representing Constant Map
 * @abstract 
 * @type {AbstractConstantMap}
 */
class AbstractConstantMap {

    constructor() {
        this.constants = {};
        this.fileConstants = {};
    }

    /**
     * Define constant
     * @param {string} key - key
     * @param {any} givenValue - value
     * @example
     * class ConstantsMap extends AbstractConstantsMap {
     *   constructor() {
     *       super();
     *       this.defineConstant("key", "value")
     *   }
     * }
     */
    defineConstant(key, givenValue) {
        if (this.constants[key] !== undefined) {
            throw new Error(`Constant with such key: '${key}' is already created`);
        } else {
            Object.defineProperty(this.constants, key, {
                value: givenValue,
                writable: false
            });
        }
    }

    /**
     * Define file constant
     * @param {string} key - key of constant
     * @param {string} path - path to file
     * @example
     * class ConstantsMap extends AbstractConstantsMap {
     *   constructor() {
     *       super();
     *       this.defineFileConstant("key", "./path")
     *   }
     * }
     */
    defineFileConstant(key, path) {
        if (this.fileConstants[key] !== undefined) {
            throw new Error(`Constant with such key: '${key}' is already created`);
        } else {
            Object.defineProperty(this.fileConstants, key, {
                value: path,
                writable: false
            });
        }
    }

    /**
     * Get constant value by key
     * @param {string} key - key of file constant
     * @return {string}
     */
    getConstant(key) {
        if (this.constants[key] !== undefined) {
            return this.constants[key]
        } else {
            throw new Error(`No such key: '${key}'`);
        }
    }

    /**
     * Get file constant value by key
     * @param {string} key - key of file constant
     * @return {string|Buffer} - file content in utf8
     */
    getFileConstant(key) {
        if (this.fileConstants[key] !== undefined) {
            return fs.readFileSync(path.resolve(this.fileConstants[key]), "utf8")
        } else {
            throw new Error(`No such key: '${key}'`);
        }
    }

    /**
     * Assign map to memory
     * @example
     * class ConstantMap extends AbstractConstantMap {
     *   constructor() {
     *     super();
     *     this.defineConstant(/^numberOne$/, "1");
     *   }
     *}
     *
     * new ConstantMap.init();
     */
    init() {
        Memory.setConstantsInstance(this);
    }

}

module.exports = AbstractConstantMap;