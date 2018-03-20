"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const CredentialDB = require("./CredentialDB");

class CredentialServer {

    constructor() {
        this.server = express();
        this.server.use(bodyParser.json());
        this.db = new CredentialDB();

        this.server.post("/credentials", (req, res) => {
            try {
                this.db.createPool(req.body);
                res.sendStatus(201);
            } catch (e) {
                res.status(500).send(e);
            }
        });

        this.server.get("/credentials", (req, res) => {
            try {
                const user = this.db.getCredentials();
                res.status(200).send(user);
            } catch (e) {
                res.status(500).send(e);
            }
        });

        this.server.put("/credentials", (req, res) => {
            try {
                this.db.freeCredentials(req.body.username);
                res.sendStatus(200);
            } catch (e) {
                res.status(500).send(e);
            }
        });

    }

    start(port) {
        this.server.listen(port);
    }

}

module.exports = CredentialServer;