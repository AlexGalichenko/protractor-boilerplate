const Memory = require("../memory/Memory");
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
     * @param selector
     * @param selectorType
     * @param text
     */
    defineCollection(alias, selector, selectorType, text) {
        this.elements.set(alias, new Collection(alias, selector, selectorType, text))
    }

    /**
     * Define component
     * @param alias
     * @param component
     */
    defineComponent(alias, component) {
        this.elements.set(alias, component)
    }

    /**
     * Get element by key
     * @param key
     * @return {ProtractorElement|ProtractorCollection}
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
     * Get protractor single element or collection of elements or element from collection
     * @param currentProtractorElement
     * @param currentComponent
     * @param token
     * @return {ProtractorElement|ProtractorCollection}
     * @private
     */
    _getProtractorElement(currentProtractorElement, currentComponent, token) {
        const {index, alias, innerText} = this._parseToken(token);
        if (index !== null) {
            return this._getElementOfCollection(currentProtractorElement, currentComponent, alias, index, innerText)
        }
        return this._getElementOrCollection(currentProtractorElement, currentComponent, alias)
    }

    /**
     * Get protractor element by index or text
     * @param currentProtractorElement
     * @param currentComponent
     * @param alias
     * @param index
     * @param innerText
     * @return {ProtractorElement}
     * @private
     */
    _getElementOfCollection(currentProtractorElement, currentComponent, alias, index, innerText) {
        const newComponent = this._newComponentCreator(currentComponent, alias);
        const rootElement = currentProtractorElement ? currentProtractorElement : element(by.css("body"));

        if (newComponent.isCollection) {
                if (!innerText) {
                    return rootElement.all(this._getSelector(newComponent)).get(index)
                } else {
                    try {
                        return rootElement
                            .all(this._getSelector(newComponent))
                            .filter(elem => elem.getText() === innerText)
                            .first();
                    } catch (e) {
                        throw new Error(`There is no elements with '${innerText}' text`);
                    }
                }
            } else {
                throw new Error(`${alias} is not collection`)
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
        const rootElement = currentProtractorElement ? currentProtractorElement : element(by.css("body"));

        if (newComponent.isCollection || rootElement.count) {
            return rootElement.all(this._getSelector(newComponent))
        } else {
            return rootElement.element(this._getSelector(newComponent))
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
        if (currentComponent.elements.has(alias)) {
            return currentComponent.elements.get(alias)
        } else {
            throw new Error(`There is no such element: '${alias}'`)
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
     * Parse token to index or text value and alias
     * @param token
     * @return {*}
     * @private
     */
    _parseToken(token) {
        const ELEMENT_OF_COLLECTION_REGEXP = /#([!\$]?\w+)\s+(in|of)\s+(.+)/;
        if (ELEMENT_OF_COLLECTION_REGEXP.test(token)) {
            const parsedTokens = token.match(ELEMENT_OF_COLLECTION_REGEXP);
            const rememberedValue = this._getValueFromMemory(parsedTokens[1]);
            return {
                index: parsedTokens[2] === "of" ? rememberedValue : 0,
                innerText: parsedTokens[2] === "in" ? rememberedValue : null,
                alias: parsedTokens[3]
            }
        } else return {
            index: null,
            alias: token,
            innerText: null
        }
    }

    /**
     * Get value from memory or given value
     * @param value
     * @returns {*}
     * @private
     */
    _getValueFromMemory(value) {
        let prefix = value.charAt(0);
        switch (prefix) {
            case "!": return Memory.parseValue(value);
            case "$": return Memory.parseValue(value);
            default: try {
                return Memory.parseValue(`#${value}`);
            } catch (e){
                return value - 1;
            }
        }
    }

}

module.exports = AbstractPage;