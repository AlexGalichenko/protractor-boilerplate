const path = require("path");
const COMMANDS = {
  CHECK: "check",
  SEARCH: "search"
};

const command = process.argv[2];
const classPath = process.argv[3];
const term = process.argv[4];
const po = require(path.resolve(classPath));
const constructedPO = new po();

switch (command) {
    case COMMANDS.CHECK: showCollection(constructedPO); break;
    case COMMANDS.SEARCH: search(constructedPO, term); break;
    default: throw new Error("command is not defined");
}

function showCollection(collection, level = 0) {
    const prefix = level ? "\u2517\u2501".padStart(level + 2, " ") : "";
    for (let element of collection.elements.entries()) {
        if (element[1].elements) {
            console.log(`${prefix}${element[0]} => ${element[1].selector}`);
            showCollection(element[1], level + 1)
        } else {
            console.log(`${prefix}${element[0]} => ${element[1].selector}`)
        }
    }
}

function search(collection, term) {
    for (let element of collection.elements.entries()) {
        if (element[1].elements) {
            search(element[1], term)
        } else {
            if (element[1].selector.includes(term)) {
                console.log(`${element[0]} => ${element[1].selector}`)
            }
        }
    }
}

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}