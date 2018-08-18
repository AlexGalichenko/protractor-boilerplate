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
        .then(body => JSON.parse(body))
        .catch(e => {
            throw e
        })
    }

    /**
     * Free credentials
     * @throws {Error}
     * @example CredentialManager.freeCredentials();
     */
    static freeCredentials() {
        return this.credentials.then(credentials => {
            if (credentials) {
                return request({
                    method: "PUT",
                    uri: SERVICE_URI,
                    body: {
                        username: credentials.username
                    },
                    json: true
                })
            }
        }).catch(e => {
            throw e
        })
    }

    /**
     * Free credentials
     * @param property - property to update
     * @param value - value to update
     * @throws {Error}
     * @example CredentialManager.updateProperty("cookie", "myCookie");
     */
    static updateProperty(property, value) {
        return this.credentials.then(credentials => {
            if (credentials) {
                return request({
                    method: "PUT",
                    uri: SERVICE_URI + "/update",
                    body: {
                        username: credentials.username,
                        property: property,
                        value: value
                    },
                    json: true
                })
            }
        }).catch(e => {
            throw e
        })
    }

    /**
     * Return specified credentials by username
     * @param username - username to get
     * @return {Promise<Object>} - promise that resolves with set of credentials
     * @throws {Error}
     * @example
     * CredentialManager.getCredentialsByUsername(ta1@email.com);
     * const currentCredentials = await CredentialManager.credentials;
     */
    static getCredentialsByUsername(username) {
        this.credentials = request({
            method: "GET",
            uri: SERVICE_URI + "/" + username,
        })
        .then(body => JSON.parse(body))
        .catch(e => {
            throw e
        })
    }

}

module.exports = ServerCredentialManager;