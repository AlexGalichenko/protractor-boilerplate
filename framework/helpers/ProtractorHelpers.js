"use strict";

class ProtractorHelpers {

    /**
     * Check if element is collection
     * @param element
     * @return {boolean}
     */
    static isCollection(element) {
        return !!element.first
    }

}

module.exports = {
    isCollection: ProtractorHelpers.isCollection
};