/**
 * State
 * @param {State}
 */
class State {

    /**
     * Set page map
     * @param {PageMap} pageMap - page map
     */
    static setPageMap(pageMap) {
        this.pageMap = pageMap;
    }

    /**
     * Set current page by Name
     * @param {string} pageName - name of page ot set
     */
    static setPage(pageName) {
        this.page = this.pageMap.getPage(pageName).pageObject;
    }

    /**
     * Get current page
     * @return {AbstractPage} - current page
     * @throws {Error}
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