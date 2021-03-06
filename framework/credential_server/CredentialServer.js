const express = require("express");
const bodyParser = require("body-parser");
const CredentialDB = require("./CredentialDB");

/**
 * @type {CredentialServer}
 */
class CredentialServer {

    constructor() {
        this.server = express();
        this.server.use(bodyParser.json());
        this.db = new CredentialDB();

        this.server.post("/credentials", (req, res) => {
            try {
                this.db.createPool(req.body, req.query.pool);
                res.sendStatus(201);
            } catch (e) {
                res.status(500).send(null);
            }
        });

        this.server.get("/credentials", (req, res) => {
            try {
                const user = this.db.getCredentials(req.query.pool);
                res.status(200).send(user);
            } catch (e) {
                res.status(500).send(null);
            }
        });

        this.server.get("/credentials/:username", (req, res) => {
            try {
                const user = this.db.getCredentialsByUsername(req.params.username, req.query.pool);
                res.status(200).send(user);
            } catch (e) {
                res.status(500).send(null);
            }
        });

        this.server.put("/credentials", (req, res) => {
            try {
                this.db.freeCredentials(req.body.username, req.query.pool);
                res.sendStatus(200);
            } catch (e) {
                res.status(500).send(null);
            }
        });

        this.server.put("/credentials/update", (req, res) => {
            try {
                this.db.updateProperty(req.body.username, req.body.property, req.body.value, req.query.pool);
                res.sendStatus(200);
            } catch (e) {
                res.status(500).send(null);
            }
        });

        this.server.get("/state", (req, res) => {
            try {
                res.status(200).send(this.db);
            } catch (e) {
                res.status(500).send(e);
            }
        });

    }

    /**
     * Start server
     * @param {number} port - port to start the server
     */
    start(port) {
        this.server.listen(port);
    }

}

module.exports = CredentialServer;