"use strict";

class State {

    /**
     * Set page map
     * @param pageMap
     */
    static setPageMap(pageMap) {
        this.pageMap = pageMap;
    }

    /**
     * Set page
     * @param pageName
     */
    static setPage(pageName) {
        const pageConstructor = this.pageMap.getPage(pageName).pageObject;
        this.page = new pageConstructor();
    }

    /**
     * Get current page
     * @return {*}
     */
    static getPage() {
        if (this.page) {
            return this.page;
        } else {
            throw new Error("Current page is not defined")
        }
    }
}

module.exports = State;