"use strict";

const CredentialManager = require("./CredentialManager");

const fs = require("fs");
const path = require("path");
const BASE = path.resolve("./creds");

/**
 * @class
 * @implements {CredentialManager}
 */
class FileCredentialManager extends CredentialManager {

    static createPool(creds) {
        function createUserFiles() {
            creds.forEach((user, index) => {
                fs.writeFile(path.resolve(BASE + "/" + "user" + index + ".json"), JSON.stringify(user), (err) => {
                    if (err) throw err;
                })
            });
        }

        return fs.exists(path.resolve(BASE), (isFolderExist) => {
            if (isFolderExist) {
                fs.readdir(path.resolve(BASE), (err, files) => {
                    if (err) throw err;
                    files.forEach((file) => {
                        fs.unlink(path.resolve(BASE + "/" + file));
                    });
                    createUserFiles();
                });
            } else {
                fs.mkdir(BASE, (err) => {
                    if (err) throw err;
                    createUserFiles();
                });

            }
        });
    }

    static getCredentials() {
        const freeUser = fs.readdirSync(BASE).filter(item => /^.+\.json$/.test(item))[0];
        const userCreds = require(path.resolve(BASE + "/" + freeUser));
        this.fileName = freeUser;
        fs.renameSync(path.resolve(BASE + "/" + freeUser), path.resolve(BASE + "/" + freeUser + ".lock"));
        this.username = userCreds.username;
        this.password = userCreds.password;
    }

    static freeCredentials() {
        fs.renameSync(path.resolve(BASE + "/" + this.fileName + ".lock"), path.resolve(BASE + "/" + this.fileName));
        this.fileName = "";
        this.username = "";
        this.password = "";
    }

}

module.exports = FileCredentialManager;