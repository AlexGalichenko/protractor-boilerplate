"use strict";

/**
 * @abstract
 */
class AbstractPageMap {

    constructor() {
        this.pages = [];
    }

    /**
     * @param alias - alias of page
     * @param selector - regexp selector of page
     * @param pageObject - class of page
     */
    definePage(alias, selector, pageObject) {
        this.pages.push({
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
        const page = this.pages.find(item => item.alias === alias);
        if (page) {
            return page
        } else {
            throw new Error(`${alias} page is not defined`)
        }
    }

}

module.exports = AbstractPageMap;