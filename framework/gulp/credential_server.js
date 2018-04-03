const utils = require("../helpers/utils");
const CredentialServer = require("../credential_server/CredentialServer");
const credentialServerPort = utils.parseArgv("credentialServerPort", process.argv) || 3099;

const server = new CredentialServer();
server.start(credentialServerPort);