"use strict";

class CredentialDB {

    constructor() {
        this.credentials = [];
    }

    /**
     * Create credentials pool
     * @param creds
     */
    createPool(creds) {
        this.credentials = creds.map(item => {
            item.isLocked = false;
            return item
        });
    }

    /**
     * Get free credential
     * @return {*}
     */
    getCredentials() {
        const freeUserIndex = this.credentials.findIndex(item => item.isLocked === false);

        if (freeUserIndex !== -1) {
            this.credentials[freeUserIndex].isLocked = true;
            return this.credentials[freeUserIndex];
        } else {
            throw new Error("There are no free users")
        }
    }

    /**
     * Free credentials by username
     * @param username
     */
    freeCredentials(username) {
        const userIndex = this.credentials.findIndex(item => item.username === username);

        if (userIndex !== -1) {
            this.credentials[userIndex].isLocked = false;
        } else {
            throw new Error(`Username ${username} isn't found`)
        }
    }

}

module.exports = CredentialDB;