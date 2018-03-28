const Element = require("./Element");
const Collection = require("./Collection");

class AbstractPage {

    constructor() {
        this.elements = new Map();
    }

    /**
     * Define element
     * @param alias
     * @param selector
     * @param selectorType
     * @param text
     */
    defineElement(alias, selector, selectorType, text) {
        this.elements.set(alias, new Element(alias, selector, selectorType, text))
    }

    /**
     * Define collection
     * @param alias
     * @param selectorOrComponent
     * @param selectorType
     * @param text
     */
    defineCollection(alias, selectorOrComponent, selectorType, text) {
        if (selectorOrComponent.isComponent) {
            this.elements.set(alias, selectorOrComponent)
        } else if (typeof selectorOrComponent === "string") {
            this.elements.set(alias, new Collection(alias, selectorOrComponent, selectorType, text))
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

        const {protractorElement} = tokens.reduce((current, token) => {
            return {
                protractorElement: this._getProtractorElement(current.protractorElement, current.component, token),
                component: this._getComponent(current.component, token)
            }
        }, {
            protractorElement: this._getProtractorElement(null, this, firstToken),
            component: this._getComponent(this, firstToken)
        });

        return protractorElement;
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
        const newComponent = this._newComponentCreator(currentComponent, alias);

        if (currentProtractorElement) {
            if (newComponent.isCollection) {
                return currentProtractorElement.all(this._getSelector(newComponent)).get(index)
            } else {
                throw new Error(`${alias} is not collection`)
            }
        } else {
            if (newComponent.isCollection) {
                return element.all(this._getSelector(newComponent)).get(index)
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
        const newComponent = this._newComponentCreator(currentComponent, alias);

        if (currentProtractorElement) {
            if (newComponent.isCollection) {
                return currentProtractorElement.all(this._getSelector(newComponent))
            } else {
                if (currentProtractorElement.count) {
                    return currentProtractorElement.all(this._getSelector(newComponent))
                } else {
                    return currentProtractorElement.element(this._getSelector(newComponent))
                }
            }
        } else {
            if (newComponent.isCollection) {
                return element.all(this._getSelector(newComponent))
            } else {
                return element(this._getSelector(newComponent))
            }
        }
    }

    /**
     * Function for verifying and returning element
     * @param currentComponent
     * @param alias
     * @returns {ProtractorElement|ProtractorCollection}
     * @throws Error
     * @private
     */
    _newComponentCreator(currentComponent, alias) {
        try{
            const newComponent = currentComponent.elements.get(alias);

            if (!newComponent){
                throw new Error();
            }

            return newComponent;
        } catch (e){
            throw new Error(`There is no such element: '${alias}'`) ;
        }
    }

    /**
     * Resolve element by location strategy
     * @param element {{selectorType, selector, text}}
     * @return {By}
     * @private
     */
    _getSelector(element) {
        switch (element.selectorType) {
            case "css": return by.css(element.selector);
            case "xpath": return by.xpath(element.selector);
            case "cssContainingText": {
                if (element.text) {
                    return by.cssContainingText(element.selector, element.text)
                } else {
                    throw new Error("Text is not defined")
                }
            }
            default: throw new Error(`Selector type ${element.selectorType} is not defined`);
        }
    }

    /**
     * Get component from component tree
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
     * Parse token to index value and alias
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