class Collection {

    /**
     * Constructor of collection
     * @param alias
     * @param selector
     */
    constructor(alias, selector) {
        if (!alias) {
            throw new Error("Alias is not defined")
        }

        if (!selector) {
            throw new Error("Selector is not defined")
        }

        this.alias = alias;
        this.selector = selector;
        this.isComponent = false;
        this.isCollection = true;
    }

}

module.exports = Collection;