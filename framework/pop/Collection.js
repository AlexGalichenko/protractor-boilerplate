const Element = require("./Element");

class Collection extends Element {

    /**
     * Constructor of collection
     * @param alias
     * @param selector
     * @param selectorType
     * @param text
     */
    constructor(alias, selector, selectorType = "css", text) {
        super(alias, selector, selectorType, text);
        this.isCollection = true;
    }

}

module.exports = Collection;