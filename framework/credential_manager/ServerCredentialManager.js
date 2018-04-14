const utils = require("../helpers/utils");
const path = require("path");
const request = require("request-promise");
const CredentialManager = require("./CredentialManager");
const credentialServerPort = utils.parseArgv("credentialServerPort", process.argv) || 3099;

/**
 * @implements {CredentialManager}
 */
class ServerCredentialManager extends CredentialManager {

    /**
     * Create pool of userIds based on creds object
     * @param creds
     */
    static createPool(creds) {
        return request({
            method: "POST",
            uri: "http://localhost:" + credentialServerPort + "/credentials",
            body: creds,
            json: true
        })
        .catch(e => {
            throw new Error("Credential pool has not been created")
        })
    }

    /**
     * Return free credentials from pool
     */
    static getCredentials() {
        this.credentials = request({
            method: "GET",
            uri: "http://localhost:" + credentialServerPort + "/credentials",
        })
        .then((body) => JSON.parse(body))
        .catch(e => {
            throw new Error("Cannot get credentials")
        })
    }

    /**
     * Free credentials
     */
    static freeCredentials() {
        return this.credentials.then(credentials => {
            return request({
                method: "PUT",
                uri: "http://localhost:" + credentialServerPort + "/credentials",
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