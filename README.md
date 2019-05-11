This project is no more supported. All works are moved to cucumber-e2e set of projects. Please address your questions and issues here

PO https://github.com/AlexGalichenko/cucumber-e2e-po https://www.npmjs.com/package/@cucumber-e2e/po

Feature paralelizator https://github.com/AlexGalichenko/cucumber-e2e-gherkin-parallel https://www.npmjs.com/package/@cucumber-e2e/gherkin-parallel

HTML Reporter https://github.com/AlexGalichenko/cucumber-e2e-html-reporter https://www.npmjs.com/package/@cucumber-e2e/html-reporter

Memory manager https://github.com/AlexGalichenko/cucumber-e2e-memory https://www.npmjs.com/package/@cucumber-e2e/memory

Credential Manager https://github.com/AlexGalichenko/cucumber-e2e-credential-manager https://www.npmjs.com/package/@cucumber-e2e/credential-manager

# How to run

* `gulp test --env dev --tags "@debug"`

# Page Objects
##Page Map
```javascript
const AbstractPageMap = require("protractor-boilerplate").AbstractPageMap;
const LoginPage = require("./page/LoginPage");

class PageMap extends AbstractPageMap {

    constructor() {
        super();

        this.definePage("Login", "^.+))$", LoginPage);

    }

}
```
###Methods
* definePage

| param | mandatory | description |
|--------|-----------|---------------------------------|
| alias | M | alias of the page |
| regexp | M | regexp of URL to determine page |
| clazz | M | page class |

##Page
```javascript
const Page = require("protractor-boilerplate").AbstractPage;
const CustomComponent = require("./CustomComponent");

class CustomPage extends Page {

    constructor() {
        super();

        this.defineComponent("Custom Component", new CustomComponent());
        this.defineElement("Custom Element", "h3");
        this.defineCollection("Custom Collection", "h3.button");
    }

}
```
###Methods
* defineComponent

| param | mandatory | description |
|-----------|-----------|------------------------|
| alias | M | alias of the component |
| component | M | component object |

* defineElement

| param | mandatory | description |
|----------|-----------|-------------------------|
| alias | M | alias of the component |
| selector | M | css selector of element |

* defineCollection

| param | mandatory | description |
|----------|-----------|-------------------------|
| alias | M | alias of the component |
| selector | M | css selector of element |

##Component
```javascript
const Component = require("protractor-boilerplate").Component;

class CustomComponent extends Component {

    constructor(alias = "Dashboard", selector = ".div", isCollection = false) {
        super(alias, selector, isCollection);

        this.defineComponent("Custom Component", new CustomComponent());
        this.defineElement("Custom Element", "h3");
        this.defineCollection("Custom Collection", "h3.button");
    }

}
```
###Methods
* constructor

| param | mandatory | description |
|--------------|-----------|-------------------------|
| alias | M | alias of the component |
| selector | M | css selector of element |
| isCollection | M | isCollection flag |

* defineComponent

| param | mandatory | description |
|-----------|-----------|------------------------|
| alias | M | alias of the component |
| component | M | component object |

* defineElement

| param | mandatory | description |
|----------|-----------|-------------------------|
| alias | M | alias of the component |
| selector | M | css selector of element |

* defineCollection

| param | mandatory | description |
|----------|-----------|-------------------------|
| alias | M | alias of the component |
| selector | M | css selector of element |
     
# Memory
##Memory

```javascript
const Memory = require("protractor-boilerplate").Memory;

defineSupportCode(({setDefaultTimeout, When}) => {

    When(/^I remember "(.+)" value as "(.+)"$/, (alias, key) => {
        const page = State.getPage();

        return page.getElement(alias).getText()
            .then((text) => {
                Memory.setValue(key, text);
            })
    });
}
```

###Methods
* setValue

| param | mandatory | description |
|--------------|-----------|----------------------|
| key | M | key of stored item |
| value | M | value of stored item |

* parseValue
returns value by provided key, otherwise returns key

| param | mandatory | description |
|--------------|-----------|-----------------------|
| value | M | a key or simple value |
