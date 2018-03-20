"use strict";

/**
 * @name CredentialManager
 * @interface
 */
class CredentialManager {

    /**
     * Create pool of userIds based on creds object
     * @param creds
     */
    static createPool(creds) {
        throw new Error("Not implemented")
    }

    /**
     * Return free credentials from pool
     */
    static getCredentials() {
        throw new Error("Not implemented")
    }


    /**
     * Free credentials
     */
    static freeCredentials() {
        throw new Error("Not implemented")
    }

}

module.exports = CredentialManager;