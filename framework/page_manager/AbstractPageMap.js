/**
 * @abstract
 */
class AbstractPageMap {

    constructor() {
        this.pages = new Map();
    }

    /**
     * @param alias - alias of page
     * @param selector - regexp selector of page
     * @param pageObject - class of page
     */
    definePage(alias, selector, pageObject) {
        this.pages.set(alias, {
            alias: alias,
            selector: selector,
            pageObject: pageObject
        })
    }

    /**
     * Get page definition by alias
     * @param alias - alias of page definition
     * @return {Object} - page definition by alias
     */
    getPage(alias) {
        const page = this.pages.get(alias);
        if (page) {
            return page
        } else {
            throw new Error(`${alias} page is not defined`)
        }
    }

}

module.exports = AbstractPageMap;