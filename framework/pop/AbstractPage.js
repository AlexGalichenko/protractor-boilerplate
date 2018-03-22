const Element = require("./Element");
const Collection = require("./Collection");

class AbstractPage {

    constructor() {
        this.elements = new Map();
    }

    /**
     *
     * @param alias
     * @param selector
     */
    defineElement(alias, selector) {
        this.elements.set(alias, new Element(alias, selector))
    }

    /**
     *
     * @param alias
     * @param selectorOrComponent
     */
    defineCollection(alias, selectorOrComponent) {
        if (selectorOrComponent.isComponent) {
            this.elements.set(alias, selectorOrComponent)
        } else if (typeof selectorOrComponent === "string") {
            this.elements.set(alias, new Collection(alias, selectorOrComponent))
        }
    }

    /**
     *
     * @param alias
     * @param component
     */
    defineComponent(alias, component) {
        this.elements.set(alias, component)
    }

    /**
     * @param key
     * @return {*}
     */
    getElement(key) {
        const tokens = key.split(/\s*>\s*/);
        const firstToken = tokens.shift();
        // let currentProtractorElement = this._getProtractorElement(null, this, firstToken);
        // let currentComponent = this._getComponent(this, firstToken);
        //
        // for (let token of tokens) {
        //     currentProtractorElement = this._getProtractorElement(currentProtractorElement, currentComponent, token);
        //     currentComponent = this._getComponent(currentComponent, token);
        // }

        const {currentProtractorElement, currentComponent} = tokens.reduce((current, token) => {
            const currentComponent = this._getComponent(current.component, token);
            const currentProtractorElement = this._getProtractorElement(current.protractorElement, currentComponent, token);
            return {
                protractorElement: currentProtractorElement,
                component: currentComponent
            }
        }, {
            protractorElement: this._getProtractorElement(null, this, firstToken),
            component: this._getComponent(this, firstToken)
        });

        return currentProtractorElement;
    }

    /**
     *
     * @param currentProtractorElement
     * @param currentComponent
     * @param token
     * @return {ProtractorElement|ProtractorCollection}
     * @private
     */
    _getProtractorElement(currentProtractorElement, currentComponent, token) {
        const {index, alias} = this._parseToken(token);
        if (index !== null) {
            return this._getElementOfCollection(currentProtractorElement, currentComponent, alias, index)
        } else {
            return this._getElementOrCollection(currentProtractorElement, currentComponent, alias)
        }
    }

    /**
     * Get protractor element by index
     * @param currentProtractorElement
     * @param currentComponent
     * @param alias
     * @param index
     * @return {ProtractorElement}
     * @private
     */
    _getElementOfCollection(currentProtractorElement, currentComponent, alias, index) {
        const newElement = currentComponent.elements.get(alias);
        if (currentProtractorElement) {
            if (newElement.isCollection) {
                return currentProtractorElement.all(by.css(newElement.selector)).get(index)
            } else {
                throw new Error(`${alias} is not collection`)
            }
        } else {
            if (newElement.isCollection) {
                return element.all(by.css(newElement.selector)).get(index)
            } else {
                throw new Error(`${alias} is not collection`)
            }
        }
    }

    /**
     * Get protractor element or collection
     * @param currentProtractorElement
     * @param currentComponent
     * @param alias
     * @return {ProtractorElement|ProtractorCollection}
     * @private
     */
    _getElementOrCollection(currentProtractorElement, currentComponent, alias) {
        const newElement = currentComponent.elements.get(alias);
        if (currentProtractorElement) {
            if (newElement.isCollection) {
                return currentProtractorElement.all(by.css(newElement.selector))
            } else {
                if (currentProtractorElement.count) {
                    return currentProtractorElement.all(by.css(newElement.selector))
                } else {
                    return currentProtractorElement.element(by.css(newElement.selector))
                }
            }
        } else {
            if (newElement.isCollection) {
                return element.all(by.css(newElement.selector))
            } else {
                return element(by.css(newElement.selector))
            }
        }
    }

    /**
     *
     * @param currentComponent
     * @param token
     * @return {V}
     * @private
     */
    _getComponent(currentComponent, token) {
        const {index, alias} = this._parseToken(token);
        return currentComponent.elements.get(alias);
    }

    /**
     *
     * @param token
     * @return {*}
     * @private
     */
    _parseToken(token) {
        const ELEMENT_OF_COLLECTION_REGEXP = /#(\d+)\s+of\s+(.+)/;
        if (ELEMENT_OF_COLLECTION_REGEXP.test(token)) {
            const parsedTokens = token.match(ELEMENT_OF_COLLECTION_REGEXP);
            return {
                index: parsedTokens[1] - 1,
                alias: parsedTokens[2]
            }
        } else return {
            index: null,
            alias: token
        }
    }

}

module.exports = AbstractPage;