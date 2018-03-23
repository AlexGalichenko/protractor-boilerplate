class Element {

    /**
     * Constructor of simple element
     * @param alias
     * @param selector
     * @param selectorType
     * @param text
     */
    constructor(alias, selector, selectorType = "css", text) {
        if (!alias) {
            throw new Error(`Alias of ${this.constructor.name} is not defined`)
        }

        if (!selector) {
            throw new Error(`Selector of ${this.constructor.name} is not defined`)
        }

        this.alias = alias;
        this.selector = selector;
        this.selectorType = selectorType;
        this.text = text;
        this.isComponent = false;
        this.isCollection = false;
    }

}

module.exports = Element;