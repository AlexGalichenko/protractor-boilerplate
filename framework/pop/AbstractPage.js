const Memory = require("../memory/Memory");
const Element = require("./Element");
const Collection = require("./Collection");

/**
 * @abstract 
 * @type {AbstractPage}
 */
class AbstractPage {

    constructor() {
        this.elements = new Map();
    }

    /**
     * Define element on page
     * @example this.defineElement("YourElement", "div > div", "cssContainingText", "some text") //define element by provided selector
     * @param {string} alias - alias
     * @param {string} selector - selector 
     * @param {string} [selectorType] - selector type (css, cssContainingText, xpath) (default css)
     * @param {string} [text] - text (for cssContainingText selector type)
     */
    defineElement(alias, selector, selectorType, text) {
        this.elements.set(alias, new Element(alias, selector, selectorType, text))
    }

    /**
     * Define collection on page
     * @example this.defineCollection("YourCollection", "div > div", "cssContainingText", "some text") //define collection by provided selector
     * @param {string} alias - alias
     * @param {string} selector - selector 
     * @param {string} [selectorType] - selector type (css, cssContainingText, xpath) (default css)
     * @param {string} [text] - text (for cssContainingText selector type)
     */
    defineCollection(alias, selector, selectorType, text) {
        this.elements.set(alias, new Collection(alias, selector, selectorType, text))
    }

    /**
     * Define component on page
     * @example this.defineComponent("YourComponent", new CustomComponent()) //define component
     * @param {string} alias - alias
     * @param {Component} component - component 
     */
    defineComponent(alias, component) {
        this.elements.set(alias, component)
    }

    /**
     * Get element by key
     * @param {string} key - key
     * @return {ElementFinder|ElementArrayFinder} - protractor element
     */
    getElement(key) {
        const TOKEN_SPLIT_REGEXP = /\s*>\s*/;
        const tokens = key.split(TOKEN_SPLIT_REGEXP);
        const firstToken = tokens.shift();

        const {protractorElement} = tokens.reduce((current, token) => {
            return {
                protractorElement: this._getProtractorElement(current.protractorElement, current.component, token),
                component: this._newComponentCreator(current.component, token)
            }
        }, {
            protractorElement: this._getProtractorElement(null, this, firstToken),
            component: this._newComponentCreator(this, firstToken)
        });

        return protractorElement;
    }

    /**
     * Get protractor single element or collection of elements or element from collection
     * @param {ElementFinder|ElementArrayFinder} currentProtractorElement - current element
     * @param {Component} currentComponent - current component
     * @param {string} token - token to get new element
     * @return {ElementFinder|ElementArrayFinder} - return new element
     * @private
     */
    _getProtractorElement(currentProtractorElement, currentComponent, token) {
        const {index, alias, innerText} = this._parseToken(token);
        if (index !== null) {
            return this._getElementOfCollection(currentProtractorElement, currentComponent, alias, index, innerText)
        } else {
            return this._getElementOrCollection(currentProtractorElement, currentComponent, alias)
        }
    }

    /**
     * Get protractor element by index or text
     * @param {ElementFinder|ElementArrayFinder} currentProtractorElement - current element
     * @param {Component} currentComponent - current component
     * @param {string} alias - alias to get element
     * @param {number} [index] - index to get by index
     * @param {string} [innerText] - text to get by text
     * @return {ElementFinder|ElementArrayFinder} - new protractor element
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
     * @param {ElementFinder|ElementArrayFinder} currentProtractorElement - cuurent element
     * @param {Component} currentComponent - current component
     * @param {string} alias - alias
     * @return {ElementFinder|ElementArrayFinder} - new protractor element
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
     * @param {Component} currentComponent - current component
     * @param {string} alias - alias
     * @returns {Component} - new component
     * @throws {Error}
     * @private
     */
    _newComponentCreator(currentComponent, token) {
        const {index, innerText, alias} = this._parseToken(token);
        if (currentComponent.elements.has(alias)) {
            return currentComponent.elements.get(alias)
        } else {
            throw new Error(`There is no such element: '${alias}'`)
        }
    }

    /**
     * Resolve element by location strategy
     * @param {Element|Collection|Component} element - element to get selector
     * @return {By} - by selector
     * @throws {Error}
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
     * Parse token to index or text value and alias
     * @param {string} token - tokent to parse
     * @return {{index, innerText, alias}} - definition of token
     * @private
     */
    _parseToken(token) {
        const ELEMENT_OF_COLLECTION_REGEXP = /#([!\$]?.+)\s+(in|of)\s+(.+)/;
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
     * @param {string} value - key or value
     * @returns {any} - value from memory
     * @private
     */
    _getValueFromMemory(value) {
        let prefix = value.charAt(0);
        switch (prefix) {
            case "!": return Memory.parseValue(value);
            case "$": return Memory.parseValue(value);
            default: try {
                return Memory.parseValue(`#${value}`);
            } catch (e) {
                return value - 1;
            }
        }
    }

}

module.exports = AbstractPage;