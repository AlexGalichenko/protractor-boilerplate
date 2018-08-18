/**
 * @type {CredentialDB}
 * @property {Array<Object>} credentials - array of credentials
 */
class CredentialDB {

    constructor() {
        this.credentials = [];
    }

    /**
     * Create credentials pool
     * @param {Object} creds
     */
    createPool(creds) {
        const FREE_USER_TIMEOUT = 10 * 60 * 1000;

        this.credentials = creds.map(item => {
            item.isLocked = false;
            item.freeTimeout = function() {
                setTimeout(() => {
                    this.isLocked = false;
                }, FREE_USER_TIMEOUT)
            };
            return item
        });
    }

    /**
     * Get free credential
     * @return {Object}
     * @throws {Error}
     */
    getCredentials() {
        const freeUserIndex = this.credentials.findIndex(item => item.isLocked === false);

        if (freeUserIndex !== -1) {
            this.credentials[freeUserIndex].isLocked = true;
            this.credentials[freeUserIndex].freeTimeout();
            return this.credentials[freeUserIndex];
        } else {
            throw new Error("There are no free users");
        }
    }

    /**
     * Free credentials by username
     * @param {string} username - username to free
     */
    freeCredentials(username) {
        const userIndex = this.credentials.findIndex(item => item.username === username);

        if (userIndex !== -1) {
            this.credentials[userIndex].isLocked = false;
        }
    }

    /**
     * Update property
     * @param {string} username - username to update
     * @param {string} property - property to update
     * @param {any} value - value of property
     * @throws {Error}
     */
    updateProperty(username, property, value) {
        const userIndex = this.credentials.findIndex(item => item.username === username);

        if (userIndex !== -1) {
            this.credentials[userIndex][property] = value;
        } else {
            throw new Error("User with " + username + " is not found");
        }
    }

    /**
     * Get credentials by username
     * @param username - username to search for user
     * @return {Object}
     * @throws {Error}
     */
    getCredentialsByUsername(username) {
        const freeUserIndex = this.credentials.findIndex(item => item.username === username);

        if (freeUserIndex !== -1) {
            this.credentials[freeUserIndex].isLocked = true;
            this.credentials[freeUserIndex].freeTimeout();
            return this.credentials[freeUserIndex];
        } else {
            throw new Error("There are no users with username: " + username);
        }
    }

}

module.exports = CredentialDB;