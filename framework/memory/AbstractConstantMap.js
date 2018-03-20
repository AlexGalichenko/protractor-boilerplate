"use strict";

class AbstractConstantMap {

    constructor() {
        this.constants = {};
    }

    setConstant(key, givenValue) {
        const onlyReadableObject = {};
        if (this.constants.hasOwnProperty(key)) {
            throw new Error(`Constant with such key: '${key}' is already created`);
        } else {
            Object.defineProperty(onlyReadableObject, key, {
                value: givenValue,
                writable: false
            });
            this.constants[key] = onlyReadableObject;
        }
    }

    getConstant(key) {
        if (!this.constants.hasOwnProperty(key)) {
            throw new Error(`No such key: '${key}'`);
        }
        return this.constants[key][key];
    }

}

module.exports = AbstractConstantMap;