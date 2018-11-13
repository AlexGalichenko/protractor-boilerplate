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
     * @param {string} pool - name of pool
     */
    createPool(creds, pool) {
        const FREE_USER_TIMEOUT = 10 * 60 * 1000;

        const credentials = creds.map(item => {
            item.isLocked = false;
            item.freeTimeout = function() {
                this.timeout = setTimeout(() => {
                    this.isLocked = false;
                }, FREE_USER_TIMEOUT)
            };
            return item
        });

        if (pool) {
            this[pool] = credentials;
        } else {
            this.credentials = credentials;
        }
    }

    /**
     * Get free credential
     * @param {string} pool - name of pool
     * @return {Object}
     * @throws {Error}
     */
    getCredentials(pool) {
        let poolRef = this.credentials;
        if (pool) {
            if (!this[pool]) throw new Error("Pool " + pool + "doesn't exist");
            poolRef = this[pool];
        }
        const freeUserIndex = poolRef.findIndex(item => item.isLocked === false);

        if (freeUserIndex !== -1) {
            poolRef[freeUserIndex].isLocked = true;
            poolRef[freeUserIndex].freeTimeout();
            const normalizedObject = Object.assign({}, poolRef[freeUserIndex]);
            normalizedObject.timeout = null;
            console.log(poolRef[freeUserIndex].timeout);
            console.log(normalizedObject.timeout);
            return normalizedObject;
        } else {
            throw new Error("There are no free users");
        }
    }

    /**
     * Free credentials by username
     * @param {string} pool - name of pool
     * @param {string} username - username to free
     */
    freeCredentials(username, pool) {
        let poolRef = this.credentials;
        if (pool) {
            if (!this[pool]) throw new Error("Pool " + pool + "doesn't exist");
            poolRef = this[pool];
        }
        const userIndex = poolRef.findIndex(item => item.username === username);

        if (userIndex !== -1) {
            poolRef[userIndex].isLocked = false;
            clearTimeout(poolRef[userIndex].timeout);
        }
    }

    /**
     * Update property
     * @param {string} username - username to update
     * @param {string} property - property to update
     * @param {any} value - value of property
     * @param {string} pool - name of pool
     * @throws {Error}
     */
    updateProperty(username, property, value, pool) {
        let poolRef = this.credentials;
        if (pool) {
            if (!this[pool]) throw new Error("Pool " + pool + "doesn't exist");
            poolRef = this[pool];
        }
        const userIndex = poolRef.findIndex(item => item.username === username);

        if (userIndex !== -1) {
            poolRef[userIndex][property] = value;
        } else {
            throw new Error("User with " + username + " is not found");
        }
    }

    /**
     * Get credentials by username
     * @param username - username to search for user
     * @param {string} pool - name of pool
     * @return {Object}
     * @throws {Error}
     */
    getCredentialsByUsername(username, pool) {
        let poolRef = this.credentials;
        if (pool) {
            if (!this[pool]) throw new Error("Pool " + pool + "doesn't exist");
            poolRef = this[pool];
        }
        const freeUserIndex = poolRef.findIndex(item => item.username === username);

        if (freeUserIndex !== -1) {
            poolRef[freeUserIndex].isLocked = true;
            poolRef[freeUserIndex].freeTimeout();
            const normalizedObject = Object.assign({}, poolRef[freeUserIndex]);
            normalizedObject.timeout = null;
            return normalizedObject;
        } else {
            throw new Error("There are no users with username: " + username);
        }
    }

}

module.exports = CredentialDB;