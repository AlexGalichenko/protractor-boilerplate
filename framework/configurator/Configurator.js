const State = require("../state/State");
const Memory = require("../memory/Memory");
const CredentialManager = require("../credential_manager/ServerCredentialManager");

class Configurator {

    /**
     * Constructor of configuration object
     * @param params
     */
    constructor(params) {
        this.pageMap = params.pageMap;
        this.calculablesMap = params.calculablesMap;
        this.constantMap = params.constantMap;
    }

    /**
     * Builds configuration and returns configured State, Memory etc. classes
     * @return {{State: State, Memory: Memory, CredentialManager: ServerCredentialManager}}
     */
    build() {
        State.setPageMap(this.pageMap);
        Memory.setCalculables(this.calculablesMap);
        Memory.setConstantsInstance(this.constantMap);

        return {
            State,
            Memory,
            CredentialManager,
        }
    }

}

module.exports = Configurator;