/**
 * @name CredentialManager
 * @interface
 */
class CredentialManager {

    /**
     * Create pool of userIds based on creds object
     * @abstract
     * @param {Object} creds
     */
    static createPool(creds) {
        throw new Error("Not implemented");
    }

    /**
     * Return free credentials from pool
     * @abstract
     */
    static getCredentials() {
        throw new Error("Not implemented");
    }


    /**
     * Free credentials
     * @abstract
     */
    static freeCredentials() {
        throw new Error("Not implemented");
    }

}

module.exports = CredentialManager;