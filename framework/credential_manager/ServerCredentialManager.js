const utils = require("../helpers/utils");
const path = require("path");
const request = require("request-promise");
const credentialServerPort = utils.parseArgv("credentialServerPort", process.argv) || 3099;
const SERVICE_URI = "http://localhost:" + credentialServerPort + "/credentials";

/**
 * Class representing Credential Manager
 */
class ServerCredentialManager {

    /**
     * Create pool of userIds based on creds object
     * @param {Object} creds - set of user credentials
     * @throws {Error}
     * @example CredentialManager.createPool(credentials);
     */
    static createPool(creds) {
        return request({
            method: "POST",
            uri: SERVICE_URI,
            body: creds,
            json: true
        })
        .catch(e => {
            throw new Error("Credential pool has not been created")
        })
    }

    /**
     * Return free credentials from pool
     * @return {Promise<Object>} - promise that resolves with set of credentials
     * @throws {Error}
     * @example 
     * CredentialManager.getCredentials();
     * const currentCredentials = await CredentialManager.credentials;
     */
    static getCredentials() {
        this.credentials = request({
            method: "GET",
            uri: SERVICE_URI,
        })
        .then((body) => JSON.parse(body))
        .catch(e => {
            throw new Error("Cannot get credentials")
        })
    }

    /**
     * Free credentials
     * @throws {Error}
     * @example CredentialManager.freeCredentials();
     */
    static freeCredentials() {
        return this.credentials.then(credentials => {
            return request({
                method: "PUT",
                uri: SERVICE_URI,
                body: {
                    username: credentials.username
                },
                json: true
            })
        }).catch(e => {
            throw new Error("Cannot free credentials")
        })
    }


}

module.exports = ServerCredentialManager;