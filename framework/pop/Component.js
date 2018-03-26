const AbstractPage = require("./AbstractPage");

class Component extends AbstractPage {

    /**
     * Constructor of component or collection of components
     * @param alias
     * @param selector
     * @param isCollection
     * @param selectorType
     * @param text
     */
    constructor(alias, selector, isCollection, selectorType = "css", text) {
        super();

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
        this.isComponent = true;
        this.isCollection = isCollection;
    }

}

module.exports = Component;