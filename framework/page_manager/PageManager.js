class PageManager {

    /**
     * Returns function which automatically defines of current page
     * @param pageMap - instance of PageMap
     * @return {Function} - current page
     */
    static getPage(pageMap) {
        return function () {
            return browser.getCurrentUrl().then(currentUrl => {
                let pageDefinitions = pageMap.pages;
                return pageDefinitions.find(pageDefinition => new RegExp(pageDefinition.selector).test(currentUrl));
            });
        }
    }

}

module.exports = PageManager;