const State = require("../state/State");

/**
 * @abstract
 * @type {AbstractPageMap}
 */
class AbstractPageMap {

    constructor() {
        this.pages = new Map();
    }

    /**
     * Define page by page selector
     * @example this.definePage("Your Page", /^.+page.html$/, new YourPage()) //define new page with regexp selector
     * @param {string} alias - alias of page
     * @param {RegExp} selector - regexp selector of page
     * @param {AbstractPage} pageObject - constructed page
     */
    definePage(alias, selector, pageObject) {
        this.pages.set(alias, new PageDefinition(alias, selector, pageObject))
    }

    /**
     * Get page definition by alias
     * @param {string} alias - alias of page definition
     * @return {PageDefinition} - page definition by alias
     */
    getPage(alias) {
        const page = this.pages.get(alias);
        if (page) {
            return page
        } else {
            throw new Error(`${alias} page is not defined`)
        }
    }

    init() {
        State.setPageMap(this);
    }

}

class PageDefinition {

    /**
     * Page definition
     * @param {string} alias 
     * @param {RegExp} selector 
     * @param {AbstractPage} pageObject 
     */
    constructor(alias, selector, pageObject) {
        this.alias = alias;
        this.selector = selector;
        this.pageObject = pageObject;
    }

}

module.exports = AbstractPageMap;