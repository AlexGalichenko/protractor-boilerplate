const State = require("../state/State");
const Memory = require("../memory/Memory");
const CredentialManager = require("../credential_manager/ServerCredentialManager");

class Configurator {

    constructor(params) {
        this.pageMap = params.pageMap;
        this.calculablesMap = params.calculablesMap;
        this.constantMap = params.constantMap;
    }

    build() {
        State.setPageMap(this.pageMap);
        Memory.setCalculables(this.calculablesMap);
        Memory.setConstantsInstance(this.constantMap);

        return {
            State, Memory, CredentialManager
        }
    }

}

module.exports = Configurator;