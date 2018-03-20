"use strict";

class PageManager {

    /**
     * Returns function which automatically defines of current page
     * @param pageMap - instance of PageMap;
     */
    static getPage(pageMap) {
        return function () {
            return browser.getCurrentUrl().then(currentUrl => {
                let pageDefinitions = pageMap.pages;
                let pageClass = pageDefinitions.find(pageDefinition => {
                    return new RegExp(pageDefinition.selector).test(currentUrl);
                });
                return new pageClass.pageObject();
            });

        }
    }

}

module.exports = PageManager;