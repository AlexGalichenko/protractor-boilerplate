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
        this.page = this.pageMap.getPage(pageName).pageObject;
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