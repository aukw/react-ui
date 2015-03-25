(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var React = require("react");
var gearzMixin = require("../../gearz.mixin");

var Textbox = React.createClass({displayName: "Textbox",
    mixins: [gearzMixin],
    propTypes: {
        // The input id
        id: React.PropTypes.string.isRequired,

        // The textbox value
        value: React.PropTypes.string,

        // Event raised when the textbox value is changed by the user
        onChange: React.PropTypes.func,

        // Text to be prepended to the component
        prependText: React.PropTypes.string,

        // Text to be appended to the component
        appendText: React.PropTypes.string,

        // Placeholder
        placeholder: React.PropTypes.string,

        // Whether or not the component is disabled
        disabled: React.PropTypes.bool,

        // Whether or not the component is invalid
        invalid: React.PropTypes.bool,

        // Whether or not the component is required
        required: React.PropTypes.bool,

        // Event raised when anything is changed in the component
        onAnyChange: React.PropTypes.func
    },
    render: function () {

        var id = this.get("id");
        var value = this.get("value");
        var prependText = this.get("prependText");
        var appendText = this.get("appendText");
        var placeholder = this.get("placeholder");
        var disabled = this.get("disabled");

        var input = React.createElement("input", {
            id: id, 
            type: "textbox", 
            className: "form-control has-error", 
            placeholder: placeholder, 
            value: value, 
            disabled: disabled, 
            onChange: 
                function (e) {
                    return this.set(e, "value", e.target.value);
                }.bind(this)
                }
        );

        // if there's any add-on
        if (prependText || appendText)
            return (
                React.createElement("div", {className: "input-group"}, 
                             prependText ? React.createElement("div", {className: "input-group-addon"},  prependText ) : null, 
                             input, 
                             appendText ? React.createElement("div", {className: "input-group-addon"},  appendText ) : null
                )
            );
        else
            return input;
    }
});

module.exports = Textbox;

},{"../../gearz.mixin":2,"react":"react"}],2:[function(require,module,exports){
var gearz = {
    getInitialState: function () {
        return {};
    },
    // 'get' is used to get properties that may be stored in 'state' or in 'props'
    // this happens when a value is defined throw a 'setter'
    get: function (propName) {
        return this.state.hasOwnProperty(propName)
            ? this.state[propName]
            : this.props[propName];
    },
    /**
     * 'set' is used to define the value of a property, given the name of the
     * property and the new value to assign. It can also receive a third parameter,
     * representing the context of the change. For example: you can pass the
     * event data when the change is caused by a DOM event.
     * This will raise events that can be listened by parent components,
     * so that they know when the child component changes.
     * @param propName {String}
     *      Name of the property that is being changed.
     *      This is usually the name of a `prop` of the component.
     * @param newValue {*}
     * @param context {Object}
     */
    set: function (propName, newValue, context) {
        var prevDef = false, isOriginalNewValue = true;

        var name = propName == "value" ? "" : propName[0].toUpperCase() + propName.substr(1);
        var specificEventName = name + "Change";

        // properties of an event object that cannot be overridden
        var defaultProps = [
            "previous",
            "context",
            "originalNewValue",
            "genericEventName",
            "value",
            "isOriginalNewValue",
            "preventDefault",
            "merge",
            "trigger"];

        var eventObject = {
            target: this,
            key: propName,
            previous: this.props[propName],
            context: context,
            originalNewValue: newValue,
            specificEventName: specificEventName,
            genericEventName: "AnyChange",
            get value() {
                return newValue;
            },
            set value(value) {
                newValue = value;
                isOriginalNewValue = this.originalNewValue === newValue;
            },
            get isOriginalNewValue() {
                return isOriginalNewValue;
            },

            /**
             * Prevents the default behavior of storing the data internally in the state of the component.
             * This is generally used to indicate that the state is going to be stored externally from the component.
             */
            preventDefault: function () {
                prevDef = true;
            },

            /**
             * Merges this event object, with another object, in order to include additional data to this event object.
             * You cannot override the default properties.
             * @param other {object} Containing properties to merged in a new event object.
             * @returns {object} The merging result between this event object and another object.
             */
            merge: function (other) {
                var result = Object.create(this);

                for (var key in other)
                    if (other.hasOwnProperty(key) && defaultProps.indexOf(key) < 0)
                        Object.defineProperty(result, key, {value: other[key]});

                return Object.freeze(result);
            },

            /**
             * Triggers an event handler (a function), if preventDefault was not called yet,
             * and returning whether the handler called preventDefault itself.
             * @param eventHandler {Function|String}
             *      Function representing an event handler that will receive the current event object;
             *      Or a string representing a named event, that may be present in a `prop`.
             * @returns {Boolean}
             *      Indicates whether preventDefault was called.
             */
            trigger: function (eventHandler) {
                if (typeof eventHandler == 'string')
                    eventHandler = this.target.props["on" + eventHandler];

                if (!prevDef && typeof eventHandler == 'function')
                    eventHandler(this);

                return prevDef;
            }
        };

        Object.freeze(eventObject);

        if (eventObject.trigger(specificEventName))
            return;

        if (eventObject.trigger(this.props.onAnyChange))
            return;

        var newState = {};
        newState[propName] = newValue;
        this.setState(newState);
    },
    // 'setter' is used to create a function that changes the value of an
    // attribute used by this component in response to a DOM event,
    // raising other events to notify parent components,
    // and with a default behaviour of storing changes
    // in the component internal 'state'
    setter: function (propName, newValue) {
        return (function (e) {
            return this.set(propName, newValue, {domEvent: e});
        }).bind(this);
    }
};

module.exports = gearz;

},{}],3:[function(require,module,exports){
var React = require("react");
var gearzMixin = require("../../gearz.mixin");

var FormGroup = React.createClass({displayName: "FormGroup",
    mixins: [gearzMixin],
    propTypes: {
        // The display name
        displayName: React.PropTypes.string.isRequired,
        // The child (single one) that represents the inner-control to be rendered inside the FormGroup
        children: React.PropTypes.element.isRequired
    },
    render: function () {
        var displayName = this.get("displayName");
        var childId = this.props.children.props.id;
        var childInvalid = this.props.children.props.invalid;
        return (
            React.createElement("div", {className:  childInvalid ? 'form-group has-error' : 'form-group'}, 
                React.createElement("label", {htmlFor: childId, className: "control-label"}, displayName), 
                 this.props.children
            )
        );
    }
});

module.exports = FormGroup;

},{"../../gearz.mixin":2,"react":"react"}],4:[function(require,module,exports){
var React = require("react");
var gearzMixin = require("../../gearz.mixin");

var StackPanel = React.createClass({displayName: "StackPanel",
    mixins: [gearzMixin],
    propTypes: {
    },
    render: function () {
        return (
            React.createElement("div", null, 
                 this.props.children
            )
        );
    }
});

module.exports = StackPanel;

},{"../../gearz.mixin":2,"react":"react"}],5:[function(require,module,exports){
var React = require("react");
var gearzMixin = require("../../gearz.mixin");

var Tab = React.createClass({displayName: "Tab",
    mixins: [gearzMixin],
    propTypes: {
        // the tab name
        name: React.PropTypes.string.isRequired,
        // the tab display name
        displayName: React.PropTypes.string.isRequired,
    },

    render: function () {
        return React.createElement("div", null, 
                 this.props.children
            )
    }
});

module.exports = Tab;

},{"../../gearz.mixin":2,"react":"react"}],6:[function(require,module,exports){
var React = require("react");
var TabHeader = require("./tabHeader.jsx");
var gearzMixin = require("../../gearz.mixin");

var TabControl = React.createClass({displayName: "TabControl",
    mixins: [gearzMixin],
    propTypes: {
        // current tab
        activeTab: React.PropTypes.string.isRequired,
        // A collection of Tab controls
        children: React.PropTypes.array.isRequired
    },
    getInitialState: function () {
        return {}
    },
    activeTabChanged: function(e) {
        this.set("activeTab", e.value);
    },
    render: function() {
        var tabs = this.props.children;
        var activeTab = this.get("activeTab");
        var tabHeaderItems = [];
        for(var i = 0; i < tabs.length; i++)
        {
            var tab = tabs[i];
            tabHeaderItems.push({name: tab.props.name, displayName: tab.props.displayName })
        }

        return React.createElement("div", {className: "tabControl"}, 
                React.createElement(TabHeader, {tabs: tabHeaderItems, activeTab: activeTab, onActiveTabChange:  this.activeTabChanged}), 
                React.createElement("div", {className: "tabControl-content"}, 
                     this.props.children.map(function(item) {
                        var tabName = item.props.name;
                        return React.createElement("div", {className:  activeTab == tabName ? "tab activeTab" : "tab"}, 
                                item
                            );
                    }) 
                )
            );
    }
});

module.exports = TabControl;

},{"../../gearz.mixin":2,"./tabHeader.jsx":7,"react":"react"}],7:[function(require,module,exports){
var React = require("react");
var gearzMixin = require("../../gearz.mixin");

var TabHeader = React.createClass({displayName: "TabHeader",
    mixins: [gearzMixin],
    propTypes: {
        // Active tab name
        activeTab: React.PropTypes.string.isRequired,
        // tab array. Each element is of type { name (string), displayName (string) }
        tabs: React.PropTypes.array.isRequired
    },

    render: function () {
        var that = this;
        var activeTab = this.get("activeTab");
        var tabs = this.get("tabs");

        return React.createElement("ul", {className: "nav nav-tabs tabControl"}, 
         tabs.map(function (item) {
            return React.createElement("li", {role: "presentation", className:  item.name == activeTab ? "active" : ""}, 
                React.createElement("a", {onClick:  that.setter("activeTab", item.name) },  item.displayName)
            );
        })
        )
    }
});

module.exports = TabHeader;

},{"../../gearz.mixin":2,"react":"react"}],8:[function(require,module,exports){
var React = require("react");
var gearzMixin = require("../../gearz.mixin");

var TreeRow = React.createClass({displayName: "TreeRow",
    mixins: [gearzMixin],
    propTypes: {
        onAnyChange: React.PropTypes.func,
        onCollapsedChange: React.PropTypes.func,
        path: React.PropTypes.array.isRequired
    },
    hasChildren: function(nodes) {
        if (Array.isArray(nodes))
            return nodes.length>0;
        if (typeof nodes == 'object')
            return Object.keys(nodes).length>0;
        return !!nodes;
    },
    cardinality: function(nodes) {
        if (Array.isArray(nodes))
            return nodes.length;
        if (typeof nodes == 'object')
            return Object.keys(nodes).length;
        return null;
    },
    render: function () {

        var nodes = this.get("nodes");
        var collapsed = !!this.get("collapsed");
        var display = this.get("display");
        var path = this.get("path");

        var hasChildren = this.hasChildren(nodes);
        var cardinality = this.cardinality(nodes);

        var indentation = 10 + path.length * 15 + "px";

        return (
            React.createElement("li", {className: "list-group-item noselect", style: {paddingLeft: indentation}}, 
                React.createElement("span", {
                    className: 
                        !hasChildren ? "treeView-toggle-button glyphicon glyphicon-leaf" :
                            collapsed ? "treeView-toggle-button glyphicon glyphicon-triangle-right" :
                                "treeView-toggle-button glyphicon glyphicon-triangle-bottom", 
                        
                    onClick:  this.setter("collapsed", !collapsed) }
                ), 
                React.createElement("span", {className: "treeView-content"}, 
                         display 
                ), 
                 hasChildren && cardinality !== null ? React.createElement("span", {className: "badge"},  cardinality ) : null
            )
        );
    }
});

module.exports = TreeRow;

},{"../../gearz.mixin":2,"react":"react"}],9:[function(require,module,exports){
var React = require("react");
var gearzMixin = require("../../gearz.mixin");

var ComponentBuilder = React.createClass({displayName: "ComponentBuilder",
    mixins: [gearzMixin],
    propTypes: {},
    isUpper: function (x) {
        var u = x.toUpperCase(),
            l = x.toLowerCase();
        return x == u && x != l;
    },
    isLower: function (x) {
        var u = x.toUpperCase(),
            l = x.toLowerCase();
        return x == l && x != u;
    },
    getComponents: function (data) {
        if (!data)
            return [];
        var array = Array.isArray(data) ? data : [data];
        return array.map(function (item) {
            if (!item)
                return null;

            if (typeof item == 'string')
                return item;

            var args = [];

            // React convention:
            //  first letter lower-case named components are HTML tags
            //  first letter upper-case named components are custom React components
            if (this.isUpper(item.type[0]) && window[item.type])
                args.push(window[item.type]);
            else if (this.isLower(item.type[0]))
                args.push(item.type);
            else
                return null;

            args.push(item.props);
            args.push.apply(args, this.getComponents(item.children));

            return React.createElement.apply(React, args);
        }.bind(this));
    },
    render: function () {
        var data = this.get("data");
        if (!data)
            return (React.createElement("div", null, "No components to render"));
        var components = this.getComponents(data);
        return (
            React.createElement("div", null, components)
        );
    }
});

module.exports = ComponentBuilder;

},{"../../gearz.mixin":2,"react":"react"}],10:[function(require,module,exports){
var React = require("react");
var gearzMixin = require("../../gearz.mixin");

var Link = React.createClass({displayName: "Link",
    mixins: [gearzMixin],
    processAjaxData: function (response, urlPath) {
        document.getElementById("content").innerHTML = response.html;
        document.title = response.pageTitle;
        window.history.pushState({"html": response.html, "pageTitle": response.pageTitle}, "", urlPath);
    },
    navigator: function (routeInfo) {
        return function (e) {
            var onNavigate = this.props.onNavigate;
            onNavigate && onNavigate(e);
            if (routeInfo.routeData.isClient) {
                //var currentInfo = this.props.router.getCurrentLocationInfo();
                var Component = window[routeInfo.routeData.pageComponent];
                var targetElement = document.getElementById(this.props.target);
                if (Component && targetElement) {
                    React.render(React.createElement(Component, null), targetElement);
                    window.history.pushState(
                        {
                            pageComponent: routeInfo.routeData.pageComponent,
                            viewData: {},
                            "pageTitle": "TITLE"
                        },
                        null,
                        routeInfo.uri);
                }
            }

            e.preventDefault();
        }.bind(this);
    },
    render: function () {
        var href = this.props.href,
            router = this.props.router,
            onNavigate = this.props.onNavigate; // triggered when navigating through this link

        var routeInfo = router.getInfo(href);

        return (
            React.createElement("a", {href: routeInfo.uri, onClick: this.navigator(routeInfo)}, 
                            routeInfo.uri
            )
        );
    }
});

module.exports = Link;

},{"../../gearz.mixin":2,"react":"react"}],11:[function(require,module,exports){
var React = require("react");
var gearzMixin = require("../../gearz.mixin");

var Pager = React.createClass({displayName: "Pager",
    mixins: [gearzMixin],
    render: function() {
        var page = this.get("page");
        var pageCount = this.props.count / this.props.pageSize,
            children = [];

        for (var it = 0; it < pageCount; it++) {
            var setter = this.setter("page", it+1);
            children.push(
                React.createElement("li", {
                    className: [page-1==it?"active":"", "item"].join(' '), 
                    onMouseDown: setter, 
                    key: "pg-"+it+1}, 

                React.createElement("a", {href: "#"}, it)

                ));
        }

        return (
            React.createElement("nav", null, 
                React.createElement("ul", {className: "pagination"}, 
                    children
                )
            )
        );
    }
});

module.exports = Pager;

},{"../../gearz.mixin":2,"react":"react"}],12:[function(require,module,exports){
exports.TextBox = require("./components/editors/textbox/textbox.jsx");
exports.FormGroup = require("./components/layout/formGroup/formGroup.jsx");
exports.StackPanel = require("./components/layout/stackPanel/stackPanel.jsx");
exports.Tab = require("./components/layout/tabControl/tab.jsx");
exports.TabControl = require("./components/layout/tabControl/tabControl.jsx");
exports.TabHeader = require("./components/layout/tabControl/tabHeader.jsx");
exports.TreeRow = require("./components/layout/treeView/treeRow.jsx");
exports.TabHeader = require("./components/layout/tabControl/tabHeader.jsx");
exports.ComponentBuilder = require("./components/meta/componentBuilder/componentBuilder.jsx");
exports.Link = require("./components/navigation/link/link.jsx");
exports.Pager = require("./components/navigation/pager/pager.jsx");

},{"./components/editors/textbox/textbox.jsx":1,"./components/layout/formGroup/formGroup.jsx":3,"./components/layout/stackPanel/stackPanel.jsx":4,"./components/layout/tabControl/tab.jsx":5,"./components/layout/tabControl/tabControl.jsx":6,"./components/layout/tabControl/tabHeader.jsx":7,"./components/layout/treeView/treeRow.jsx":8,"./components/meta/componentBuilder/componentBuilder.jsx":9,"./components/navigation/link/link.jsx":10,"./components/navigation/pager/pager.jsx":11}]},{},[12]);