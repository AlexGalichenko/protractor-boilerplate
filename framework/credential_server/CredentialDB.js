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
            throw new Error("There are no free users")
        }
    }

    /**
     * Free credentials by username
     * @param {string} username - username to free
     * @throws {Error}
     */
    freeCredentials(username) {
        const userIndex = this.credentials.findIndex(item => item.username === username);

        if (userIndex !== -1) {
            this.credentials[userIndex].isLocked = false;
        }
    }

}

module.exports = CredentialDB;