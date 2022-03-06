webpackJsonp([4],{

/***/ 114:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = loopAsync;
/* harmony export (immutable) */ __webpack_exports__["a"] = mapAsync;
function loopAsync(turns, work, callback) {
  var currentTurn = 0,
      isDone = false;
  var sync = false,
      hasNext = false,
      doneArgs = void 0;

  function done() {
    isDone = true;
    if (sync) {
      // Iterate instead of recursing if possible.
      doneArgs = [].concat(Array.prototype.slice.call(arguments));
      return;
    }

    callback.apply(this, arguments);
  }

  function next() {
    if (isDone) {
      return;
    }

    hasNext = true;
    if (sync) {
      // Iterate instead of recursing if possible.
      return;
    }

    sync = true;

    while (!isDone && currentTurn < turns && hasNext) {
      hasNext = false;
      work.call(this, currentTurn++, next, done);
    }

    sync = false;

    if (isDone) {
      // This means the loop finished synchronously.
      callback.apply(this, doneArgs);
      return;
    }

    if (currentTurn >= turns && hasNext) {
      isDone = true;
      callback();
    }
  }

  next();
}

function mapAsync(array, work, callback) {
  var length = array.length;
  var values = [];

  if (length === 0) return callback(null, values);

  var isDone = false,
      doneCount = 0;

  function done(index, error, value) {
    if (isDone) return;

    if (error) {
      isDone = true;
      callback(error);
    } else {
      values[index] = value;

      isDone = ++doneCount === length;

      if (isDone) callback(null, values);
    }
  }

  array.forEach(function (item, index) {
    work(item, index, function (error, value) {
      done(index, error, value);
    });
  });
}

/***/ }),

/***/ 115:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony export (immutable) */ __webpack_exports__["a"] = ContextProvider;
/* harmony export (immutable) */ __webpack_exports__["b"] = ContextSubscriber;



// Works around issues with context updates failing to propagate.
// Caveat: the context value is expected to never change its identity.
// https://github.com/facebook/react/issues/2517
// https://github.com/reactjs/react-router/issues/470

var contextProviderShape = __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.shape({
  subscribe: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.func.isRequired,
  eventIndex: __WEBPACK_IMPORTED_MODULE_1_prop_types___default.a.number.isRequired
});

function makeContextName(name) {
  return '@@contextSubscriber/' + name;
}

var prefixUnsafeLifecycleMethods = typeof __WEBPACK_IMPORTED_MODULE_0_react___default.a.forwardRef !== 'undefined';

function ContextProvider(name) {
  var _childContextTypes, _config;

  var contextName = makeContextName(name);
  var listenersKey = contextName + '/listeners';
  var eventIndexKey = contextName + '/eventIndex';
  var subscribeKey = contextName + '/subscribe';

  var config = (_config = {
    childContextTypes: (_childContextTypes = {}, _childContextTypes[contextName] = contextProviderShape.isRequired, _childContextTypes),

    getChildContext: function getChildContext() {
      var _ref;

      return _ref = {}, _ref[contextName] = {
        eventIndex: this[eventIndexKey],
        subscribe: this[subscribeKey]
      }, _ref;
    },


    // this method will be updated to UNSAFE_componentWillMount below for React versions >= 16.3
    componentWillMount: function componentWillMount() {
      this[listenersKey] = [];
      this[eventIndexKey] = 0;
    },


    // this method will be updated to UNSAFE_componentWillReceiveProps below for React versions >= 16.3
    componentWillReceiveProps: function componentWillReceiveProps() {
      this[eventIndexKey]++;
    },
    componentDidUpdate: function componentDidUpdate() {
      var _this = this;

      this[listenersKey].forEach(function (listener) {
        return listener(_this[eventIndexKey]);
      });
    }
  }, _config[subscribeKey] = function (listener) {
    var _this2 = this;

    // No need to immediately call listener here.
    this[listenersKey].push(listener);

    return function () {
      _this2[listenersKey] = _this2[listenersKey].filter(function (item) {
        return item !== listener;
      });
    };
  }, _config);

  if (prefixUnsafeLifecycleMethods) {
    config.UNSAFE_componentWillMount = config.componentWillMount;
    config.UNSAFE_componentWillReceiveProps = config.componentWillReceiveProps;
    delete config.componentWillMount;
    delete config.componentWillReceiveProps;
  }
  return config;
}

function ContextSubscriber(name) {
  var _contextTypes, _config2;

  var contextName = makeContextName(name);
  var lastRenderedEventIndexKey = contextName + '/lastRenderedEventIndex';
  var handleContextUpdateKey = contextName + '/handleContextUpdate';
  var unsubscribeKey = contextName + '/unsubscribe';

  var config = (_config2 = {
    contextTypes: (_contextTypes = {}, _contextTypes[contextName] = contextProviderShape, _contextTypes),

    getInitialState: function getInitialState() {
      var _ref2;

      if (!this.context[contextName]) {
        return {};
      }

      return _ref2 = {}, _ref2[lastRenderedEventIndexKey] = this.context[contextName].eventIndex, _ref2;
    },
    componentDidMount: function componentDidMount() {
      if (!this.context[contextName]) {
        return;
      }

      this[unsubscribeKey] = this.context[contextName].subscribe(this[handleContextUpdateKey]);
    },


    // this method will be updated to UNSAFE_componentWillReceiveProps below for React versions >= 16.3
    componentWillReceiveProps: function componentWillReceiveProps() {
      var _setState;

      if (!this.context[contextName]) {
        return;
      }

      this.setState((_setState = {}, _setState[lastRenderedEventIndexKey] = this.context[contextName].eventIndex, _setState));
    },
    componentWillUnmount: function componentWillUnmount() {
      if (!this[unsubscribeKey]) {
        return;
      }

      this[unsubscribeKey]();
      this[unsubscribeKey] = null;
    }
  }, _config2[handleContextUpdateKey] = function (eventIndex) {
    if (eventIndex !== this.state[lastRenderedEventIndexKey]) {
      var _setState2;

      this.setState((_setState2 = {}, _setState2[lastRenderedEventIndexKey] = eventIndex, _setState2));
    }
  }, _config2);

  if (prefixUnsafeLifecycleMethods) {
    config.UNSAFE_componentWillReceiveProps = config.componentWillReceiveProps;
    delete config.componentWillReceiveProps;
  }
  return config;
}

/***/ }),

/***/ 116:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_prop_types__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_prop_types__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return routerShape; });
/* unused harmony export locationShape */


var routerShape = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_prop_types__["shape"])({
  push: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  replace: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  go: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  goBack: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  goForward: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  setRouteLeaveHook: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  isActive: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired
});

var locationShape = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_prop_types__["shape"])({
  pathname: __WEBPACK_IMPORTED_MODULE_0_prop_types__["string"].isRequired,
  search: __WEBPACK_IMPORTED_MODULE_0_prop_types__["string"].isRequired,
  state: __WEBPACK_IMPORTED_MODULE_0_prop_types__["object"],
  action: __WEBPACK_IMPORTED_MODULE_0_prop_types__["string"].isRequired,
  key: __WEBPACK_IMPORTED_MODULE_0_prop_types__["string"]
});

/***/ }),

/***/ 117:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_invariant__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react_is__ = __webpack_require__(71);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react_is___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_react_is__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_create_react_class__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_create_react_class___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_create_react_class__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_prop_types__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__getRouteParams__ = __webpack_require__(1422);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__ContextUtils__ = __webpack_require__(115);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__RouteUtils__ = __webpack_require__(26);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };











/**
 * A <RouterContext> renders the component tree for a given router state
 * and sets the history object and the current location in context.
 */
var RouterContext = __WEBPACK_IMPORTED_MODULE_3_create_react_class___default()({
  displayName: 'RouterContext',

  mixins: [__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_6__ContextUtils__["a" /* ContextProvider */])('router')],

  propTypes: {
    router: __WEBPACK_IMPORTED_MODULE_4_prop_types__["object"].isRequired,
    location: __WEBPACK_IMPORTED_MODULE_4_prop_types__["object"].isRequired,
    routes: __WEBPACK_IMPORTED_MODULE_4_prop_types__["array"].isRequired,
    params: __WEBPACK_IMPORTED_MODULE_4_prop_types__["object"].isRequired,
    components: __WEBPACK_IMPORTED_MODULE_4_prop_types__["array"].isRequired,
    createElement: __WEBPACK_IMPORTED_MODULE_4_prop_types__["func"].isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      createElement: __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement
    };
  },


  childContextTypes: {
    router: __WEBPACK_IMPORTED_MODULE_4_prop_types__["object"].isRequired
  },

  getChildContext: function getChildContext() {
    return {
      router: this.props.router
    };
  },
  createElement: function createElement(component, props) {
    return component == null ? null : this.props.createElement(component, props);
  },
  render: function render() {
    var _this = this;

    var _props = this.props,
        location = _props.location,
        routes = _props.routes,
        params = _props.params,
        components = _props.components,
        router = _props.router;

    var element = null;

    if (components) {
      element = components.reduceRight(function (element, components, index) {
        if (components == null) return element; // Don't create new children; use the grandchildren.

        var route = routes[index];
        var routeParams = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__getRouteParams__["a" /* default */])(route, params);
        var props = {
          location: location,
          params: params,
          route: route,
          router: router,
          routeParams: routeParams,
          routes: routes
        };

        if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__RouteUtils__["a" /* isReactChildren */])(element)) {
          props.children = element;
        } else if (element) {
          for (var prop in element) {
            if (Object.prototype.hasOwnProperty.call(element, prop)) props[prop] = element[prop];
          }
        }

        // Handle components is object for { [name]: component } but not valid element
        // type of react, such as React.memo, React.lazy and so on.
        if ((typeof components === 'undefined' ? 'undefined' : _typeof(components)) === 'object' && !__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_react_is__["isValidElementType"])(components)) {
          var elements = {};

          for (var key in components) {
            if (Object.prototype.hasOwnProperty.call(components, key)) {
              // Pass through the key as a prop to createElement to allow
              // custom createElement functions to know which named component
              // they're rendering, for e.g. matching up to fetched data.
              elements[key] = _this.createElement(components[key], _extends({
                key: key }, props));
            }
          }

          return elements;
        }

        return _this.createElement(components, props);
      }, element);
    }

    !(element === null || element === false || __WEBPACK_IMPORTED_MODULE_1_react___default.a.isValidElement(element)) ?  true ? __WEBPACK_IMPORTED_MODULE_0_invariant___default()(false, 'The root route must render a single element') : invariant(false) : void 0;

    return element;
  }
});

/* harmony default export */ __webpack_exports__["a"] = (RouterContext);

/***/ }),

/***/ 1214:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var loopAsync = exports.loopAsync = function loopAsync(turns, work, callback) {
  var currentTurn = 0,
      isDone = false;
  var isSync = false,
      hasNext = false,
      doneArgs = void 0;

  var done = function done() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    isDone = true;

    if (isSync) {
      // Iterate instead of recursing if possible.
      doneArgs = args;
      return;
    }

    callback.apply(undefined, args);
  };

  var next = function next() {
    if (isDone) return;

    hasNext = true;

    if (isSync) return; // Iterate instead of recursing if possible.

    isSync = true;

    while (!isDone && currentTurn < turns && hasNext) {
      hasNext = false;
      work(currentTurn++, next, done);
    }

    isSync = false;

    if (isDone) {
      // This means the loop finished synchronously.
      callback.apply(undefined, doneArgs);
      return;
    }

    if (currentTurn >= turns && hasNext) {
      isDone = true;
      callback();
    }
  };

  next();
};

/***/ }),

/***/ 1215:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.replaceLocation = exports.pushLocation = exports.startListener = exports.getCurrentLocation = exports.go = exports.getUserConfirmation = undefined;

var _BrowserProtocol = __webpack_require__(80);

Object.defineProperty(exports, 'getUserConfirmation', {
  enumerable: true,
  get: function get() {
    return _BrowserProtocol.getUserConfirmation;
  }
});
Object.defineProperty(exports, 'go', {
  enumerable: true,
  get: function get() {
    return _BrowserProtocol.go;
  }
});

var _warning = __webpack_require__(27);

var _warning2 = _interopRequireDefault(_warning);

var _LocationUtils = __webpack_require__(34);

var _DOMUtils = __webpack_require__(54);

var _DOMStateStorage = __webpack_require__(132);

var _PathUtils = __webpack_require__(23);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var HashChangeEvent = 'hashchange';

var getHashPath = function getHashPath() {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var hashIndex = href.indexOf('#');
  return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
};

var pushHashPath = function pushHashPath(path) {
  return window.location.hash = path;
};

var replaceHashPath = function replaceHashPath(path) {
  var hashIndex = window.location.href.indexOf('#');

  window.location.replace(window.location.href.slice(0, hashIndex >= 0 ? hashIndex : 0) + '#' + path);
};

var getCurrentLocation = exports.getCurrentLocation = function getCurrentLocation(pathCoder, queryKey) {
  var path = pathCoder.decodePath(getHashPath());
  var key = (0, _PathUtils.getQueryStringValueFromPath)(path, queryKey);

  var state = void 0;
  if (key) {
    path = (0, _PathUtils.stripQueryStringValueFromPath)(path, queryKey);
    state = (0, _DOMStateStorage.readState)(key);
  }

  var init = (0, _PathUtils.parsePath)(path);
  init.state = state;

  return (0, _LocationUtils.createLocation)(init, undefined, key);
};

var prevLocation = void 0;

var startListener = exports.startListener = function startListener(listener, pathCoder, queryKey) {
  var handleHashChange = function handleHashChange() {
    var path = getHashPath();
    var encodedPath = pathCoder.encodePath(path);

    if (path !== encodedPath) {
      // Always be sure we have a properly-encoded hash.
      replaceHashPath(encodedPath);
    } else {
      var currentLocation = getCurrentLocation(pathCoder, queryKey);

      if (prevLocation && currentLocation.key && prevLocation.key === currentLocation.key) return; // Ignore extraneous hashchange events

      prevLocation = currentLocation;

      listener(currentLocation);
    }
  };

  // Ensure the hash is encoded properly.
  var path = getHashPath();
  var encodedPath = pathCoder.encodePath(path);

  if (path !== encodedPath) replaceHashPath(encodedPath);

  (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);

  return function () {
    return (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
  };
};

var updateLocation = function updateLocation(location, pathCoder, queryKey, updateHash) {
  var state = location.state,
      key = location.key;


  var path = pathCoder.encodePath((0, _PathUtils.createPath)(location));

  if (state !== undefined) {
    path = (0, _PathUtils.addQueryStringValueToPath)(path, queryKey, key);
    (0, _DOMStateStorage.saveState)(key, state);
  }

  prevLocation = location;

  updateHash(path);
};

var pushLocation = exports.pushLocation = function pushLocation(location, pathCoder, queryKey) {
  return updateLocation(location, pathCoder, queryKey, function (path) {
    if (getHashPath() !== path) {
      pushHashPath(path);
    } else {
       true ? (0, _warning2.default)(false, 'You cannot PUSH the same path using hash history') : void 0;
    }
  });
};

var replaceLocation = exports.replaceLocation = function replaceLocation(location, pathCoder, queryKey) {
  return updateLocation(location, pathCoder, queryKey, function (path) {
    if (getHashPath() !== path) replaceHashPath(path);
  });
};

/***/ }),

/***/ 1216:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.replaceLocation = exports.pushLocation = exports.getCurrentLocation = exports.go = exports.getUserConfirmation = undefined;

var _BrowserProtocol = __webpack_require__(80);

Object.defineProperty(exports, 'getUserConfirmation', {
  enumerable: true,
  get: function get() {
    return _BrowserProtocol.getUserConfirmation;
  }
});
Object.defineProperty(exports, 'go', {
  enumerable: true,
  get: function get() {
    return _BrowserProtocol.go;
  }
});

var _LocationUtils = __webpack_require__(34);

var _PathUtils = __webpack_require__(23);

var getCurrentLocation = exports.getCurrentLocation = function getCurrentLocation() {
  return (0, _LocationUtils.createLocation)(window.location);
};

var pushLocation = exports.pushLocation = function pushLocation(location) {
  window.location.href = (0, _PathUtils.createPath)(location);
  return false; // Don't update location
};

var replaceLocation = exports.replaceLocation = function replaceLocation(location) {
  window.location.replace((0, _PathUtils.createPath)(location));
  return false; // Don't update location
};

/***/ }),

/***/ 1217:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _invariant = __webpack_require__(8);

var _invariant2 = _interopRequireDefault(_invariant);

var _ExecutionEnvironment = __webpack_require__(81);

var _BrowserProtocol = __webpack_require__(80);

var BrowserProtocol = _interopRequireWildcard(_BrowserProtocol);

var _RefreshProtocol = __webpack_require__(1216);

var RefreshProtocol = _interopRequireWildcard(_RefreshProtocol);

var _DOMUtils = __webpack_require__(54);

var _createHistory = __webpack_require__(82);

var _createHistory2 = _interopRequireDefault(_createHistory);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Creates and returns a history object that uses HTML5's history API
 * (pushState, replaceState, and the popstate event) to manage history.
 * This is the recommended method of managing history in browsers because
 * it provides the cleanest URLs.
 *
 * Note: In browsers that do not support the HTML5 history API full
 * page reloads will be used to preserve clean URLs. You can force this
 * behavior using { forceRefresh: true } in options.
 */
var createBrowserHistory = function createBrowserHistory() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  !_ExecutionEnvironment.canUseDOM ?  true ? (0, _invariant2.default)(false, 'Browser history needs a DOM') : (0, _invariant2.default)(false) : void 0;

  var useRefresh = options.forceRefresh || !(0, _DOMUtils.supportsHistory)();
  var Protocol = useRefresh ? RefreshProtocol : BrowserProtocol;

  var getUserConfirmation = Protocol.getUserConfirmation,
      getCurrentLocation = Protocol.getCurrentLocation,
      pushLocation = Protocol.pushLocation,
      replaceLocation = Protocol.replaceLocation,
      go = Protocol.go;


  var history = (0, _createHistory2.default)(_extends({
    getUserConfirmation: getUserConfirmation }, options, {
    getCurrentLocation: getCurrentLocation,
    pushLocation: pushLocation,
    replaceLocation: replaceLocation,
    go: go
  }));

  var listenerCount = 0,
      stopListener = void 0;

  var startListener = function startListener(listener, before) {
    if (++listenerCount === 1) stopListener = BrowserProtocol.startListener(history.transitionTo);

    var unlisten = before ? history.listenBefore(listener) : history.listen(listener);

    return function () {
      unlisten();

      if (--listenerCount === 0) stopListener();
    };
  };

  var listenBefore = function listenBefore(listener) {
    return startListener(listener, true);
  };

  var listen = function listen(listener) {
    return startListener(listener, false);
  };

  return _extends({}, history, {
    listenBefore: listenBefore,
    listen: listen
  });
};

exports.default = createBrowserHistory;

/***/ }),

/***/ 1218:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = __webpack_require__(27);

var _warning2 = _interopRequireDefault(_warning);

var _invariant = __webpack_require__(8);

var _invariant2 = _interopRequireDefault(_invariant);

var _ExecutionEnvironment = __webpack_require__(81);

var _DOMUtils = __webpack_require__(54);

var _HashProtocol = __webpack_require__(1215);

var HashProtocol = _interopRequireWildcard(_HashProtocol);

var _createHistory = __webpack_require__(82);

var _createHistory2 = _interopRequireDefault(_createHistory);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultQueryKey = '_k';

var addLeadingSlash = function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
};

var HashPathCoders = {
  hashbang: {
    encodePath: function encodePath(path) {
      return path.charAt(0) === '!' ? path : '!' + path;
    },
    decodePath: function decodePath(path) {
      return path.charAt(0) === '!' ? path.substring(1) : path;
    }
  },
  noslash: {
    encodePath: function encodePath(path) {
      return path.charAt(0) === '/' ? path.substring(1) : path;
    },
    decodePath: addLeadingSlash
  },
  slash: {
    encodePath: addLeadingSlash,
    decodePath: addLeadingSlash
  }
};

var createHashHistory = function createHashHistory() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  !_ExecutionEnvironment.canUseDOM ?  true ? (0, _invariant2.default)(false, 'Hash history needs a DOM') : (0, _invariant2.default)(false) : void 0;

  var queryKey = options.queryKey,
      hashType = options.hashType;


   true ? (0, _warning2.default)(queryKey !== false, 'Using { queryKey: false } no longer works. Instead, just don\'t ' + 'use location state if you don\'t want a key in your URL query string') : void 0;

  if (typeof queryKey !== 'string') queryKey = DefaultQueryKey;

  if (hashType == null) hashType = 'slash';

  if (!(hashType in HashPathCoders)) {
     true ? (0, _warning2.default)(false, 'Invalid hash type: %s', hashType) : void 0;

    hashType = 'slash';
  }

  var pathCoder = HashPathCoders[hashType];

  var getUserConfirmation = HashProtocol.getUserConfirmation;


  var getCurrentLocation = function getCurrentLocation() {
    return HashProtocol.getCurrentLocation(pathCoder, queryKey);
  };

  var pushLocation = function pushLocation(location) {
    return HashProtocol.pushLocation(location, pathCoder, queryKey);
  };

  var replaceLocation = function replaceLocation(location) {
    return HashProtocol.replaceLocation(location, pathCoder, queryKey);
  };

  var history = (0, _createHistory2.default)(_extends({
    getUserConfirmation: getUserConfirmation }, options, {
    getCurrentLocation: getCurrentLocation,
    pushLocation: pushLocation,
    replaceLocation: replaceLocation,
    go: HashProtocol.go
  }));

  var listenerCount = 0,
      stopListener = void 0;

  var startListener = function startListener(listener, before) {
    if (++listenerCount === 1) stopListener = HashProtocol.startListener(history.transitionTo, pathCoder, queryKey);

    var unlisten = before ? history.listenBefore(listener) : history.listen(listener);

    return function () {
      unlisten();

      if (--listenerCount === 0) stopListener();
    };
  };

  var listenBefore = function listenBefore(listener) {
    return startListener(listener, true);
  };

  var listen = function listen(listener) {
    return startListener(listener, false);
  };

  var goIsSupportedWithoutReload = (0, _DOMUtils.supportsGoWithoutReloadUsingHash)();

  var go = function go(n) {
     true ? (0, _warning2.default)(goIsSupportedWithoutReload, 'Hash history go(n) causes a full page reload in this browser') : void 0;

    history.go(n);
  };

  var createHref = function createHref(path) {
    return '#' + pathCoder.encodePath(history.createHref(path));
  };

  return _extends({}, history, {
    listenBefore: listenBefore,
    listen: listen,
    go: go,
    createHref: createHref
  });
};

exports.default = createHashHistory;

/***/ }),

/***/ 1219:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _warning = __webpack_require__(27);

var _warning2 = _interopRequireDefault(_warning);

var _invariant = __webpack_require__(8);

var _invariant2 = _interopRequireDefault(_invariant);

var _LocationUtils = __webpack_require__(34);

var _PathUtils = __webpack_require__(23);

var _createHistory = __webpack_require__(82);

var _createHistory2 = _interopRequireDefault(_createHistory);

var _Actions = __webpack_require__(53);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createStateStorage = function createStateStorage(entries) {
  return entries.filter(function (entry) {
    return entry.state;
  }).reduce(function (memo, entry) {
    memo[entry.key] = entry.state;
    return memo;
  }, {});
};

var createMemoryHistory = function createMemoryHistory() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (Array.isArray(options)) {
    options = { entries: options };
  } else if (typeof options === 'string') {
    options = { entries: [options] };
  }

  var getCurrentLocation = function getCurrentLocation() {
    var entry = entries[current];
    var path = (0, _PathUtils.createPath)(entry);

    var key = void 0,
        state = void 0;
    if (entry.key) {
      key = entry.key;
      state = readState(key);
    }

    var init = (0, _PathUtils.parsePath)(path);

    return (0, _LocationUtils.createLocation)(_extends({}, init, { state: state }), undefined, key);
  };

  var canGo = function canGo(n) {
    var index = current + n;
    return index >= 0 && index < entries.length;
  };

  var go = function go(n) {
    if (!n) return;

    if (!canGo(n)) {
       true ? (0, _warning2.default)(false, 'Cannot go(%s) there is not enough history', n) : void 0;

      return;
    }

    current += n;
    var currentLocation = getCurrentLocation();

    // Change action to POP
    history.transitionTo(_extends({}, currentLocation, { action: _Actions.POP }));
  };

  var pushLocation = function pushLocation(location) {
    current += 1;

    if (current < entries.length) entries.splice(current);

    entries.push(location);

    saveState(location.key, location.state);
  };

  var replaceLocation = function replaceLocation(location) {
    entries[current] = location;
    saveState(location.key, location.state);
  };

  var history = (0, _createHistory2.default)(_extends({}, options, {
    getCurrentLocation: getCurrentLocation,
    pushLocation: pushLocation,
    replaceLocation: replaceLocation,
    go: go
  }));

  var _options = options,
      entries = _options.entries,
      current = _options.current;


  if (typeof entries === 'string') {
    entries = [entries];
  } else if (!Array.isArray(entries)) {
    entries = ['/'];
  }

  entries = entries.map(function (entry) {
    return (0, _LocationUtils.createLocation)(entry);
  });

  if (current == null) {
    current = entries.length - 1;
  } else {
    !(current >= 0 && current < entries.length) ?  true ? (0, _invariant2.default)(false, 'Current index must be >= 0 and < %s, was %s', entries.length, current) : (0, _invariant2.default)(false) : void 0;
  }

  var storage = createStateStorage(entries);

  var saveState = function saveState(key, state) {
    return storage[key] = state;
  };

  var readState = function readState(key) {
    return storage[key];
  };

  return _extends({}, history, {
    canGo: canGo
  });
};

exports.default = createMemoryHistory;

/***/ }),

/***/ 125:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ 132:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.readState = exports.saveState = undefined;

var _warning = __webpack_require__(27);

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var QuotaExceededErrors = {
  QuotaExceededError: true,
  QUOTA_EXCEEDED_ERR: true
};

var SecurityErrors = {
  SecurityError: true
};

var KeyPrefix = '@@History/';

var createKey = function createKey(key) {
  return KeyPrefix + key;
};

var saveState = exports.saveState = function saveState(key, state) {
  if (!window.sessionStorage) {
    // Session storage is not available or hidden.
    // sessionStorage is undefined in Internet Explorer when served via file protocol.
     true ? (0, _warning2.default)(false, '[history] Unable to save state; sessionStorage is not available') : void 0;

    return;
  }

  try {
    if (state == null) {
      window.sessionStorage.removeItem(createKey(key));
    } else {
      window.sessionStorage.setItem(createKey(key), JSON.stringify(state));
    }
  } catch (error) {
    if (SecurityErrors[error.name]) {
      // Blocking cookies in Chrome/Firefox/Safari throws SecurityError on any
      // attempt to access window.sessionStorage.
       true ? (0, _warning2.default)(false, '[history] Unable to save state; sessionStorage is not available due to security settings') : void 0;

      return;
    }

    if (QuotaExceededErrors[error.name] && window.sessionStorage.length === 0) {
      // Safari "private mode" throws QuotaExceededError.
       true ? (0, _warning2.default)(false, '[history] Unable to save state; sessionStorage is not available in Safari private mode') : void 0;

      return;
    }

    throw error;
  }
};

var readState = exports.readState = function readState(key) {
  var json = void 0;
  try {
    json = window.sessionStorage.getItem(createKey(key));
  } catch (error) {
    if (SecurityErrors[error.name]) {
      // Blocking cookies in Chrome/Firefox/Safari throws SecurityError on any
      // attempt to access window.sessionStorage.
       true ? (0, _warning2.default)(false, '[history] Unable to read state; sessionStorage is not available due to security settings') : void 0;

      return undefined;
    }
  }

  if (json) {
    try {
      return JSON.parse(json);
    } catch (error) {
      // Ignore invalid JSON.
    }
  }

  return undefined;
};

/***/ }),

/***/ 1329:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var strictUriEncode = __webpack_require__(1507);
var objectAssign = __webpack_require__(5);

function encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, opts),
					'[',
					index,
					']'
				].join('') : [
					encode(key, opts),
					'[',
					encode(index, opts),
					']=',
					encode(value, opts)
				].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'[]=',
					encode(value, opts)
				].join('');
			};

		default:
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'=',
					encode(value, opts)
				].join('');
			};
	}
}

function parserForArrayFormat(opts) {
	var result;

	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				} else if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	} else if (typeof input === 'object') {
		return keysSorter(Object.keys(input)).sort(function (a, b) {
			return Number(a) - Number(b);
		}).map(function (key) {
			return input[key];
		});
	}

	return input;
}

exports.extract = function (str) {
	return str.split('?')[1] || '';
};

exports.parse = function (str, opts) {
	opts = objectAssign({arrayFormat: 'none'}, opts);

	var formatter = parserForArrayFormat(opts);

	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^(\?|#|&)/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeURIComponent(val);

		formatter(decodeURIComponent(key), val, ret);
	});

	return Object.keys(ret).sort().reduce(function (result, key) {
		var val = ret[key];
		if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
			// Sort object keys, not values
			result[key] = keysSorter(val);
		} else {
			result[key] = val;
		}

		return result;
	}, Object.create(null));
};

exports.stringify = function (obj, opts) {
	var defaults = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = objectAssign(defaults, opts);

	var formatter = encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort().map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return encode(key, opts) + '=' + encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};


/***/ }),

/***/ 133:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _runTransitionHook = __webpack_require__(83);

var _runTransitionHook2 = _interopRequireDefault(_runTransitionHook);

var _PathUtils = __webpack_require__(23);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var useBasename = function useBasename(createHistory) {
  return function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var history = createHistory(options);
    var basename = options.basename;


    var addBasename = function addBasename(location) {
      if (!location) return location;

      if (basename && location.basename == null) {
        if (location.pathname.toLowerCase().indexOf(basename.toLowerCase()) === 0) {
          location.pathname = location.pathname.substring(basename.length);
          location.basename = basename;

          if (location.pathname === '') location.pathname = '/';
        } else {
          location.basename = '';
        }
      }

      return location;
    };

    var prependBasename = function prependBasename(location) {
      if (!basename) return location;

      var object = typeof location === 'string' ? (0, _PathUtils.parsePath)(location) : location;
      var pname = object.pathname;
      var normalizedBasename = basename.slice(-1) === '/' ? basename : basename + '/';
      var normalizedPathname = pname.charAt(0) === '/' ? pname.slice(1) : pname;
      var pathname = normalizedBasename + normalizedPathname;

      return _extends({}, object, {
        pathname: pathname
      });
    };

    // Override all read methods with basename-aware versions.
    var getCurrentLocation = function getCurrentLocation() {
      return addBasename(history.getCurrentLocation());
    };

    var listenBefore = function listenBefore(hook) {
      return history.listenBefore(function (location, callback) {
        return (0, _runTransitionHook2.default)(hook, addBasename(location), callback);
      });
    };

    var listen = function listen(listener) {
      return history.listen(function (location) {
        return listener(addBasename(location));
      });
    };

    // Override all write methods with basename-aware versions.
    var push = function push(location) {
      return history.push(prependBasename(location));
    };

    var replace = function replace(location) {
      return history.replace(prependBasename(location));
    };

    var createPath = function createPath(location) {
      return history.createPath(prependBasename(location));
    };

    var createHref = function createHref(location) {
      return history.createHref(prependBasename(location));
    };

    var createLocation = function createLocation(location) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      return addBasename(history.createLocation.apply(history, [prependBasename(location)].concat(args)));
    };

    return _extends({}, history, {
      getCurrentLocation: getCurrentLocation,
      listenBefore: listenBefore,
      listen: listen,
      push: push,
      replace: replace,
      createPath: createPath,
      createHref: createHref,
      createLocation: createLocation
    });
  };
};

exports.default = useBasename;

/***/ }),

/***/ 134:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _queryString = __webpack_require__(1329);

var _runTransitionHook = __webpack_require__(83);

var _runTransitionHook2 = _interopRequireDefault(_runTransitionHook);

var _LocationUtils = __webpack_require__(34);

var _PathUtils = __webpack_require__(23);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultStringifyQuery = function defaultStringifyQuery(query) {
  return (0, _queryString.stringify)(query).replace(/%20/g, '+');
};

var defaultParseQueryString = _queryString.parse;

/**
 * Returns a new createHistory function that may be used to create
 * history objects that know how to handle URL queries.
 */
var useQueries = function useQueries(createHistory) {
  return function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var history = createHistory(options);
    var stringifyQuery = options.stringifyQuery,
        parseQueryString = options.parseQueryString;


    if (typeof stringifyQuery !== 'function') stringifyQuery = defaultStringifyQuery;

    if (typeof parseQueryString !== 'function') parseQueryString = defaultParseQueryString;

    var decodeQuery = function decodeQuery(location) {
      if (!location) return location;

      if (location.query == null) location.query = parseQueryString(location.search.substring(1));

      return location;
    };

    var encodeQuery = function encodeQuery(location, query) {
      if (query == null) return location;

      var object = typeof location === 'string' ? (0, _PathUtils.parsePath)(location) : location;
      var queryString = stringifyQuery(query);
      var search = queryString ? '?' + queryString : '';

      return _extends({}, object, {
        search: search
      });
    };

    // Override all read methods with query-aware versions.
    var getCurrentLocation = function getCurrentLocation() {
      return decodeQuery(history.getCurrentLocation());
    };

    var listenBefore = function listenBefore(hook) {
      return history.listenBefore(function (location, callback) {
        return (0, _runTransitionHook2.default)(hook, decodeQuery(location), callback);
      });
    };

    var listen = function listen(listener) {
      return history.listen(function (location) {
        return listener(decodeQuery(location));
      });
    };

    // Override all write methods with query-aware versions.
    var push = function push(location) {
      return history.push(encodeQuery(location, location.query));
    };

    var replace = function replace(location) {
      return history.replace(encodeQuery(location, location.query));
    };

    var createPath = function createPath(location) {
      return history.createPath(encodeQuery(location, location.query));
    };

    var createHref = function createHref(location) {
      return history.createHref(encodeQuery(location, location.query));
    };

    var createLocation = function createLocation(location) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var newLocation = history.createLocation.apply(history, [encodeQuery(location, location.query)].concat(args));

      if (location.query) newLocation.query = (0, _LocationUtils.createQuery)(location.query);

      return decodeQuery(newLocation);
    };

    return _extends({}, history, {
      getCurrentLocation: getCurrentLocation,
      listenBefore: listenBefore,
      listen: listen,
      push: push,
      replace: replace,
      createPath: createPath,
      createHref: createHref,
      createLocation: createLocation
    });
  };
};

exports.default = useQueries;

/***/ }),

/***/ 1412:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_create_react_class__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_create_react_class___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_create_react_class__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Link__ = __webpack_require__(185);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };





/**
 * An <IndexLink> is used to link to an <IndexRoute>.
 */
var IndexLink = __WEBPACK_IMPORTED_MODULE_1_create_react_class___default()({
  displayName: 'IndexLink',

  render: function render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2__Link__["a" /* default */], _extends({}, this.props, { onlyActiveOnIndex: true }));
  }
});

/* unused harmony default export */ var _unused_webpack_default_export = (IndexLink);

/***/ }),

/***/ 1413:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_create_react_class__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_create_react_class___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_create_react_class__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__routerWarning__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_invariant__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__Redirect__ = __webpack_require__(187);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__ = __webpack_require__(50);







/**
 * An <IndexRedirect> is used to redirect from an indexRoute.
 */
/* eslint-disable react/require-render-return */
var IndexRedirect = __WEBPACK_IMPORTED_MODULE_0_create_react_class___default()({
  displayName: 'IndexRedirect',

  statics: {
    createRouteFromReactElement: function createRouteFromReactElement(element, parentRoute) {
      /* istanbul ignore else: sanity check */
      if (parentRoute) {
        parentRoute.indexRoute = __WEBPACK_IMPORTED_MODULE_4__Redirect__["a" /* default */].createRouteFromReactElement(element);
      } else {
         true ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__routerWarning__["a" /* default */])(false, 'An <IndexRedirect> does not make sense at the root of your route config') : void 0;
      }
    }
  },

  propTypes: {
    to: __WEBPACK_IMPORTED_MODULE_1_prop_types__["string"].isRequired,
    query: __WEBPACK_IMPORTED_MODULE_1_prop_types__["object"],
    state: __WEBPACK_IMPORTED_MODULE_1_prop_types__["object"],
    onEnter: __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__["c" /* falsy */],
    children: __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__["c" /* falsy */]
  },

  /* istanbul ignore next: sanity check */
  render: function render() {
     true ?  true ? __WEBPACK_IMPORTED_MODULE_3_invariant___default()(false, '<IndexRedirect> elements are for router configuration only and should not be rendered') : invariant(false) : void 0;
  }
});

/* unused harmony default export */ var _unused_webpack_default_export = (IndexRedirect);

/***/ }),

/***/ 1414:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_create_react_class__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_create_react_class___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_create_react_class__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__routerWarning__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_invariant__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__RouteUtils__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__ = __webpack_require__(50);







/**
 * An <IndexRoute> is used to specify its parent's <Route indexRoute> in
 * a JSX route config.
 */
/* eslint-disable react/require-render-return */
var IndexRoute = __WEBPACK_IMPORTED_MODULE_0_create_react_class___default()({
  displayName: 'IndexRoute',

  statics: {
    createRouteFromReactElement: function createRouteFromReactElement(element, parentRoute) {
      /* istanbul ignore else: sanity check */
      if (parentRoute) {
        parentRoute.indexRoute = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__RouteUtils__["c" /* createRouteFromReactElement */])(element);
      } else {
         true ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__routerWarning__["a" /* default */])(false, 'An <IndexRoute> does not make sense at the root of your route config') : void 0;
      }
    }
  },

  propTypes: {
    path: __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__["c" /* falsy */],
    component: __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__["a" /* component */],
    components: __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__["b" /* components */],
    getComponent: __WEBPACK_IMPORTED_MODULE_1_prop_types__["func"],
    getComponents: __WEBPACK_IMPORTED_MODULE_1_prop_types__["func"]
  },

  /* istanbul ignore next: sanity check */
  render: function render() {
     true ?  true ? __WEBPACK_IMPORTED_MODULE_3_invariant___default()(false, '<IndexRoute> elements are for router configuration only and should not be rendered') : invariant(false) : void 0;
  }
});

/* unused harmony default export */ var _unused_webpack_default_export = (IndexRoute);

/***/ }),

/***/ 1415:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_create_react_class__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_create_react_class___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_create_react_class__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_invariant__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__RouteUtils__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__InternalPropTypes__ = __webpack_require__(50);






/**
 * A <Route> is used to declare which components are rendered to the
 * page when the URL matches a given pattern.
 *
 * Routes are arranged in a nested tree structure. When a new URL is
 * requested, the tree is searched depth-first to find a route whose
 * path matches the URL.  When one is found, all routes in the tree
 * that lead to it are considered "active" and their components are
 * rendered into the DOM, nested in the same order as in the tree.
 */
/* eslint-disable react/require-render-return */
var Route = __WEBPACK_IMPORTED_MODULE_0_create_react_class___default()({
  displayName: 'Route',

  statics: {
    createRouteFromReactElement: __WEBPACK_IMPORTED_MODULE_3__RouteUtils__["c" /* createRouteFromReactElement */]
  },

  propTypes: {
    path: __WEBPACK_IMPORTED_MODULE_1_prop_types__["string"],
    component: __WEBPACK_IMPORTED_MODULE_4__InternalPropTypes__["a" /* component */],
    components: __WEBPACK_IMPORTED_MODULE_4__InternalPropTypes__["b" /* components */],
    getComponent: __WEBPACK_IMPORTED_MODULE_1_prop_types__["func"],
    getComponents: __WEBPACK_IMPORTED_MODULE_1_prop_types__["func"]
  },

  /* istanbul ignore next: sanity check */
  render: function render() {
     true ?  true ? __WEBPACK_IMPORTED_MODULE_2_invariant___default()(false, '<Route> elements are for router configuration only and should not be rendered') : invariant(false) : void 0;
  }
});

/* unused harmony default export */ var _unused_webpack_default_export = (Route);

/***/ }),

/***/ 1416:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_invariant__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_create_react_class__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_create_react_class___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_create_react_class__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_prop_types__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__createTransitionManager__ = __webpack_require__(191);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__ = __webpack_require__(50);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__RouterContext__ = __webpack_require__(117);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__RouteUtils__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__RouterUtils__ = __webpack_require__(188);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__routerWarning__ = __webpack_require__(39);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }













var propTypes = {
  history: __WEBPACK_IMPORTED_MODULE_3_prop_types__["object"],
  children: __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__["d" /* routes */],
  routes: __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__["d" /* routes */], // alias for children
  render: __WEBPACK_IMPORTED_MODULE_3_prop_types__["func"],
  createElement: __WEBPACK_IMPORTED_MODULE_3_prop_types__["func"],
  onError: __WEBPACK_IMPORTED_MODULE_3_prop_types__["func"],
  onUpdate: __WEBPACK_IMPORTED_MODULE_3_prop_types__["func"],

  // PRIVATE: For client-side rehydration of server match.
  matchContext: __WEBPACK_IMPORTED_MODULE_3_prop_types__["object"]
};

var prefixUnsafeLifecycleMethods = typeof __WEBPACK_IMPORTED_MODULE_1_react___default.a.forwardRef !== 'undefined';

/**
 * A <Router> is a high-level API for automatically setting up
 * a router that renders a <RouterContext> with all the props
 * it needs each time the URL changes.
 */
var Router = __WEBPACK_IMPORTED_MODULE_2_create_react_class___default()({
  displayName: 'Router',

  propTypes: propTypes,

  getDefaultProps: function getDefaultProps() {
    return {
      render: function render(props) {
        return __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_6__RouterContext__["a" /* default */], props);
      }
    };
  },
  getInitialState: function getInitialState() {
    return {
      location: null,
      routes: null,
      params: null,
      components: null
    };
  },
  handleError: function handleError(error) {
    if (this.props.onError) {
      this.props.onError.call(this, error);
    } else {
      // Throw errors by default so we don't silently swallow them!
      throw error; // This error probably occurred in getChildRoutes or getComponents.
    }
  },
  createRouterObject: function createRouterObject(state) {
    var matchContext = this.props.matchContext;

    if (matchContext) {
      return matchContext.router;
    }

    var history = this.props.history;

    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__RouterUtils__["a" /* createRouterObject */])(history, this.transitionManager, state);
  },
  createTransitionManager: function createTransitionManager() {
    var matchContext = this.props.matchContext;

    if (matchContext) {
      return matchContext.transitionManager;
    }

    var history = this.props.history;
    var _props = this.props,
        routes = _props.routes,
        children = _props.children;


    !history.getCurrentLocation ?  true ? __WEBPACK_IMPORTED_MODULE_0_invariant___default()(false, 'You have provided a history object created with history v4.x or v2.x ' + 'and earlier. This version of React Router is only compatible with v3 ' + 'history objects. Please change to history v3.x.') : invariant(false) : void 0;

    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__createTransitionManager__["a" /* default */])(history, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_7__RouteUtils__["b" /* createRoutes */])(routes || children));
  },


  // this method will be updated to UNSAFE_componentWillMount below for React versions >= 16.3
  componentWillMount: function componentWillMount() {
    var _this = this;

    this.transitionManager = this.createTransitionManager();
    this.router = this.createRouterObject(this.state);

    this._unlisten = this.transitionManager.listen(function (error, state) {
      if (error) {
        _this.handleError(error);
      } else {
        // Keep the identity of this.router because of a caveat in ContextUtils:
        // they only work if the object identity is preserved.
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_8__RouterUtils__["b" /* assignRouterState */])(_this.router, state);
        _this.setState(state, _this.props.onUpdate);
      }
    });
  },


  // this method will be updated to UNSAFE_componentWillReceiveProps below for React versions >= 16.3
  /* istanbul ignore next: sanity check */
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
     true ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__routerWarning__["a" /* default */])(nextProps.history === this.props.history, 'You cannot change <Router history>; it will be ignored') : void 0;

     true ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_9__routerWarning__["a" /* default */])((nextProps.routes || nextProps.children) === (this.props.routes || this.props.children), 'You cannot change <Router routes>; it will be ignored') : void 0;
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this._unlisten) this._unlisten();
  },
  render: function render() {
    var _state = this.state,
        location = _state.location,
        routes = _state.routes,
        params = _state.params,
        components = _state.components;

    var _props2 = this.props,
        createElement = _props2.createElement,
        render = _props2.render,
        props = _objectWithoutProperties(_props2, ['createElement', 'render']);

    if (location == null) return null; // Async match

    // Only forward non-Router-specific props to routing context, as those are
    // the only ones that might be custom routing context props.
    Object.keys(propTypes).forEach(function (propType) {
      return delete props[propType];
    });

    return render(_extends({}, props, {
      router: this.router,
      location: location,
      routes: routes,
      params: params,
      components: components,
      createElement: createElement
    }));
  }
});

if (prefixUnsafeLifecycleMethods) {
  Router.prototype.UNSAFE_componentWillReceiveProps = Router.prototype.componentWillReceiveProps;
  Router.prototype.UNSAFE_componentWillMount = Router.prototype.componentWillMount;
  delete Router.prototype.componentWillReceiveProps;
  delete Router.prototype.componentWillMount;
}

/* harmony default export */ __webpack_exports__["a"] = (Router);

/***/ }),

/***/ 1417:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AsyncUtils__ = __webpack_require__(114);
/* harmony export (immutable) */ __webpack_exports__["a"] = getTransitionUtils;
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }



var PendingHooks = function PendingHooks() {
  var _this = this;

  _classCallCheck(this, PendingHooks);

  this.hooks = [];

  this.add = function (hook) {
    return _this.hooks.push(hook);
  };

  this.remove = function (hook) {
    return _this.hooks = _this.hooks.filter(function (h) {
      return h !== hook;
    });
  };

  this.has = function (hook) {
    return _this.hooks.indexOf(hook) !== -1;
  };

  this.clear = function () {
    return _this.hooks = [];
  };
};

function getTransitionUtils() {
  var enterHooks = new PendingHooks();
  var changeHooks = new PendingHooks();

  function createTransitionHook(hook, route, asyncArity, pendingHooks) {
    var isSync = hook.length < asyncArity;

    var transitionHook = function transitionHook() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      hook.apply(route, args);

      if (isSync) {
        var callback = args[args.length - 1];
        // Assume hook executes synchronously and
        // automatically call the callback.
        callback();
      }
    };

    pendingHooks.add(transitionHook);

    return transitionHook;
  }

  function getEnterHooks(routes) {
    return routes.reduce(function (hooks, route) {
      if (route.onEnter) hooks.push(createTransitionHook(route.onEnter, route, 3, enterHooks));
      return hooks;
    }, []);
  }

  function getChangeHooks(routes) {
    return routes.reduce(function (hooks, route) {
      if (route.onChange) hooks.push(createTransitionHook(route.onChange, route, 4, changeHooks));
      return hooks;
    }, []);
  }

  function runTransitionHooks(length, iter, callback) {
    if (!length) {
      callback();
      return;
    }

    var redirectInfo = void 0;
    function replace(location) {
      redirectInfo = location;
    }

    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__AsyncUtils__["b" /* loopAsync */])(length, function (index, next, done) {
      iter(index, replace, function (error) {
        if (error || redirectInfo) {
          done(error, redirectInfo); // No need to continue.
        } else {
          next();
        }
      });
    }, callback);
  }

  /**
   * Runs all onEnter hooks in the given array of routes in order
   * with onEnter(nextState, replace, callback) and calls
   * callback(error, redirectInfo) when finished. The first hook
   * to use replace short-circuits the loop.
   *
   * If a hook needs to run asynchronously, it may use the callback
   * function. However, doing so will cause the transition to pause,
   * which could lead to a non-responsive UI if the hook is slow.
   */
  function runEnterHooks(routes, nextState, callback) {
    enterHooks.clear();
    var hooks = getEnterHooks(routes);
    return runTransitionHooks(hooks.length, function (index, replace, next) {
      var wrappedNext = function wrappedNext() {
        if (enterHooks.has(hooks[index])) {
          next.apply(undefined, arguments);
          enterHooks.remove(hooks[index]);
        }
      };
      hooks[index](nextState, replace, wrappedNext);
    }, callback);
  }

  /**
   * Runs all onChange hooks in the given array of routes in order
   * with onChange(prevState, nextState, replace, callback) and calls
   * callback(error, redirectInfo) when finished. The first hook
   * to use replace short-circuits the loop.
   *
   * If a hook needs to run asynchronously, it may use the callback
   * function. However, doing so will cause the transition to pause,
   * which could lead to a non-responsive UI if the hook is slow.
   */
  function runChangeHooks(routes, state, nextState, callback) {
    changeHooks.clear();
    var hooks = getChangeHooks(routes);
    return runTransitionHooks(hooks.length, function (index, replace, next) {
      var wrappedNext = function wrappedNext() {
        if (changeHooks.has(hooks[index])) {
          next.apply(undefined, arguments);
          changeHooks.remove(hooks[index]);
        }
      };
      hooks[index](state, nextState, replace, wrappedNext);
    }, callback);
  }

  /**
   * Runs all onLeave hooks in the given array of routes in order.
   */
  function runLeaveHooks(routes, prevState) {
    for (var i = 0, len = routes.length; i < len; ++i) {
      if (routes[i].onLeave) routes[i].onLeave.call(routes[i], prevState);
    }
  }

  return {
    runEnterHooks: runEnterHooks,
    runChangeHooks: runChangeHooks,
    runLeaveHooks: runLeaveHooks
  };
}

/***/ }),

/***/ 1418:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__RouterContext__ = __webpack_require__(117);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__routerWarning__ = __webpack_require__(39);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };





/* unused harmony default export */ var _unused_webpack_default_export = (function () {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  if (true) {
    middlewares.forEach(function (middleware, index) {
       true ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__routerWarning__["a" /* default */])(middleware.renderRouterContext || middleware.renderRouteComponent, 'The middleware specified at index ' + index + ' does not appear to be ' + 'a valid React Router middleware.') : void 0;
    });
  }

  var withContext = middlewares.map(function (middleware) {
    return middleware.renderRouterContext;
  }).filter(Boolean);
  var withComponent = middlewares.map(function (middleware) {
    return middleware.renderRouteComponent;
  }).filter(Boolean);

  var makeCreateElement = function makeCreateElement() {
    var baseCreateElement = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : __WEBPACK_IMPORTED_MODULE_0_react__["createElement"];
    return function (Component, props) {
      return withComponent.reduceRight(function (previous, renderRouteComponent) {
        return renderRouteComponent(previous, props);
      }, baseCreateElement(Component, props));
    };
  };

  return function (renderProps) {
    return withContext.reduceRight(function (previous, renderRouterContext) {
      return renderRouterContext(previous, renderProps);
    }, __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_1__RouterContext__["a" /* default */], _extends({}, renderProps, {
      createElement: makeCreateElement(renderProps.createElement)
    })));
  };
});

/***/ }),

/***/ 1419:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_lib_createBrowserHistory__ = __webpack_require__(1217);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_lib_createBrowserHistory___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_history_lib_createBrowserHistory__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__createRouterHistory__ = __webpack_require__(190);


/* unused harmony default export */ var _unused_webpack_default_export = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__createRouterHistory__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_0_history_lib_createBrowserHistory___default.a));

/***/ }),

/***/ 1420:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__PatternUtils__ = __webpack_require__(38);


function routeParamsChanged(route, prevState, nextState) {
  if (!route.path) return false;

  var paramNames = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__PatternUtils__["a" /* getParamNames */])(route.path);

  return paramNames.some(function (paramName) {
    return prevState.params[paramName] !== nextState.params[paramName];
  });
}

/**
 * Returns an object of { leaveRoutes, changeRoutes, enterRoutes } determined by
 * the change from prevState to nextState. We leave routes if either
 * 1) they are not in the next state or 2) they are in the next state
 * but their params have changed (i.e. /users/123 => /users/456).
 *
 * leaveRoutes are ordered starting at the leaf route of the tree
 * we're leaving up to the common parent route. enterRoutes are ordered
 * from the top of the tree we're entering down to the leaf route.
 *
 * changeRoutes are any routes that didn't leave or enter during
 * the transition.
 */
function computeChangedRoutes(prevState, nextState) {
  var prevRoutes = prevState && prevState.routes;
  var nextRoutes = nextState.routes;

  var leaveRoutes = void 0,
      changeRoutes = void 0,
      enterRoutes = void 0;
  if (prevRoutes) {
    var parentIsLeaving = false;
    leaveRoutes = prevRoutes.filter(function (route) {
      if (parentIsLeaving) {
        return true;
      } else {
        var isLeaving = nextRoutes.indexOf(route) === -1 || routeParamsChanged(route, prevState, nextState);
        if (isLeaving) parentIsLeaving = true;
        return isLeaving;
      }
    });

    // onLeave hooks start at the leaf route.
    leaveRoutes.reverse();

    enterRoutes = [];
    changeRoutes = [];

    nextRoutes.forEach(function (route) {
      var isNew = prevRoutes.indexOf(route) === -1;
      var paramsChanged = leaveRoutes.indexOf(route) !== -1;

      if (isNew || paramsChanged) enterRoutes.push(route);else changeRoutes.push(route);
    });
  } else {
    leaveRoutes = [];
    changeRoutes = [];
    enterRoutes = nextRoutes;
  }

  return {
    leaveRoutes: leaveRoutes,
    changeRoutes: changeRoutes,
    enterRoutes: enterRoutes
  };
}

/* harmony default export */ __webpack_exports__["a"] = (computeChangedRoutes);

/***/ }),

/***/ 1421:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AsyncUtils__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__PromiseUtils__ = __webpack_require__(186);



function getComponentsForRoute(nextState, route, callback) {
  if (route.component || route.components) {
    callback(null, route.component || route.components);
    return;
  }

  var getComponent = route.getComponent || route.getComponents;
  if (getComponent) {
    var componentReturn = getComponent.call(route, nextState, callback);
    if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__PromiseUtils__["a" /* isPromise */])(componentReturn)) componentReturn.then(function (component) {
      return callback(null, component);
    }, callback);
  } else {
    callback();
  }
}

/**
 * Asynchronously fetches all components needed for the given router
 * state and calls callback(error, components) when finished.
 *
 * Note: This operation may finish synchronously if no routes have an
 * asynchronous getComponents method.
 */
function getComponents(nextState, callback) {
  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__AsyncUtils__["a" /* mapAsync */])(nextState.routes, function (route, index, callback) {
    getComponentsForRoute(nextState, route, callback);
  }, callback);
}

/* harmony default export */ __webpack_exports__["a"] = (getComponents);

/***/ }),

/***/ 1422:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__PatternUtils__ = __webpack_require__(38);


/**
 * Extracts an object of params the given route cares about from
 * the given params object.
 */
function getRouteParams(route, params) {
  var routeParams = {};

  if (!route.path) return routeParams;

  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__PatternUtils__["a" /* getParamNames */])(route.path).forEach(function (p) {
    if (Object.prototype.hasOwnProperty.call(params, p)) {
      routeParams[p] = params[p];
    }
  });

  return routeParams;
}

/* harmony default export */ __webpack_exports__["a"] = (getRouteParams);

/***/ }),

/***/ 1423:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_lib_createHashHistory__ = __webpack_require__(1218);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_lib_createHashHistory___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_history_lib_createHashHistory__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__createRouterHistory__ = __webpack_require__(190);


/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__createRouterHistory__["a" /* default */])(__WEBPACK_IMPORTED_MODULE_0_history_lib_createHashHistory___default.a));

/***/ }),

/***/ 1424:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__PatternUtils__ = __webpack_require__(38);
/* harmony export (immutable) */ __webpack_exports__["a"] = isActive;
var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };



function deepEqual(a, b) {
  if (a == b) return true;

  if (a == null || b == null) return false;

  if (Array.isArray(a)) {
    return Array.isArray(b) && a.length === b.length && a.every(function (item, index) {
      return deepEqual(item, b[index]);
    });
  }

  if ((typeof a === 'undefined' ? 'undefined' : _typeof(a)) === 'object') {
    for (var p in a) {
      if (!Object.prototype.hasOwnProperty.call(a, p)) {
        continue;
      }

      if (a[p] === undefined) {
        if (b[p] !== undefined) {
          return false;
        }
      } else if (!Object.prototype.hasOwnProperty.call(b, p)) {
        return false;
      } else if (!deepEqual(a[p], b[p])) {
        return false;
      }
    }

    return true;
  }

  return String(a) === String(b);
}

/**
 * Returns true if the current pathname matches the supplied one, net of
 * leading and trailing slash normalization. This is sufficient for an
 * indexOnly route match.
 */
function pathIsActive(pathname, currentPathname) {
  // Normalize leading slash for consistency. Leading slash on pathname has
  // already been normalized in isActive. See caveat there.
  if (currentPathname.charAt(0) !== '/') {
    currentPathname = '/' + currentPathname;
  }

  // Normalize the end of both path names too. Maybe `/foo/` shouldn't show
  // `/foo` as active, but in this case, we would already have failed the
  // match.
  if (pathname.charAt(pathname.length - 1) !== '/') {
    pathname += '/';
  }
  if (currentPathname.charAt(currentPathname.length - 1) !== '/') {
    currentPathname += '/';
  }

  return currentPathname === pathname;
}

/**
 * Returns true if the given pathname matches the active routes and params.
 */
function routeIsActive(pathname, routes, params) {
  var remainingPathname = pathname,
      paramNames = [],
      paramValues = [];

  // for...of would work here but it's probably slower post-transpilation.
  for (var i = 0, len = routes.length; i < len; ++i) {
    var route = routes[i];
    var pattern = route.path || '';

    if (pattern.charAt(0) === '/') {
      remainingPathname = pathname;
      paramNames = [];
      paramValues = [];
    }

    if (remainingPathname !== null && pattern) {
      var matched = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__PatternUtils__["b" /* matchPattern */])(pattern, remainingPathname);
      if (matched) {
        remainingPathname = matched.remainingPathname;
        paramNames = [].concat(paramNames, matched.paramNames);
        paramValues = [].concat(paramValues, matched.paramValues);
      } else {
        remainingPathname = null;
      }

      if (remainingPathname === '') {
        // We have an exact match on the route. Just check that all the params
        // match.
        // FIXME: This doesn't work on repeated params.
        return paramNames.every(function (paramName, index) {
          return String(paramValues[index]) === String(params[paramName]);
        });
      }
    }
  }

  return false;
}

/**
 * Returns true if all key/value pairs in the given query are
 * currently active.
 */
function queryIsActive(query, activeQuery) {
  if (activeQuery == null) return query == null;

  if (query == null) return true;

  return deepEqual(query, activeQuery);
}

/**
 * Returns true if a <Link> to the given pathname/query combination is
 * currently active.
 */
function isActive(_ref, indexOnly, currentLocation, routes, params) {
  var pathname = _ref.pathname,
      query = _ref.query;

  if (currentLocation == null) return false;

  // TODO: This is a bit ugly. It keeps around support for treating pathnames
  // without preceding slashes as absolute paths, but possibly also works
  // around the same quirks with basenames as in matchRoutes.
  if (pathname.charAt(0) !== '/') {
    pathname = '/' + pathname;
  }

  if (!pathIsActive(pathname, currentLocation.pathname)) {
    // The path check is necessary and sufficient for indexOnly, but otherwise
    // we still need to check the routes.
    if (indexOnly || !routeIsActive(pathname, routes, params)) {
      return false;
    }
  }

  return queryIsActive(query, currentLocation.query);
}

/***/ }),

/***/ 1425:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_lib_Actions__ = __webpack_require__(53);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_lib_Actions___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_history_lib_Actions__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_invariant__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__createMemoryHistory__ = __webpack_require__(189);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__createTransitionManager__ = __webpack_require__(191);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__RouteUtils__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__RouterUtils__ = __webpack_require__(188);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }









/**
 * A high-level API to be used for server-side rendering.
 *
 * This function matches a location to a set of routes and calls
 * callback(error, redirectLocation, renderProps) when finished.
 *
 * Note: You probably don't want to use this in a browser unless you're using
 * server-side rendering with async routes.
 */
function match(_ref, callback) {
  var history = _ref.history,
      routes = _ref.routes,
      location = _ref.location,
      options = _objectWithoutProperties(_ref, ['history', 'routes', 'location']);

  !(history || location) ?  true ? __WEBPACK_IMPORTED_MODULE_1_invariant___default()(false, 'match needs a history or a location') : invariant(false) : void 0;

  history = history ? history : __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__createMemoryHistory__["a" /* default */])(options);
  var transitionManager = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__createTransitionManager__["a" /* default */])(history, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__RouteUtils__["b" /* createRoutes */])(routes));

  if (location) {
    // Allow match({ location: '/the/path', ... })
    location = history.createLocation(location);
  } else {
    location = history.getCurrentLocation();
  }

  transitionManager.match(location, function (error, redirectLocation, nextState) {
    var renderProps = void 0;

    if (nextState) {
      var router = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__RouterUtils__["a" /* createRouterObject */])(history, transitionManager, nextState);
      renderProps = _extends({}, nextState, {
        router: router,
        matchContext: { transitionManager: transitionManager, router: router }
      });
    }

    callback(error, redirectLocation && history.createLocation(redirectLocation, __WEBPACK_IMPORTED_MODULE_0_history_lib_Actions__["REPLACE"]), renderProps);
  });
}

/* unused harmony default export */ var _unused_webpack_default_export = (match);

/***/ }),

/***/ 1426:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__AsyncUtils__ = __webpack_require__(114);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__PromiseUtils__ = __webpack_require__(186);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__PatternUtils__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__routerWarning__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__RouteUtils__ = __webpack_require__(26);
/* harmony export (immutable) */ __webpack_exports__["a"] = matchRoutes;
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };







function getChildRoutes(route, location, paramNames, paramValues, callback) {
  if (route.childRoutes) {
    return [null, route.childRoutes];
  }
  if (!route.getChildRoutes) {
    return [];
  }

  var sync = true,
      result = void 0;

  var partialNextState = {
    location: location,
    params: createParams(paramNames, paramValues)
  };

  var childRoutesReturn = route.getChildRoutes(partialNextState, function (error, childRoutes) {
    childRoutes = !error && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__RouteUtils__["b" /* createRoutes */])(childRoutes);
    if (sync) {
      result = [error, childRoutes];
      return;
    }

    callback(error, childRoutes);
  });

  if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__PromiseUtils__["a" /* isPromise */])(childRoutesReturn)) childRoutesReturn.then(function (childRoutes) {
    return callback(null, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__RouteUtils__["b" /* createRoutes */])(childRoutes));
  }, callback);

  sync = false;
  return result; // Might be undefined.
}

function getIndexRoute(route, location, paramNames, paramValues, callback) {
  if (route.indexRoute) {
    callback(null, route.indexRoute);
  } else if (route.getIndexRoute) {
    var partialNextState = {
      location: location,
      params: createParams(paramNames, paramValues)
    };

    var indexRoutesReturn = route.getIndexRoute(partialNextState, function (error, indexRoute) {
      callback(error, !error && __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__RouteUtils__["b" /* createRoutes */])(indexRoute)[0]);
    });

    if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__PromiseUtils__["a" /* isPromise */])(indexRoutesReturn)) indexRoutesReturn.then(function (indexRoute) {
      return callback(null, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__RouteUtils__["b" /* createRoutes */])(indexRoute)[0]);
    }, callback);
  } else if (route.childRoutes || route.getChildRoutes) {
    var onChildRoutes = function onChildRoutes(error, childRoutes) {
      if (error) {
        callback(error);
        return;
      }

      var pathless = childRoutes.filter(function (childRoute) {
        return !childRoute.path;
      });

      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__AsyncUtils__["b" /* loopAsync */])(pathless.length, function (index, next, done) {
        getIndexRoute(pathless[index], location, paramNames, paramValues, function (error, indexRoute) {
          if (error || indexRoute) {
            var routes = [pathless[index]].concat(Array.isArray(indexRoute) ? indexRoute : [indexRoute]);
            done(error, routes);
          } else {
            next();
          }
        });
      }, function (err, routes) {
        callback(null, routes);
      });
    };

    var result = getChildRoutes(route, location, paramNames, paramValues, onChildRoutes);
    if (result) {
      onChildRoutes.apply(undefined, result);
    }
  } else {
    callback();
  }
}

function assignParams(params, paramNames, paramValues) {
  return paramNames.reduce(function (params, paramName, index) {
    var paramValue = paramValues && paramValues[index];

    if (Array.isArray(params[paramName])) {
      params[paramName].push(paramValue);
    } else if (paramName in params) {
      params[paramName] = [params[paramName], paramValue];
    } else {
      params[paramName] = paramValue;
    }

    return params;
  }, params);
}

function createParams(paramNames, paramValues) {
  return assignParams({}, paramNames, paramValues);
}

function matchRouteDeep(route, location, remainingPathname, paramNames, paramValues, callback) {
  var pattern = route.path || '';

  if (pattern.charAt(0) === '/') {
    remainingPathname = location.pathname;
    paramNames = [];
    paramValues = [];
  }

  // Only try to match the path if the route actually has a pattern, and if
  // we're not just searching for potential nested absolute paths.
  if (remainingPathname !== null && pattern) {
    try {
      var matched = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__PatternUtils__["b" /* matchPattern */])(pattern, remainingPathname);
      if (matched) {
        remainingPathname = matched.remainingPathname;
        paramNames = [].concat(paramNames, matched.paramNames);
        paramValues = [].concat(paramValues, matched.paramValues);
      } else {
        remainingPathname = null;
      }
    } catch (error) {
      callback(error);
    }

    // By assumption, pattern is non-empty here, which is the prerequisite for
    // actually terminating a match.
    if (remainingPathname === '') {
      var match = {
        routes: [route],
        params: createParams(paramNames, paramValues)
      };

      getIndexRoute(route, location, paramNames, paramValues, function (error, indexRoute) {
        if (error) {
          callback(error);
        } else {
          if (Array.isArray(indexRoute)) {
            var _match$routes;

             true ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__routerWarning__["a" /* default */])(indexRoute.every(function (route) {
              return !route.path;
            }), 'Index routes should not have paths') : void 0;
            (_match$routes = match.routes).push.apply(_match$routes, indexRoute);
          } else if (indexRoute) {
             true ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__routerWarning__["a" /* default */])(!indexRoute.path, 'Index routes should not have paths') : void 0;
            match.routes.push(indexRoute);
          }

          callback(null, match);
        }
      });

      return;
    }
  }

  if (remainingPathname != null || route.childRoutes) {
    // Either a) this route matched at least some of the path or b)
    // we don't have to load this route's children asynchronously. In
    // either case continue checking for matches in the subtree.
    var onChildRoutes = function onChildRoutes(error, childRoutes) {
      if (error) {
        callback(error);
      } else if (childRoutes) {
        // Check the child routes to see if any of them match.
        matchRoutes(childRoutes, location, function (error, match) {
          if (error) {
            callback(error);
          } else if (match) {
            // A child route matched! Augment the match and pass it up the stack.
            match.routes.unshift(route);
            callback(null, match);
          } else {
            callback();
          }
        }, remainingPathname, paramNames, paramValues);
      } else {
        callback();
      }
    };

    var result = getChildRoutes(route, location, paramNames, paramValues, onChildRoutes);
    if (result) {
      onChildRoutes.apply(undefined, result);
    }
  } else {
    callback();
  }
}

/**
 * Asynchronously matches the given location to a set of routes and calls
 * callback(error, state) when finished. The state object will have the
 * following properties:
 *
 * - routes       An array of routes that matched, in hierarchical order
 * - params       An object of URL parameters
 *
 * Note: This operation may finish synchronously if no routes have an
 * asynchronous getChildRoutes method.
 */
function matchRoutes(routes, location, callback, remainingPathname) {
  var paramNames = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  var paramValues = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : [];

  if (remainingPathname === undefined) {
    // TODO: This is a little bit ugly, but it works around a quirk in history
    // that strips the leading slash from pathnames when using basenames with
    // trailing slashes.
    if (location.pathname.charAt(0) !== '/') {
      location = _extends({}, location, {
        pathname: '/' + location.pathname
      });
    }
    remainingPathname = location.pathname;
  }

  __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__AsyncUtils__["b" /* loopAsync */])(routes.length, function (index, next, done) {
    matchRouteDeep(routes[index], location, remainingPathname, paramNames, paramValues, function (error, match) {
      if (error || match) {
        done(error, match);
      } else {
        next();
      }
    });
  }, callback);
}

/***/ }),

/***/ 1427:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_invariant__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_create_react_class__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_create_react_class___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_create_react_class__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_hoist_non_react_statics__ = __webpack_require__(135);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_hoist_non_react_statics___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_hoist_non_react_statics__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ContextUtils__ = __webpack_require__(115);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__PropTypes__ = __webpack_require__(116);
/* unused harmony export default */
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };








function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function withRouter(WrappedComponent, options) {
  var withRef = options && options.withRef;

  var WithRouter = __WEBPACK_IMPORTED_MODULE_2_create_react_class___default()({
    displayName: 'WithRouter',

    mixins: [__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__ContextUtils__["b" /* ContextSubscriber */])('router')],

    contextTypes: { router: __WEBPACK_IMPORTED_MODULE_5__PropTypes__["a" /* routerShape */] },
    propTypes: { router: __WEBPACK_IMPORTED_MODULE_5__PropTypes__["a" /* routerShape */] },

    getWrappedInstance: function getWrappedInstance() {
      !withRef ?  true ? __WEBPACK_IMPORTED_MODULE_0_invariant___default()(false, 'To access the wrapped instance, you need to specify ' + '`{ withRef: true }` as the second argument of the withRouter() call.') : invariant(false) : void 0;

      return this.wrappedInstance;
    },
    render: function render() {
      var _this = this;

      var router = this.props.router || this.context.router;
      if (!router) {
        return __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(WrappedComponent, this.props);
      }

      var params = router.params,
          location = router.location,
          routes = router.routes;

      var props = _extends({}, this.props, { router: router, params: params, location: location, routes: routes });

      if (withRef) {
        props.ref = function (c) {
          _this.wrappedInstance = c;
        };
      }

      return __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(WrappedComponent, props);
    }
  });

  WithRouter.displayName = 'withRouter(' + getDisplayName(WrappedComponent) + ')';
  WithRouter.WrappedComponent = WrappedComponent;

  return __WEBPACK_IMPORTED_MODULE_3_hoist_non_react_statics___default()(WithRouter, WrappedComponent);
}

/***/ }),

/***/ 15:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const Artist = __webpack_require__(16);

const artists = _.times(20, () => Artist());

module.exports = artists;

/***/ }),

/***/ 1507:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};


/***/ }),

/***/ 16:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const faker = __webpack_require__(126);
const GENRES = __webpack_require__(211);

module.exports = function () {
  return {
    _id: _.uniqueId(),
    name: faker.name.findName(),
    age: randomBetween(15, 45),
    yearsActive: randomBetween(0, 15),
    image: faker.image.avatar(),
    genre: getGenre(),
    website: faker.internet.url(),
    netWorth: randomBetween(0, 5000000),
    labelName: faker.company.companyName(),
    retired: faker.random.boolean(),
    albums: getAlbums()
  };
};

function getAlbums() {
  return _.times(randomBetween(0, 5), () => {
    const copiesSold = randomBetween(0, 1000000);

    return {
      title: _.capitalize(faker.random.words()),
      date: faker.date.past(),
      copiesSold,
      numberTracks: randomBetween(1, 20),
      image: getAlbumImage(),
      revenue: copiesSold * 12.99
    };
  });
}

function getAlbumImage() {
  const types = _.keys(faker.image);
  const method = randomEntry(types);

  return faker.image[method]();
}

function getGenre() {
  return randomEntry(GENRES);
}

function randomEntry(array) {
  return array[~~(Math.random() * array.length)];
}

function randomBetween(min, max) {
  return ~~(Math.random() * (max - min)) + min;
}

/***/ }),

/***/ 185:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_create_react_class__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_create_react_class___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_create_react_class__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_prop_types__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_invariant__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__PropTypes__ = __webpack_require__(116);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__ContextUtils__ = __webpack_require__(115);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }








function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

// TODO: De-duplicate against hasAnyProperties in createTransitionManager.
function isEmptyObject(object) {
  for (var p in object) {
    if (Object.prototype.hasOwnProperty.call(object, p)) return false;
  }return true;
}

function resolveToLocation(to, router) {
  return typeof to === 'function' ? to(router.location) : to;
}

/**
 * A <Link> is used to create an <a> element that links to a route.
 * When that route is active, the link gets the value of its
 * activeClassName prop.
 *
 * For example, assuming you have the following route:
 *
 *   <Route path="/posts/:postID" component={Post} />
 *
 * You could use the following component to link to that route:
 *
 *   <Link to={`/posts/${post.id}`} />
 */
var Link = __WEBPACK_IMPORTED_MODULE_1_create_react_class___default()({
  displayName: 'Link',

  mixins: [__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__ContextUtils__["b" /* ContextSubscriber */])('router')],

  contextTypes: {
    router: __WEBPACK_IMPORTED_MODULE_4__PropTypes__["a" /* routerShape */]
  },

  propTypes: {
    to: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_prop_types__["oneOfType"])([__WEBPACK_IMPORTED_MODULE_2_prop_types__["string"], __WEBPACK_IMPORTED_MODULE_2_prop_types__["object"], __WEBPACK_IMPORTED_MODULE_2_prop_types__["func"]]),
    activeStyle: __WEBPACK_IMPORTED_MODULE_2_prop_types__["object"],
    activeClassName: __WEBPACK_IMPORTED_MODULE_2_prop_types__["string"],
    onlyActiveOnIndex: __WEBPACK_IMPORTED_MODULE_2_prop_types__["bool"].isRequired,
    onClick: __WEBPACK_IMPORTED_MODULE_2_prop_types__["func"],
    target: __WEBPACK_IMPORTED_MODULE_2_prop_types__["string"],
    innerRef: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_prop_types__["oneOfType"])([__WEBPACK_IMPORTED_MODULE_2_prop_types__["string"], __WEBPACK_IMPORTED_MODULE_2_prop_types__["func"], __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_prop_types__["shape"])({ current: __WEBPACK_IMPORTED_MODULE_2_prop_types__["elementType"] })])
  },

  getDefaultProps: function getDefaultProps() {
    return {
      onlyActiveOnIndex: false,
      style: {}
    };
  },
  handleClick: function handleClick(event) {
    if (this.props.onClick) this.props.onClick(event);

    if (event.defaultPrevented) return;

    var router = this.context.router;

    !router ?  true ? __WEBPACK_IMPORTED_MODULE_3_invariant___default()(false, '<Link>s rendered outside of a router context cannot navigate.') : invariant(false) : void 0;

    if (isModifiedEvent(event) || !isLeftClickEvent(event)) return;

    // If target prop is set (e.g. to "_blank"), let browser handle link.
    /* istanbul ignore if: untestable with Karma */
    if (this.props.target) return;

    event.preventDefault();

    router.push(resolveToLocation(this.props.to, router));
  },
  render: function render() {
    var _props = this.props,
        to = _props.to,
        activeClassName = _props.activeClassName,
        activeStyle = _props.activeStyle,
        onlyActiveOnIndex = _props.onlyActiveOnIndex,
        innerRef = _props.innerRef,
        props = _objectWithoutProperties(_props, ['to', 'activeClassName', 'activeStyle', 'onlyActiveOnIndex', 'innerRef']);

    // Ignore if rendered outside the context of router to simplify unit testing.


    var router = this.context.router;


    if (router) {
      // If user does not specify a `to` prop, return an empty anchor tag.
      if (!to) {
        return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('a', _extends({}, props, { ref: innerRef }));
      }

      var toLocation = resolveToLocation(to, router);
      props.href = router.createHref(toLocation);

      if (activeClassName || activeStyle != null && !isEmptyObject(activeStyle)) {
        if (router.isActive(toLocation, onlyActiveOnIndex)) {
          if (activeClassName) {
            if (props.className) {
              props.className += ' ' + activeClassName;
            } else {
              props.className = activeClassName;
            }
          }

          if (activeStyle) props.style = _extends({}, props.style, activeStyle);
        }
      }
    }

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('a', _extends({}, props, { onClick: this.handleClick, ref: innerRef }));
  }
});

/* harmony default export */ __webpack_exports__["a"] = (Link);

/***/ }),

/***/ 186:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = isPromise;
function isPromise(obj) {
  return obj && typeof obj.then === 'function';
}

/***/ }),

/***/ 187:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_create_react_class__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_create_react_class___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_create_react_class__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_prop_types__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_invariant__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_invariant__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__RouteUtils__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__PatternUtils__ = __webpack_require__(38);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__ = __webpack_require__(50);







/**
 * A <Redirect> is used to declare another URL path a client should
 * be sent to when they request a given URL.
 *
 * Redirects are placed alongside routes in the route configuration
 * and are traversed in the same manner.
 */
/* eslint-disable react/require-render-return */
var Redirect = __WEBPACK_IMPORTED_MODULE_0_create_react_class___default()({
  displayName: 'Redirect',

  statics: {
    createRouteFromReactElement: function createRouteFromReactElement(element) {
      var route = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__RouteUtils__["c" /* createRouteFromReactElement */])(element);

      if (route.from) route.path = route.from;

      route.onEnter = function (nextState, replace) {
        var location = nextState.location,
            params = nextState.params;


        var pathname = void 0;
        if (route.to.charAt(0) === '/') {
          pathname = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__PatternUtils__["c" /* formatPattern */])(route.to, params);
        } else if (!route.to) {
          pathname = location.pathname;
        } else {
          var routeIndex = nextState.routes.indexOf(route);
          var parentPattern = Redirect.getRoutePattern(nextState.routes, routeIndex - 1);
          var pattern = parentPattern.replace(/\/*$/, '/') + route.to;
          pathname = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__PatternUtils__["c" /* formatPattern */])(pattern, params);
        }

        replace({
          pathname: pathname,
          query: route.query || location.query,
          state: route.state || location.state
        });
      };

      return route;
    },
    getRoutePattern: function getRoutePattern(routes, routeIndex) {
      var parentPattern = '';

      for (var i = routeIndex; i >= 0; i--) {
        var route = routes[i];
        var pattern = route.path || '';

        parentPattern = pattern.replace(/\/*$/, '/') + parentPattern;

        if (pattern.indexOf('/') === 0) break;
      }

      return '/' + parentPattern;
    }
  },

  propTypes: {
    path: __WEBPACK_IMPORTED_MODULE_1_prop_types__["string"],
    from: __WEBPACK_IMPORTED_MODULE_1_prop_types__["string"], // Alias for path
    to: __WEBPACK_IMPORTED_MODULE_1_prop_types__["string"].isRequired,
    query: __WEBPACK_IMPORTED_MODULE_1_prop_types__["object"],
    state: __WEBPACK_IMPORTED_MODULE_1_prop_types__["object"],
    onEnter: __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__["c" /* falsy */],
    children: __WEBPACK_IMPORTED_MODULE_5__InternalPropTypes__["c" /* falsy */]
  },

  /* istanbul ignore next: sanity check */
  render: function render() {
     true ?  true ? __WEBPACK_IMPORTED_MODULE_2_invariant___default()(false, '<Redirect> elements are for router configuration only and should not be rendered') : invariant(false) : void 0;
  }
});

/* harmony default export */ __webpack_exports__["a"] = (Redirect);

/***/ }),

/***/ 188:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["a"] = createRouterObject;
/* harmony export (immutable) */ __webpack_exports__["b"] = assignRouterState;
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function createRouterObject(history, transitionManager, state) {
  var router = _extends({}, history, {
    setRouteLeaveHook: transitionManager.listenBeforeLeavingRoute,
    isActive: transitionManager.isActive
  });

  return assignRouterState(router, state);
}

function assignRouterState(router, _ref) {
  var location = _ref.location,
      params = _ref.params,
      routes = _ref.routes;

  router.location = location;
  router.params = params;
  router.routes = routes;

  return router;
}

/***/ }),

/***/ 189:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_lib_useQueries__ = __webpack_require__(134);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_lib_useQueries___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_history_lib_useQueries__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_history_lib_useBasename__ = __webpack_require__(133);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_history_lib_useBasename___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_history_lib_useBasename__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_history_lib_createMemoryHistory__ = __webpack_require__(1219);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_history_lib_createMemoryHistory___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_history_lib_createMemoryHistory__);
/* harmony export (immutable) */ __webpack_exports__["a"] = createMemoryHistory;




function createMemoryHistory(options) {
  // signatures and type checking differ between `useQueries` and
  // `createMemoryHistory`, have to create `memoryHistory` first because
  // `useQueries` doesn't understand the signature
  var memoryHistory = __WEBPACK_IMPORTED_MODULE_2_history_lib_createMemoryHistory___default()(options);
  var createHistory = function createHistory() {
    return memoryHistory;
  };
  var history = __WEBPACK_IMPORTED_MODULE_0_history_lib_useQueries___default()(__WEBPACK_IMPORTED_MODULE_1_history_lib_useBasename___default()(createHistory))(options);
  return history;
}

/***/ }),

/***/ 190:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__useRouterHistory__ = __webpack_require__(192);
/* harmony export (immutable) */ __webpack_exports__["a"] = createRouterHistory;


var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

function createRouterHistory(createHistory) {
  var history = void 0;
  if (canUseDOM) history = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__useRouterHistory__["a" /* default */])(createHistory)();
  return history;
}

/***/ }),

/***/ 191:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__routerWarning__ = __webpack_require__(39);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__computeChangedRoutes__ = __webpack_require__(1420);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__TransitionUtils__ = __webpack_require__(1417);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__isActive__ = __webpack_require__(1424);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__getComponents__ = __webpack_require__(1421);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__matchRoutes__ = __webpack_require__(1426);
/* harmony export (immutable) */ __webpack_exports__["a"] = createTransitionManager;
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };








function hasAnyProperties(object) {
  for (var p in object) {
    if (Object.prototype.hasOwnProperty.call(object, p)) return true;
  }return false;
}

function createTransitionManager(history, routes) {
  var state = {};

  var _getTransitionUtils = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__TransitionUtils__["a" /* default */])(),
      runEnterHooks = _getTransitionUtils.runEnterHooks,
      runChangeHooks = _getTransitionUtils.runChangeHooks,
      runLeaveHooks = _getTransitionUtils.runLeaveHooks;

  // Signature should be (location, indexOnly), but needs to support (path,
  // query, indexOnly)


  function isActive(location, indexOnly) {
    location = history.createLocation(location);

    return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__isActive__["a" /* default */])(location, indexOnly, state.location, state.routes, state.params);
  }

  var partialNextState = void 0;

  function match(location, callback) {
    if (partialNextState && partialNextState.location === location) {
      // Continue from where we left off.
      finishMatch(partialNextState, callback);
    } else {
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__matchRoutes__["a" /* default */])(routes, location, function (error, nextState) {
        if (error) {
          callback(error);
        } else if (nextState) {
          finishMatch(_extends({}, nextState, { location: location }), callback);
        } else {
          callback();
        }
      });
    }
  }

  function finishMatch(nextState, callback) {
    var _computeChangedRoutes = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__computeChangedRoutes__["a" /* default */])(state, nextState),
        leaveRoutes = _computeChangedRoutes.leaveRoutes,
        changeRoutes = _computeChangedRoutes.changeRoutes,
        enterRoutes = _computeChangedRoutes.enterRoutes;

    runLeaveHooks(leaveRoutes, state);

    // Tear down confirmation hooks for left routes
    leaveRoutes.filter(function (route) {
      return enterRoutes.indexOf(route) === -1;
    }).forEach(removeListenBeforeHooksForRoute);

    // change and enter hooks are run in series
    runChangeHooks(changeRoutes, state, nextState, function (error, redirectInfo) {
      if (error || redirectInfo) return handleErrorOrRedirect(error, redirectInfo);

      runEnterHooks(enterRoutes, nextState, finishEnterHooks);
    });

    function finishEnterHooks(error, redirectInfo) {
      if (error || redirectInfo) return handleErrorOrRedirect(error, redirectInfo);

      // TODO: Fetch components after state is updated.
      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__getComponents__["a" /* default */])(nextState, function (error, components) {
        if (error) {
          callback(error);
        } else {
          // TODO: Make match a pure function and have some other API
          // for "match and update state".
          callback(null, null, state = _extends({}, nextState, { components: components }));
        }
      });
    }

    function handleErrorOrRedirect(error, redirectInfo) {
      if (error) callback(error);else callback(null, redirectInfo);
    }
  }

  var RouteGuid = 1;

  function getRouteID(route) {
    var create = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    return route.__id__ || create && (route.__id__ = RouteGuid++);
  }

  var RouteHooks = Object.create(null);

  function getRouteHooksForRoutes(routes) {
    return routes.map(function (route) {
      return RouteHooks[getRouteID(route)];
    }).filter(function (hook) {
      return hook;
    });
  }

  function transitionHook(location, callback) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__matchRoutes__["a" /* default */])(routes, location, function (error, nextState) {
      if (nextState == null) {
        // TODO: We didn't actually match anything, but hang
        // onto error/nextState so we don't have to matchRoutes
        // again in the listen callback.
        callback();
        return;
      }

      // Cache some state here so we don't have to
      // matchRoutes() again in the listen callback.
      partialNextState = _extends({}, nextState, { location: location });

      var hooks = getRouteHooksForRoutes(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__computeChangedRoutes__["a" /* default */])(state, partialNextState).leaveRoutes);

      var result = void 0;
      for (var i = 0, len = hooks.length; result == null && i < len; ++i) {
        // Passing the location arg here indicates to
        // the user that this is a transition hook.
        result = hooks[i](location);
      }

      callback(result);
    });
  }

  /* istanbul ignore next: untestable with Karma */
  function beforeUnloadHook() {
    // Synchronously check to see if any route hooks want
    // to prevent the current window/tab from closing.
    if (state.routes) {
      var hooks = getRouteHooksForRoutes(state.routes);

      var message = void 0;
      for (var i = 0, len = hooks.length; typeof message !== 'string' && i < len; ++i) {
        // Passing no args indicates to the user that this is a
        // beforeunload hook. We don't know the next location.
        message = hooks[i]();
      }

      return message;
    }
  }

  var unlistenBefore = void 0,
      unlistenBeforeUnload = void 0;

  function removeListenBeforeHooksForRoute(route) {
    var routeID = getRouteID(route);
    if (!routeID) {
      return;
    }

    delete RouteHooks[routeID];

    if (!hasAnyProperties(RouteHooks)) {
      // teardown transition & beforeunload hooks
      if (unlistenBefore) {
        unlistenBefore();
        unlistenBefore = null;
      }

      if (unlistenBeforeUnload) {
        unlistenBeforeUnload();
        unlistenBeforeUnload = null;
      }
    }
  }

  /**
   * Registers the given hook function to run before leaving the given route.
   *
   * During a normal transition, the hook function receives the next location
   * as its only argument and can return either a prompt message (string) to show the user,
   * to make sure they want to leave the page; or `false`, to prevent the transition.
   * Any other return value will have no effect.
   *
   * During the beforeunload event (in browsers) the hook receives no arguments.
   * In this case it must return a prompt message to prevent the transition.
   *
   * Returns a function that may be used to unbind the listener.
   */
  function listenBeforeLeavingRoute(route, hook) {
    var thereWereNoRouteHooks = !hasAnyProperties(RouteHooks);
    var routeID = getRouteID(route, true);

    RouteHooks[routeID] = hook;

    if (thereWereNoRouteHooks) {
      // setup transition & beforeunload hooks
      unlistenBefore = history.listenBefore(transitionHook);

      if (history.listenBeforeUnload) unlistenBeforeUnload = history.listenBeforeUnload(beforeUnloadHook);
    }

    return function () {
      removeListenBeforeHooksForRoute(route);
    };
  }

  /**
   * This is the API for stateful environments. As the location
   * changes, we update state and call the listener. We can also
   * gracefully handle errors and redirects.
   */
  function listen(listener) {
    function historyListener(location) {
      if (state.location === location) {
        listener(null, state);
      } else {
        match(location, function (error, redirectLocation, nextState) {
          if (error) {
            listener(error);
          } else if (redirectLocation) {
            history.replace(redirectLocation);
          } else if (nextState) {
            listener(null, nextState);
          } else {
             true ? __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__routerWarning__["a" /* default */])(false, 'Location "%s" did not match any routes', location.pathname + location.search + location.hash) : void 0;
          }
        });
      }
    }

    // TODO: Only use a single history listener. Otherwise we'll end up with
    // multiple concurrent calls to match.

    // Set up the history listener first in case the initial match redirects.
    var unsubscribe = history.listen(historyListener);

    if (state.location) {
      // Picking up on a matchContext.
      listener(null, state);
    } else {
      historyListener(history.getCurrentLocation());
    }

    return unsubscribe;
  }

  return {
    isActive: isActive,
    match: match,
    listenBeforeLeavingRoute: listenBeforeLeavingRoute,
    listen: listen
  };
}

/***/ }),

/***/ 192:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_lib_useQueries__ = __webpack_require__(134);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_history_lib_useQueries___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_history_lib_useQueries__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_history_lib_useBasename__ = __webpack_require__(133);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_history_lib_useBasename___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_history_lib_useBasename__);
/* harmony export (immutable) */ __webpack_exports__["a"] = useRouterHistory;



function useRouterHistory(createHistory) {
  return function (options) {
    var history = __WEBPACK_IMPORTED_MODULE_0_history_lib_useQueries___default()(__WEBPACK_IMPORTED_MODULE_1_history_lib_useBasename___default()(createHistory))(options);
    return history;
  };
}

/***/ }),

/***/ 206:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_redux__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_redux_form__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__FilterCriteriaReducer__ = __webpack_require__(234);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__ArtistsReducer__ = __webpack_require__(232);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__ErrorReducer__ = __webpack_require__(233);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__SelectionReducer__ = __webpack_require__(235);







/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_redux__["combineReducers"])({
  form: __WEBPACK_IMPORTED_MODULE_1_redux_form__["reducer"],
  filterCriteria: __WEBPACK_IMPORTED_MODULE_2__FilterCriteriaReducer__["a" /* default */],
  artists: __WEBPACK_IMPORTED_MODULE_3__ArtistsReducer__["a" /* default */],
  errors: __WEBPACK_IMPORTED_MODULE_4__ErrorReducer__["a" /* default */],
  selection: __WEBPACK_IMPORTED_MODULE_5__SelectionReducer__["a" /* default */]
}));

/***/ }),

/***/ 207:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_router__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_Home__ = __webpack_require__(222);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__components_artists_ArtistMain__ = __webpack_require__(225);






const componentRoutes = {
  component: __WEBPACK_IMPORTED_MODULE_2__components_Home__["a" /* default */],
  path: "/",
  indexRoute: {
    component: __WEBPACK_IMPORTED_MODULE_3__components_artists_ArtistMain__["a" /* default */]
  },
  childRoutes: [{
    path: "artists/new",
    getComponent(location, cb) {
      __webpack_require__.e/* import() */(2).then(__webpack_require__.bind(null, 1512)).then(module => cb(null, module.default));
    }
  }, {
    path: "artists/:id",
    getComponent(location, cb) {
      __webpack_require__.e/* import() */(1).then(__webpack_require__.bind(null, 1513)).then(module => cb(null, module.default));
    }
  }, {
    path: "artists/:id/edit",
    getComponent(location, cb) {
      __webpack_require__.e/* import() */(0).then(__webpack_require__.bind(null, 1514)).then(module => cb(null, module.default));
    }
  }]
};

const Routes = () => {
  return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_1_react_router__["a" /* Router */], { history: __WEBPACK_IMPORTED_MODULE_1_react_router__["b" /* hashHistory */], routes: componentRoutes });
};

/* harmony default export */ __webpack_exports__["a"] = (Routes);

/***/ }),

/***/ 208:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(237);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(125)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./materialize.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./materialize.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 209:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(238);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(125)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./react-range.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./react-range.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 21:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



var React = __webpack_require__(2);
var factory = __webpack_require__(236);

if (typeof React === 'undefined') {
  throw Error(
    'create-react-class could not find the React object. If you are using script tags, ' +
      'make sure that React is being loaded before create-react-class.'
  );
}

// Hack to grab NoopUpdateQueue from isomorphic React
var ReactNoopUpdateQueue = new React.Component().updater;

module.exports = factory(
  React.Component,
  React.isValidElement,
  ReactNoopUpdateQueue
);


/***/ }),

/***/ 210:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(239);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(125)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!./style.css", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 211:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
const GENRES = ['Acceptable Country', 'Acceptable Emo', 'Acceptable Pop', 'Acceptable Pop-Punk', 'Alt-Country', 'Alt-Rap', 'Bloghaus', 'Blog Rap', 'Blog Rock', 'Cold Wave', 'Cool Jazz', 'Digital Punk', 'Doom Metal', 'Freak Folk', 'Garage Rock', 'Hypnagogic Pop', 'Noise Pop', 'Power Electronics', 'Serialism', 'Witch House', 'Ye Olde Timey Rock And Roll Music of Indeterminate Hipster Variety'];
/* harmony export (immutable) */ __webpack_exports__["GENRES"] = GENRES;


/***/ }),

/***/ 212:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const Artist = __webpack_require__(16);
const db = __webpack_require__(15);

/**
 * Create a single artist in the artist collection.
 * @param {object} artistProps - Object containing a name, age, yearsActive, and genre
 * @return {promise} A promise that resolves with the Artist that was created
 */
module.exports = artistProps => {
  const artist = _.extend({}, artistProps, {
    _id: _.uniqueId(),
    age: parseInt(artistProps.age) || 20,
    yearsActive: parseInt(artistProps.yearsActive) || 5
  });
  db.push(artist);

  return new Promise((resolve, reject) => {
    resolve(artist);
  });
};

/***/ }),

/***/ 213:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const Artist = __webpack_require__(16);
const db = __webpack_require__(15);

/**
 * Deletes a single artist from the Artists collection
 * @param {string} _id - The ID of the artist to delete.
 * @return {promise} A promise that resolves when the record is deleted
 */
module.exports = _id => {
  _.each(db, (artist, index) => {
    if (artist && artist._id === _id) {
      db.splice(index, 1);
    }
  });

  return new Promise((resolve, reject) => resolve());
};

/***/ }),

/***/ 214:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const Artist = __webpack_require__(16);
const db = __webpack_require__(15);

/**
 * Edits a single artist in the Artists collection
 * @param {string} _id - The ID of the artist to edit.
 * @param {object} artistProps - An object with a name, age, yearsActive, and genre
 * @return {promise} A promise that resolves when the record is edited
 */
module.exports = (_id, artistProps) => {
  const artist = _.find(db, a => a._id === _id);
  _.extend(artist, artistProps);

  return new Promise((resolve, reject) => {
    resolve();
  });
};

/***/ }),

/***/ 215:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const Artist = __webpack_require__(16);
const db = __webpack_require__(15);

/**
 * Finds a single artist in the artist collection.
 * @param {string} _id - The ID of the record to find.
 * @return {promise} A promise that resolves with the Artist that matches the id
 */
module.exports = _id => {
  const artist = _.find(db, a => a._id === _id);

  return new Promise((resolve, reject) => {
    resolve(artist);
  });
};

/***/ }),

/***/ 216:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const Artist = __webpack_require__(16);
const db = __webpack_require__(15);

/**
 * Finds the lowest and highest age of artists in the Artist collection
 * @return {promise} A promise that resolves with an object
 * containing the min and max ages, like { min: 16, max: 45 }.
 */
module.exports = () => {
  return new Promise((resolve, reject) => {
    const range = {
      max: _.maxBy(db, a => a.age).age,
      min: _.minBy(db, a => a.age).age
    };

    resolve(range);
  });
};

/***/ }),

/***/ 217:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const Artist = __webpack_require__(16);
const db = __webpack_require__(15);

/**
 * Finds the lowest and highest yearsActive of artists in the Artist collection
 * @return {promise} A promise that resolves with an object
 * containing the min and max yearsActive, like { min: 0, max: 14 }.
 */
module.exports = () => {
  return new Promise((resolve, reject) => {
    const range = {
      max: _.maxBy(db, a => a.yearsActive).yearsActive,
      min: _.minBy(db, a => a.yearsActive).yearsActive
    };

    resolve(range);
  });
};

/***/ }),

/***/ 218:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const Artist = __webpack_require__(16);
const db = __webpack_require__(15);

/**
 * Searches through the Artist collection
 * @param {object} criteria An object with a name, age, and yearsActive
 * @param {string} sortProperty The property to sort the results by
 * @param {integer} offset How many records to skip in the result set
 * @param {integer} limit How many records to return in the result set
 * @return {promise} A promise that resolves with the artists, count, offset, and limit
 */
module.exports = (_criteria, sortProperty, offset = 0, limit = 20) => {
  const criteria = _.extend({
    age: { min: 0, max: 100 },
    yearsActive: { min: 0, max: 100 },
    name: ''
  }, _criteria);

  const artists = _.chain(db).filter(a => _.includes(_.lowerCase(a.name), _.lowerCase(criteria.name))).filter(a => a.age > criteria.age.min && a.age < criteria.age.max).filter(a => a.yearsActive > criteria.yearsActive.min && a.yearsActive < criteria.yearsActive.max).sortBy(a => a[sortProperty]).value();

  return new Promise((resolve, reject) => {
    resolve(artists);
  });
};

/***/ }),

/***/ 219:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const Artist = __webpack_require__(16);
const db = __webpack_require__(15);

/**
 * Sets a group of Artists as not retired
 * @param {array} _ids - An array of the _id's of of artists to update
 * @return {promise} A promise that resolves after the update
 */
module.exports = _ids => {
  return new Promise((resolve, reject) => {
    const artists = _.chain(_ids).map(_id => _.find(db, a => a._id === _id)).tap(ids => console.log(ids)).compact().each(a => a.retired = false).value();

    resolve();
  });
};

/***/ }),

/***/ 220:
/***/ (function(module, exports, __webpack_require__) {

const _ = __webpack_require__(9);
const Artist = __webpack_require__(16);
const db = __webpack_require__(15);

/**
 * Sets a group of Artists as retired
 * @param {array} _ids - An array of the _id's of of artists to update
 * @return {promise} A promise that resolves after the update
 */
module.exports = _ids => {
  return new Promise((resolve, reject) => {
    const artists = _.chain(_ids).map(_id => _.find(db, a => a._id === _id)).compact().each(a => a.retired = true).value();

    resolve(artists);
  });
};

/***/ }),

/***/ 221:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_router__ = __webpack_require__(52);


const db = __webpack_require__(15);

class Header extends __WEBPACK_IMPORTED_MODULE_0_react__["Component"] {
  constructor(props) {
    super(props);

    this.state = { id: null };
  }

  componentWillMount() {
    this.setLink();
  }

  setLink() {
    const index = _.random(0, db.length);
    this.setState({ id: index });
  }

  render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'div',
      { className: 'row' },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'nav',
        null,
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'div',
          { className: 'nav-wrapper' },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'div',
            { className: 'col s12' },
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'a',
              { href: '#', className: 'brand-logo' },
              'UpStar Music'
            ),
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'ul',
              { id: 'nav-mobile', className: 'right hide-on-med-and-down' },
              __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
                'li',
                null,
                __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
                  __WEBPACK_IMPORTED_MODULE_1_react_router__["c" /* Link */],
                  {
                    to: `/artists/${this.state.id}`,
                    onClick: this.setLink.bind(this)
                  },
                  'Random Artist'
                )
              ),
              __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
                'li',
                null,
                __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
                  __WEBPACK_IMPORTED_MODULE_1_react_router__["c" /* Link */],
                  { to: '/artists/new' },
                  'Create Artist'
                )
              )
            )
          )
        )
      )
    );
  }
};

/* harmony default export */ __webpack_exports__["a"] = (Header);

/***/ }),

/***/ 222:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Header__ = __webpack_require__(221);



const Home = ({ children }) => {
  return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
    'div',
    { className: 'container' },
    __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_1__Header__["a" /* default */], null),
    children
  );
};

/* harmony default export */ __webpack_exports__["a"] = (Home);

/***/ }),

/***/ 223:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_redux_form__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_react_redux__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__filters__ = __webpack_require__(230);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__actions__ = __webpack_require__(77);







const TEXT_FIELDS = [{ label: 'Name', prop: 'name' }];

class ArtistFilter extends __WEBPACK_IMPORTED_MODULE_1_react__["Component"] {
  componentWillMount() {
    if (this.props.filters) {
      const criteria = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.extend({}, { name: '' }, this.props.filters);
      this.props.searchArtists(criteria);
    } else {
      this.props.searchArtists({
        name: '',
        sort: 'name'
      });
    }
  }

  componentDidMount() {
    this.props.setAgeRange();
    this.props.setYearsActiveRange();
  }

  handleSubmit(formProps) {
    const criteria = __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.extend({ name: '' }, formProps);
    this.props.searchArtists(criteria);
  }

  renderInputs() {
    return TEXT_FIELDS.map(({ label, prop }) => __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
      'div',
      { className: 'input-field', key: prop },
      __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2_redux_form__["Field"], {
        placeholder: label,
        id: prop,
        name: prop,
        component: 'input',
        type: 'text'
      })
    ));
  }

  render() {
    const { handleSubmit } = this.props;

    return __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
      'div',
      { className: 'card blue-grey darken-1 row' },
      __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
        'div',
        { className: 'card-content white-text' },
        __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
          'form',
          { onSubmit: handleSubmit(this.handleSubmit.bind(this)) },
          __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
            'div',
            { className: 'center-align card-title' },
            'Search'
          ),
          this.renderInputs(),
          __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
            'div',
            { className: 'input-field' },
            __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2_redux_form__["Field"], {
              id: 'age',
              label: 'Age',
              component: __WEBPACK_IMPORTED_MODULE_4__filters__["a" /* Range */],
              type: 'text',
              name: 'age',
              range: this.props.ageRange
            })
          ),
          __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
            'div',
            { className: 'input-field' },
            __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2_redux_form__["Field"], {
              id: 'years-active',
              label: 'Years Active',
              component: __WEBPACK_IMPORTED_MODULE_4__filters__["a" /* Range */],
              type: 'text',
              name: 'yearsActive',
              range: this.props.yearsActive
            })
          ),
          __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
            'div',
            null,
            __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
              'label',
              { className: 'select', htmlFor: 'sort' },
              'Sort By'
            ),
            __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
              __WEBPACK_IMPORTED_MODULE_2_redux_form__["Field"],
              { id: 'sort', name: 'sort', component: 'select' },
              __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
                'option',
                { value: 'name' },
                'Name'
              ),
              __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
                'option',
                { value: 'age' },
                'Age'
              ),
              __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
                'option',
                { value: 'albums' },
                'Albums Released'
              )
            )
          ),
          __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
            'div',
            { className: 'center-align' },
            __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
              'button',
              { className: 'btn' },
              'Submit'
            )
          )
        )
      )
    );
  }
}

const mapStateToProps = state => {
  const { filterCriteria } = state;

  return {
    yearsActive: filterCriteria.yearsActive,
    ageRange: filterCriteria.age,
    filters: state.form.filters && state.form.filters.values
  };
};

/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3_react_redux__["connect"])(mapStateToProps, __WEBPACK_IMPORTED_MODULE_5__actions__)(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_redux_form__["reduxForm"])({
  destroyOnUnmount: false,
  form: 'filters',
  initialValues: { sort: 'name' }
})(ArtistFilter)));

/***/ }),

/***/ 224:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_react_router__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_react_redux__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__Paginator__ = __webpack_require__(226);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__actions__ = __webpack_require__(77);







class ArtistIndex extends __WEBPACK_IMPORTED_MODULE_1_react__["Component"] {
  onChange(_id) {
    if (__WEBPACK_IMPORTED_MODULE_0_lodash___default.a.includes(this.props.selection, _id)) {
      this.props.deselectArtist(_id);
    } else {
      this.props.selectArtist(_id);
    }
  }

  renderList(artist) {
    const { _id } = artist;
    const classes = `collection-item avatar ${artist.retired && 'retired'}`;

    return __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
      'li',
      { className: classes, key: _id },
      __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
        'div',
        null,
        __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement('input', {
          id: _id,
          type: 'checkbox',
          checked: __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.includes(this.props.selection, _id),
          onChange: () => this.onChange(_id)
        }),
        __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement('label', { htmlFor: _id })
      ),
      __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement('img', { src: artist.image, className: 'circle' }),
      __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
        'div',
        null,
        __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
          'span',
          { className: 'title' },
          __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
            'strong',
            null,
            artist.name
          )
        ),
        __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
          'p',
          null,
          __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
            'b',
            null,
            artist.age
          ),
          ' years old',
          __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement('br', null),
          artist.albums ? artist.albums.length : 0,
          ' albums released'
        )
      ),
      __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
        __WEBPACK_IMPORTED_MODULE_2_react_router__["c" /* Link */],
        { to: `artists/${artist._id}`, className: 'secondary-content' },
        __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
          'i',
          { className: 'material-icons' },
          '>'
        )
      )
    );
  }

  renderPaginator() {
    if (this.props.artists.all.length) {
      return __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_4__Paginator__["a" /* default */], null);
    }
  }

  renderEmptyCollection() {
    if (this.props.artists.all.length) {
      return;
    }

    return __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
      'div',
      { className: 'center-align' },
      __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
        'h5',
        null,
        'No records found!'
      ),
      __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
        'div',
        null,
        'Try searching again'
      )
    );
  }

  renderRetire() {
    if (this.props.selection.length) {
      return __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
        'div',
        null,
        __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
          'button',
          {
            className: 'btn',
            onClick: () => this.props.setRetired(this.props.selection)
          },
          'Retire'
        ),
        __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
          'button',
          {
            className: 'btn',
            onClick: () => this.props.setNotRetired(this.props.selection)
          },
          'Unretire'
        )
      );
    }
  }

  render() {
    return __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
      'div',
      null,
      this.renderRetire(),
      __WEBPACK_IMPORTED_MODULE_1_react___default.a.createElement(
        'ul',
        { className: 'collection' },
        this.props.artists.all.map(this.renderList.bind(this)),
        this.renderEmptyCollection()
      ),
      this.renderPaginator()
    );
  }
}

const mapStateToProps = ({ artists, selection }) => ({ artists, selection });

/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3_react_redux__["connect"])(mapStateToProps, __WEBPACK_IMPORTED_MODULE_5__actions__)(ArtistIndex));

/***/ }),

/***/ 225:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__ArtistFilter__ = __webpack_require__(223);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__ArtistIndex__ = __webpack_require__(224);




class ArtistMain extends __WEBPACK_IMPORTED_MODULE_0_react__["Component"] {
  render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'div',
      { className: 'row' },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'col s4' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_1__ArtistFilter__["a" /* default */], null)
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'col s8' },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_2__ArtistIndex__["a" /* default */], null)
      )
    );
  }
}

/* harmony default export */ __webpack_exports__["a"] = (ArtistMain);

/***/ }),

/***/ 226:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_redux__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__actions__ = __webpack_require__(77);




class Paginator extends __WEBPACK_IMPORTED_MODULE_0_react__["Component"] {
  back() {
    const { offset, limit, form: { filters: { values } } } = this.props;

    if (offset === 0) {
      return;
    }

    this.props.searchArtists(values, offset - 10, limit);
  }

  advance() {
    const { offset, limit, count, form: { filters: { values } } } = this.props;

    if (offset + limit > count) {
      return;
    }

    this.props.searchArtists(values, offset + 10, limit);
  }

  left() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'li',
      { className: this.props.offset === 0 ? 'disabled' : '' },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'a',
        { onClick: this.back.bind(this) },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'i',
          { className: 'material-icons' },
          'chevron_left'
        )
      )
    );
  }

  right() {
    const { offset, limit, count } = this.props;

    const end = offset + limit >= count ? true : false;

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'li',
      { className: end ? 'disabled' : '' },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'a',
        { onClick: this.advance.bind(this) },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'i',
          { className: 'material-icons' },
          'chevron_right'
        )
      )
    );
  }

  render() {
    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'div',
      { className: 'center-align' },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'ul',
        { className: 'pagination' },
        this.left(),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'li',
          null,
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'a',
            null,
            'Page ',
            this.props.offset / 10 + 1
          )
        ),
        this.right()
      ),
      this.props.count,
      ' Records Found'
    );
  }
}

const mapStateToProps = ({ artists, form }) => {
  const { limit, offset, count } = artists;

  return { limit, offset, count, form };
};

/* harmony default export */ __webpack_exports__["a"] = (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1_react_redux__["connect"])(mapStateToProps, __WEBPACK_IMPORTED_MODULE_2__actions__)(Paginator));

/***/ }),

/***/ 227:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* unused harmony export Picker */


const Picker = () => {
  return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
    'div',
    null,
    'Picker'
  );
};



/***/ }),

/***/ 228:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_input_range__ = __webpack_require__(127);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_input_range___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_input_range__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Range; });



class Range extends __WEBPACK_IMPORTED_MODULE_0_react__["Component"] {
  onChange(component, values) {
    const { input: { onChange } } = this.props;

    onChange(values);
  }

  render() {
    const { input: { value } } = this.props;

    return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
      'div',
      { className: 'range-slider' },
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'label',
        null,
        this.props.label
      ),
      __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_1_react_input_range___default.a, {
        onChange: this.onChange.bind(this),
        minValue: parseInt(this.props.range.min),
        maxValue: parseInt(this.props.range.max),
        value: value || this.props.range
      })
    );
  }
};

Range.defaultProps = {
  range: { min: 0, max: 100 }
};



/***/ }),

/***/ 229:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* unused harmony export Switch */


const Switch = () => {
  return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
    'div',
    null,
    'Switch'
  );
};



/***/ }),

/***/ 23:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.createPath = exports.parsePath = exports.getQueryStringValueFromPath = exports.stripQueryStringValueFromPath = exports.addQueryStringValueToPath = undefined;

var _warning = __webpack_require__(27);

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addQueryStringValueToPath = exports.addQueryStringValueToPath = function addQueryStringValueToPath(path, key, value) {
  var _parsePath = parsePath(path),
      pathname = _parsePath.pathname,
      search = _parsePath.search,
      hash = _parsePath.hash;

  return createPath({
    pathname: pathname,
    search: search + (search.indexOf('?') === -1 ? '?' : '&') + key + '=' + value,
    hash: hash
  });
};

var stripQueryStringValueFromPath = exports.stripQueryStringValueFromPath = function stripQueryStringValueFromPath(path, key) {
  var _parsePath2 = parsePath(path),
      pathname = _parsePath2.pathname,
      search = _parsePath2.search,
      hash = _parsePath2.hash;

  return createPath({
    pathname: pathname,
    search: search.replace(new RegExp('([?&])' + key + '=[a-zA-Z0-9]+(&?)'), function (match, prefix, suffix) {
      return prefix === '?' ? prefix : suffix;
    }),
    hash: hash
  });
};

var getQueryStringValueFromPath = exports.getQueryStringValueFromPath = function getQueryStringValueFromPath(path, key) {
  var _parsePath3 = parsePath(path),
      search = _parsePath3.search;

  var match = search.match(new RegExp('[?&]' + key + '=([a-zA-Z0-9]+)'));
  return match && match[1];
};

var extractPath = function extractPath(string) {
  var match = string.match(/^(https?:)?\/\/[^\/]*/);
  return match == null ? string : string.substring(match[0].length);
};

var parsePath = exports.parsePath = function parsePath(path) {
  var pathname = extractPath(path);
  var search = '';
  var hash = '';

   true ? (0, _warning2.default)(path === pathname, 'A path must be pathname + search + hash only, not a full URL like "%s"', path) : void 0;

  var hashIndex = pathname.indexOf('#');
  if (hashIndex !== -1) {
    hash = pathname.substring(hashIndex);
    pathname = pathname.substring(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');
  if (searchIndex !== -1) {
    search = pathname.substring(searchIndex);
    pathname = pathname.substring(0, searchIndex);
  }

  if (pathname === '') pathname = '/';

  return {
    pathname: pathname,
    search: search,
    hash: hash
  };
};

var createPath = exports.createPath = function createPath(location) {
  if (location == null || typeof location === 'string') return location;

  var basename = location.basename,
      pathname = location.pathname,
      search = location.search,
      hash = location.hash;

  var path = (basename || '') + pathname;

  if (search && search !== '?') path += search;

  if (hash) path += hash;

  return path;
};

/***/ }),

/***/ 230:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Picker__ = __webpack_require__(227);
/* unused harmony namespace reexport */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Range__ = __webpack_require__(228);
/* harmony namespace reexport (by used) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_1__Range__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Switch__ = __webpack_require__(229);
/* unused harmony namespace reexport */




/***/ }),

/***/ 231:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom__ = __webpack_require__(75);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_dom___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_react_dom__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_redux__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_react_redux__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_react_redux___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_react_redux__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_redux_thunk__ = __webpack_require__(76);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__reducers__ = __webpack_require__(206);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__router__ = __webpack_require__(207);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__style_materialize_css__ = __webpack_require__(208);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__style_materialize_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__style_materialize_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__style_react_range_css__ = __webpack_require__(209);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__style_react_range_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__style_react_range_css__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__style_style_css__ = __webpack_require__(210);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__style_style_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__style_style_css__);










console.log("hey there!!");
const App = () => {
  const store = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_redux__["createStore"])(__WEBPACK_IMPORTED_MODULE_5__reducers__["a" /* default */], {}, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2_redux__["applyMiddleware"])(__WEBPACK_IMPORTED_MODULE_4_redux_thunk__["default"]));

  return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
    __WEBPACK_IMPORTED_MODULE_3_react_redux__["Provider"],
    { store: store },
    __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(__WEBPACK_IMPORTED_MODULE_6__router__["a" /* default */], null)
  );
};

__WEBPACK_IMPORTED_MODULE_1_react_dom___default.a.render(__WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(App, null), document.getElementById("root"));

/***/ }),

/***/ 232:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__actions_types__ = __webpack_require__(41);



const INITIAL_STATE = {
  all: [],
  offset: 0,
  limit: 20,
  count: 0
};

/* harmony default export */ __webpack_exports__["a"] = ((state = INITIAL_STATE, action) => {
  switch (action.type) {
    case __WEBPACK_IMPORTED_MODULE_1__actions_types__["h" /* SEARCH_ARTISTS */]:
      return __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.extend({}, state, {
        count: action.payload.length,
        all: action.payload
      });
    case __WEBPACK_IMPORTED_MODULE_1__actions_types__["i" /* FIND_ARTIST */]:
      return __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.extend({}, state, { artist: action.payload });
    case __WEBPACK_IMPORTED_MODULE_1__actions_types__["a" /* RESET_ARTIST */]:
      return __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.extend({}, state, { artist: null });
    default:
      return state;
  }
});

/***/ }),

/***/ 233:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__actions_types__ = __webpack_require__(41);


/* harmony default export */ __webpack_exports__["a"] = ((state = '', action) => {
  switch (action.type) {
    case __WEBPACK_IMPORTED_MODULE_0__actions_types__["j" /* CREATE_ERROR */]:
      return 'There was an error inserting this record';
    case __WEBPACK_IMPORTED_MODULE_0__actions_types__["b" /* CLEAR_ERROR */]:
      return '';
    default:
      return state;
  }
});

/***/ }),

/***/ 234:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__actions_types__ = __webpack_require__(41);



const INITIAL_STATE = {
  age: { min: 0, max: 100 }
};

/* harmony default export */ __webpack_exports__["a"] = ((state = INITIAL_STATE, action) => {
  switch (action.type) {
    case __WEBPACK_IMPORTED_MODULE_1__actions_types__["f" /* SET_AGE_RANGE */]:
      return __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.extend({}, state, { age: action.payload });
    case __WEBPACK_IMPORTED_MODULE_1__actions_types__["g" /* SET_YEARS_ACTIVE_RANGE */]:
      return __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.extend({}, state, { yearsActive: action.payload });
    default:
      return state;
  }
});

/***/ }),

/***/ 235:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__actions_types__ = __webpack_require__(41);



/* harmony default export */ __webpack_exports__["a"] = ((state = [], action) => {
  switch (action.type) {
    case __WEBPACK_IMPORTED_MODULE_1__actions_types__["c" /* SELECT_ARTIST */]:
      return [...state, action.payload];
    case __WEBPACK_IMPORTED_MODULE_1__actions_types__["d" /* DESELECT_ARTIST */]:
      return __WEBPACK_IMPORTED_MODULE_0_lodash___default.a.without(state, action.payload);
    case __WEBPACK_IMPORTED_MODULE_1__actions_types__["e" /* RESET_SELECTION */]:
      return [];
    default:
      return state;
  }
});

/***/ }),

/***/ 236:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */



var _assign = __webpack_require__(5);

// -- Inlined from fbjs --

var emptyObject = {};

if (true) {
  Object.freeze(emptyObject);
}

var validateFormat = function validateFormat(format) {};

if (true) {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function _invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

var warning = function(){};

if (true) {
  var printWarning = function printWarning(format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.error(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  warning = function warning(condition, format) {
    if (format === undefined) {
      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
    }

    if (format.indexOf('Failed Composite propType: ') === 0) {
      return; // Ignore CompositeComponent proptype check.
    }

    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

// /-- Inlined from fbjs --

var MIXINS_KEY = 'mixins';

// Helper function to allow the creation of anonymous functions which do not
// have .name set to the name of the variable being assigned to.
function identity(fn) {
  return fn;
}

var ReactPropTypeLocationNames;
if (true) {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context'
  };
} else {
  ReactPropTypeLocationNames = {};
}

function factory(ReactComponent, isValidElement, ReactNoopUpdateQueue) {
  /**
   * Policies that describe methods in `ReactClassInterface`.
   */

  var injectedMixins = [];

  /**
   * Composite components are higher-level components that compose other composite
   * or host components.
   *
   * To create a new type of `ReactClass`, pass a specification of
   * your new class to `React.createClass`. The only requirement of your class
   * specification is that you implement a `render` method.
   *
   *   var MyComponent = React.createClass({
   *     render: function() {
   *       return <div>Hello World</div>;
   *     }
   *   });
   *
   * The class specification supports a specific protocol of methods that have
   * special meaning (e.g. `render`). See `ReactClassInterface` for
   * more the comprehensive protocol. Any other properties and methods in the
   * class specification will be available on the prototype.
   *
   * @interface ReactClassInterface
   * @internal
   */
  var ReactClassInterface = {
    /**
     * An array of Mixin objects to include when defining your component.
     *
     * @type {array}
     * @optional
     */
    mixins: 'DEFINE_MANY',

    /**
     * An object containing properties and methods that should be defined on
     * the component's constructor instead of its prototype (static methods).
     *
     * @type {object}
     * @optional
     */
    statics: 'DEFINE_MANY',

    /**
     * Definition of prop types for this component.
     *
     * @type {object}
     * @optional
     */
    propTypes: 'DEFINE_MANY',

    /**
     * Definition of context types for this component.
     *
     * @type {object}
     * @optional
     */
    contextTypes: 'DEFINE_MANY',

    /**
     * Definition of context types this component sets for its children.
     *
     * @type {object}
     * @optional
     */
    childContextTypes: 'DEFINE_MANY',

    // ==== Definition methods ====

    /**
     * Invoked when the component is mounted. Values in the mapping will be set on
     * `this.props` if that prop is not specified (i.e. using an `in` check).
     *
     * This method is invoked before `getInitialState` and therefore cannot rely
     * on `this.state` or use `this.setState`.
     *
     * @return {object}
     * @optional
     */
    getDefaultProps: 'DEFINE_MANY_MERGED',

    /**
     * Invoked once before the component is mounted. The return value will be used
     * as the initial value of `this.state`.
     *
     *   getInitialState: function() {
     *     return {
     *       isOn: false,
     *       fooBaz: new BazFoo()
     *     }
     *   }
     *
     * @return {object}
     * @optional
     */
    getInitialState: 'DEFINE_MANY_MERGED',

    /**
     * @return {object}
     * @optional
     */
    getChildContext: 'DEFINE_MANY_MERGED',

    /**
     * Uses props from `this.props` and state from `this.state` to render the
     * structure of the component.
     *
     * No guarantees are made about when or how often this method is invoked, so
     * it must not have side effects.
     *
     *   render: function() {
     *     var name = this.props.name;
     *     return <div>Hello, {name}!</div>;
     *   }
     *
     * @return {ReactComponent}
     * @required
     */
    render: 'DEFINE_ONCE',

    // ==== Delegate methods ====

    /**
     * Invoked when the component is initially created and about to be mounted.
     * This may have side effects, but any external subscriptions or data created
     * by this method must be cleaned up in `componentWillUnmount`.
     *
     * @optional
     */
    componentWillMount: 'DEFINE_MANY',

    /**
     * Invoked when the component has been mounted and has a DOM representation.
     * However, there is no guarantee that the DOM node is in the document.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been mounted (initialized and rendered) for the first time.
     *
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidMount: 'DEFINE_MANY',

    /**
     * Invoked before the component receives new props.
     *
     * Use this as an opportunity to react to a prop transition by updating the
     * state using `this.setState`. Current props are accessed via `this.props`.
     *
     *   componentWillReceiveProps: function(nextProps, nextContext) {
     *     this.setState({
     *       likesIncreasing: nextProps.likeCount > this.props.likeCount
     *     });
     *   }
     *
     * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
     * transition may cause a state change, but the opposite is not true. If you
     * need it, you are probably looking for `componentWillUpdate`.
     *
     * @param {object} nextProps
     * @optional
     */
    componentWillReceiveProps: 'DEFINE_MANY',

    /**
     * Invoked while deciding if the component should be updated as a result of
     * receiving new props, state and/or context.
     *
     * Use this as an opportunity to `return false` when you're certain that the
     * transition to the new props/state/context will not require a component
     * update.
     *
     *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
     *     return !equal(nextProps, this.props) ||
     *       !equal(nextState, this.state) ||
     *       !equal(nextContext, this.context);
     *   }
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @return {boolean} True if the component should update.
     * @optional
     */
    shouldComponentUpdate: 'DEFINE_ONCE',

    /**
     * Invoked when the component is about to update due to a transition from
     * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
     * and `nextContext`.
     *
     * Use this as an opportunity to perform preparation before an update occurs.
     *
     * NOTE: You **cannot** use `this.setState()` in this method.
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @param {ReactReconcileTransaction} transaction
     * @optional
     */
    componentWillUpdate: 'DEFINE_MANY',

    /**
     * Invoked when the component's DOM representation has been updated.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been updated.
     *
     * @param {object} prevProps
     * @param {?object} prevState
     * @param {?object} prevContext
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidUpdate: 'DEFINE_MANY',

    /**
     * Invoked when the component is about to be removed from its parent and have
     * its DOM representation destroyed.
     *
     * Use this as an opportunity to deallocate any external resources.
     *
     * NOTE: There is no `componentDidUnmount` since your component will have been
     * destroyed by that point.
     *
     * @optional
     */
    componentWillUnmount: 'DEFINE_MANY',

    /**
     * Replacement for (deprecated) `componentWillMount`.
     *
     * @optional
     */
    UNSAFE_componentWillMount: 'DEFINE_MANY',

    /**
     * Replacement for (deprecated) `componentWillReceiveProps`.
     *
     * @optional
     */
    UNSAFE_componentWillReceiveProps: 'DEFINE_MANY',

    /**
     * Replacement for (deprecated) `componentWillUpdate`.
     *
     * @optional
     */
    UNSAFE_componentWillUpdate: 'DEFINE_MANY',

    // ==== Advanced methods ====

    /**
     * Updates the component's currently mounted DOM representation.
     *
     * By default, this implements React's rendering and reconciliation algorithm.
     * Sophisticated clients may wish to override this.
     *
     * @param {ReactReconcileTransaction} transaction
     * @internal
     * @overridable
     */
    updateComponent: 'OVERRIDE_BASE'
  };

  /**
   * Similar to ReactClassInterface but for static methods.
   */
  var ReactClassStaticInterface = {
    /**
     * This method is invoked after a component is instantiated and when it
     * receives new props. Return an object to update state in response to
     * prop changes. Return null to indicate no change to state.
     *
     * If an object is returned, its keys will be merged into the existing state.
     *
     * @return {object || null}
     * @optional
     */
    getDerivedStateFromProps: 'DEFINE_MANY_MERGED'
  };

  /**
   * Mapping from class specification keys to special processing functions.
   *
   * Although these are declared like instance properties in the specification
   * when defining classes using `React.createClass`, they are actually static
   * and are accessible on the constructor instead of the prototype. Despite
   * being static, they must be defined outside of the "statics" key under
   * which all other static methods are defined.
   */
  var RESERVED_SPEC_KEYS = {
    displayName: function(Constructor, displayName) {
      Constructor.displayName = displayName;
    },
    mixins: function(Constructor, mixins) {
      if (mixins) {
        for (var i = 0; i < mixins.length; i++) {
          mixSpecIntoComponent(Constructor, mixins[i]);
        }
      }
    },
    childContextTypes: function(Constructor, childContextTypes) {
      if (true) {
        validateTypeDef(Constructor, childContextTypes, 'childContext');
      }
      Constructor.childContextTypes = _assign(
        {},
        Constructor.childContextTypes,
        childContextTypes
      );
    },
    contextTypes: function(Constructor, contextTypes) {
      if (true) {
        validateTypeDef(Constructor, contextTypes, 'context');
      }
      Constructor.contextTypes = _assign(
        {},
        Constructor.contextTypes,
        contextTypes
      );
    },
    /**
     * Special case getDefaultProps which should move into statics but requires
     * automatic merging.
     */
    getDefaultProps: function(Constructor, getDefaultProps) {
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps = createMergedResultFunction(
          Constructor.getDefaultProps,
          getDefaultProps
        );
      } else {
        Constructor.getDefaultProps = getDefaultProps;
      }
    },
    propTypes: function(Constructor, propTypes) {
      if (true) {
        validateTypeDef(Constructor, propTypes, 'prop');
      }
      Constructor.propTypes = _assign({}, Constructor.propTypes, propTypes);
    },
    statics: function(Constructor, statics) {
      mixStaticSpecIntoComponent(Constructor, statics);
    },
    autobind: function() {}
  };

  function validateTypeDef(Constructor, typeDef, location) {
    for (var propName in typeDef) {
      if (typeDef.hasOwnProperty(propName)) {
        // use a warning instead of an _invariant so components
        // don't show up in prod but only in __DEV__
        if (true) {
          warning(
            typeof typeDef[propName] === 'function',
            '%s: %s type `%s` is invalid; it must be a function, usually from ' +
              'React.PropTypes.',
            Constructor.displayName || 'ReactClass',
            ReactPropTypeLocationNames[location],
            propName
          );
        }
      }
    }
  }

  function validateMethodOverride(isAlreadyDefined, name) {
    var specPolicy = ReactClassInterface.hasOwnProperty(name)
      ? ReactClassInterface[name]
      : null;

    // Disallow overriding of base class methods unless explicitly allowed.
    if (ReactClassMixin.hasOwnProperty(name)) {
      _invariant(
        specPolicy === 'OVERRIDE_BASE',
        'ReactClassInterface: You are attempting to override ' +
          '`%s` from your class specification. Ensure that your method names ' +
          'do not overlap with React methods.',
        name
      );
    }

    // Disallow defining methods more than once unless explicitly allowed.
    if (isAlreadyDefined) {
      _invariant(
        specPolicy === 'DEFINE_MANY' || specPolicy === 'DEFINE_MANY_MERGED',
        'ReactClassInterface: You are attempting to define ' +
          '`%s` on your component more than once. This conflict may be due ' +
          'to a mixin.',
        name
      );
    }
  }

  /**
   * Mixin helper which handles policy validation and reserved
   * specification keys when building React classes.
   */
  function mixSpecIntoComponent(Constructor, spec) {
    if (!spec) {
      if (true) {
        var typeofSpec = typeof spec;
        var isMixinValid = typeofSpec === 'object' && spec !== null;

        if (true) {
          warning(
            isMixinValid,
            "%s: You're attempting to include a mixin that is either null " +
              'or not an object. Check the mixins included by the component, ' +
              'as well as any mixins they include themselves. ' +
              'Expected object but got %s.',
            Constructor.displayName || 'ReactClass',
            spec === null ? null : typeofSpec
          );
        }
      }

      return;
    }

    _invariant(
      typeof spec !== 'function',
      "ReactClass: You're attempting to " +
        'use a component class or function as a mixin. Instead, just use a ' +
        'regular object.'
    );
    _invariant(
      !isValidElement(spec),
      "ReactClass: You're attempting to " +
        'use a component as a mixin. Instead, just use a regular object.'
    );

    var proto = Constructor.prototype;
    var autoBindPairs = proto.__reactAutoBindPairs;

    // By handling mixins before any other properties, we ensure the same
    // chaining order is applied to methods with DEFINE_MANY policy, whether
    // mixins are listed before or after these methods in the spec.
    if (spec.hasOwnProperty(MIXINS_KEY)) {
      RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
    }

    for (var name in spec) {
      if (!spec.hasOwnProperty(name)) {
        continue;
      }

      if (name === MIXINS_KEY) {
        // We have already handled mixins in a special case above.
        continue;
      }

      var property = spec[name];
      var isAlreadyDefined = proto.hasOwnProperty(name);
      validateMethodOverride(isAlreadyDefined, name);

      if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
        RESERVED_SPEC_KEYS[name](Constructor, property);
      } else {
        // Setup methods on prototype:
        // The following member methods should not be automatically bound:
        // 1. Expected ReactClass methods (in the "interface").
        // 2. Overridden methods (that were mixed in).
        var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
        var isFunction = typeof property === 'function';
        var shouldAutoBind =
          isFunction &&
          !isReactClassMethod &&
          !isAlreadyDefined &&
          spec.autobind !== false;

        if (shouldAutoBind) {
          autoBindPairs.push(name, property);
          proto[name] = property;
        } else {
          if (isAlreadyDefined) {
            var specPolicy = ReactClassInterface[name];

            // These cases should already be caught by validateMethodOverride.
            _invariant(
              isReactClassMethod &&
                (specPolicy === 'DEFINE_MANY_MERGED' ||
                  specPolicy === 'DEFINE_MANY'),
              'ReactClass: Unexpected spec policy %s for key %s ' +
                'when mixing in component specs.',
              specPolicy,
              name
            );

            // For methods which are defined more than once, call the existing
            // methods before calling the new property, merging if appropriate.
            if (specPolicy === 'DEFINE_MANY_MERGED') {
              proto[name] = createMergedResultFunction(proto[name], property);
            } else if (specPolicy === 'DEFINE_MANY') {
              proto[name] = createChainedFunction(proto[name], property);
            }
          } else {
            proto[name] = property;
            if (true) {
              // Add verbose displayName to the function, which helps when looking
              // at profiling tools.
              if (typeof property === 'function' && spec.displayName) {
                proto[name].displayName = spec.displayName + '_' + name;
              }
            }
          }
        }
      }
    }
  }

  function mixStaticSpecIntoComponent(Constructor, statics) {
    if (!statics) {
      return;
    }

    for (var name in statics) {
      var property = statics[name];
      if (!statics.hasOwnProperty(name)) {
        continue;
      }

      var isReserved = name in RESERVED_SPEC_KEYS;
      _invariant(
        !isReserved,
        'ReactClass: You are attempting to define a reserved ' +
          'property, `%s`, that shouldn\'t be on the "statics" key. Define it ' +
          'as an instance property instead; it will still be accessible on the ' +
          'constructor.',
        name
      );

      var isAlreadyDefined = name in Constructor;
      if (isAlreadyDefined) {
        var specPolicy = ReactClassStaticInterface.hasOwnProperty(name)
          ? ReactClassStaticInterface[name]
          : null;

        _invariant(
          specPolicy === 'DEFINE_MANY_MERGED',
          'ReactClass: You are attempting to define ' +
            '`%s` on your component more than once. This conflict may be ' +
            'due to a mixin.',
          name
        );

        Constructor[name] = createMergedResultFunction(Constructor[name], property);

        return;
      }

      Constructor[name] = property;
    }
  }

  /**
   * Merge two objects, but throw if both contain the same key.
   *
   * @param {object} one The first object, which is mutated.
   * @param {object} two The second object
   * @return {object} one after it has been mutated to contain everything in two.
   */
  function mergeIntoWithNoDuplicateKeys(one, two) {
    _invariant(
      one && two && typeof one === 'object' && typeof two === 'object',
      'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.'
    );

    for (var key in two) {
      if (two.hasOwnProperty(key)) {
        _invariant(
          one[key] === undefined,
          'mergeIntoWithNoDuplicateKeys(): ' +
            'Tried to merge two objects with the same key: `%s`. This conflict ' +
            'may be due to a mixin; in particular, this may be caused by two ' +
            'getInitialState() or getDefaultProps() methods returning objects ' +
            'with clashing keys.',
          key
        );
        one[key] = two[key];
      }
    }
    return one;
  }

  /**
   * Creates a function that invokes two functions and merges their return values.
   *
   * @param {function} one Function to invoke first.
   * @param {function} two Function to invoke second.
   * @return {function} Function that invokes the two argument functions.
   * @private
   */
  function createMergedResultFunction(one, two) {
    return function mergedResult() {
      var a = one.apply(this, arguments);
      var b = two.apply(this, arguments);
      if (a == null) {
        return b;
      } else if (b == null) {
        return a;
      }
      var c = {};
      mergeIntoWithNoDuplicateKeys(c, a);
      mergeIntoWithNoDuplicateKeys(c, b);
      return c;
    };
  }

  /**
   * Creates a function that invokes two functions and ignores their return vales.
   *
   * @param {function} one Function to invoke first.
   * @param {function} two Function to invoke second.
   * @return {function} Function that invokes the two argument functions.
   * @private
   */
  function createChainedFunction(one, two) {
    return function chainedFunction() {
      one.apply(this, arguments);
      two.apply(this, arguments);
    };
  }

  /**
   * Binds a method to the component.
   *
   * @param {object} component Component whose method is going to be bound.
   * @param {function} method Method to be bound.
   * @return {function} The bound method.
   */
  function bindAutoBindMethod(component, method) {
    var boundMethod = method.bind(component);
    if (true) {
      boundMethod.__reactBoundContext = component;
      boundMethod.__reactBoundMethod = method;
      boundMethod.__reactBoundArguments = null;
      var componentName = component.constructor.displayName;
      var _bind = boundMethod.bind;
      boundMethod.bind = function(newThis) {
        for (
          var _len = arguments.length,
            args = Array(_len > 1 ? _len - 1 : 0),
            _key = 1;
          _key < _len;
          _key++
        ) {
          args[_key - 1] = arguments[_key];
        }

        // User is trying to bind() an autobound method; we effectively will
        // ignore the value of "this" that the user is trying to use, so
        // let's warn.
        if (newThis !== component && newThis !== null) {
          if (true) {
            warning(
              false,
              'bind(): React component methods may only be bound to the ' +
                'component instance. See %s',
              componentName
            );
          }
        } else if (!args.length) {
          if (true) {
            warning(
              false,
              'bind(): You are binding a component method to the component. ' +
                'React does this for you automatically in a high-performance ' +
                'way, so you can safely remove this call. See %s',
              componentName
            );
          }
          return boundMethod;
        }
        var reboundMethod = _bind.apply(boundMethod, arguments);
        reboundMethod.__reactBoundContext = component;
        reboundMethod.__reactBoundMethod = method;
        reboundMethod.__reactBoundArguments = args;
        return reboundMethod;
      };
    }
    return boundMethod;
  }

  /**
   * Binds all auto-bound methods in a component.
   *
   * @param {object} component Component whose method is going to be bound.
   */
  function bindAutoBindMethods(component) {
    var pairs = component.__reactAutoBindPairs;
    for (var i = 0; i < pairs.length; i += 2) {
      var autoBindKey = pairs[i];
      var method = pairs[i + 1];
      component[autoBindKey] = bindAutoBindMethod(component, method);
    }
  }

  var IsMountedPreMixin = {
    componentDidMount: function() {
      this.__isMounted = true;
    }
  };

  var IsMountedPostMixin = {
    componentWillUnmount: function() {
      this.__isMounted = false;
    }
  };

  /**
   * Add more to the ReactClass base class. These are all legacy features and
   * therefore not already part of the modern ReactComponent.
   */
  var ReactClassMixin = {
    /**
     * TODO: This will be deprecated because state should always keep a consistent
     * type signature and the only use case for this, is to avoid that.
     */
    replaceState: function(newState, callback) {
      this.updater.enqueueReplaceState(this, newState, callback);
    },

    /**
     * Checks whether or not this composite component is mounted.
     * @return {boolean} True if mounted, false otherwise.
     * @protected
     * @final
     */
    isMounted: function() {
      if (true) {
        warning(
          this.__didWarnIsMounted,
          '%s: isMounted is deprecated. Instead, make sure to clean up ' +
            'subscriptions and pending requests in componentWillUnmount to ' +
            'prevent memory leaks.',
          (this.constructor && this.constructor.displayName) ||
            this.name ||
            'Component'
        );
        this.__didWarnIsMounted = true;
      }
      return !!this.__isMounted;
    }
  };

  var ReactClassComponent = function() {};
  _assign(
    ReactClassComponent.prototype,
    ReactComponent.prototype,
    ReactClassMixin
  );

  /**
   * Creates a composite component class given a class specification.
   * See https://facebook.github.io/react/docs/top-level-api.html#react.createclass
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  function createClass(spec) {
    // To keep our warnings more understandable, we'll use a little hack here to
    // ensure that Constructor.name !== 'Constructor'. This makes sure we don't
    // unnecessarily identify a class without displayName as 'Constructor'.
    var Constructor = identity(function(props, context, updater) {
      // This constructor gets overridden by mocks. The argument is used
      // by mocks to assert on what gets mounted.

      if (true) {
        warning(
          this instanceof Constructor,
          'Something is calling a React component directly. Use a factory or ' +
            'JSX instead. See: https://fb.me/react-legacyfactory'
        );
      }

      // Wire up auto-binding
      if (this.__reactAutoBindPairs.length) {
        bindAutoBindMethods(this);
      }

      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;

      this.state = null;

      // ReactClasses doesn't have constructors. Instead, they use the
      // getInitialState and componentWillMount methods for initialization.

      var initialState = this.getInitialState ? this.getInitialState() : null;
      if (true) {
        // We allow auto-mocks to proceed as if they're returning null.
        if (
          initialState === undefined &&
          this.getInitialState._isMockFunction
        ) {
          // This is probably bad practice. Consider warning here and
          // deprecating this convenience.
          initialState = null;
        }
      }
      _invariant(
        typeof initialState === 'object' && !Array.isArray(initialState),
        '%s.getInitialState(): must return an object or null',
        Constructor.displayName || 'ReactCompositeComponent'
      );

      this.state = initialState;
    });
    Constructor.prototype = new ReactClassComponent();
    Constructor.prototype.constructor = Constructor;
    Constructor.prototype.__reactAutoBindPairs = [];

    injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));

    mixSpecIntoComponent(Constructor, IsMountedPreMixin);
    mixSpecIntoComponent(Constructor, spec);
    mixSpecIntoComponent(Constructor, IsMountedPostMixin);

    // Initialize the defaultProps property after all mixins have been merged.
    if (Constructor.getDefaultProps) {
      Constructor.defaultProps = Constructor.getDefaultProps();
    }

    if (true) {
      // This is a tag to indicate that the use of these method names is ok,
      // since it's used with createClass. If it's not, then it's likely a
      // mistake so we'll warn you to use the static property, property
      // initializer or constructor respectively.
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps.isReactClassApproved = {};
      }
      if (Constructor.prototype.getInitialState) {
        Constructor.prototype.getInitialState.isReactClassApproved = {};
      }
    }

    _invariant(
      Constructor.prototype.render,
      'createClass(...): Class specification must implement a `render` method.'
    );

    if (true) {
      warning(
        !Constructor.prototype.componentShouldUpdate,
        '%s has a method called ' +
          'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' +
          'The name is phrased as a question because the function is ' +
          'expected to return a value.',
        spec.displayName || 'A component'
      );
      warning(
        !Constructor.prototype.componentWillRecieveProps,
        '%s has a method called ' +
          'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?',
        spec.displayName || 'A component'
      );
      warning(
        !Constructor.prototype.UNSAFE_componentWillRecieveProps,
        '%s has a method called UNSAFE_componentWillRecieveProps(). ' +
          'Did you mean UNSAFE_componentWillReceiveProps()?',
        spec.displayName || 'A component'
      );
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactClassInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    return Constructor;
  }

  return createClass;
}

module.exports = factory;


/***/ }),

/***/ 237:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(78)();
// imports


// module
exports.push([module.i, "/*!\r\n * Materialize v0.97.8 (http://materializecss.com)\r\n * Copyright 2014-2015 Materialize\r\n * MIT License (https://raw.githubusercontent.com/Dogfalo/materialize/master/LICENSE)\r\n */.materialize-red{background-color:#e51c23!important}.materialize-red-text{color:#e51c23!important}.materialize-red.lighten-5{background-color:#fdeaeb!important}.materialize-red-text.text-lighten-5{color:#fdeaeb!important}.materialize-red.lighten-4{background-color:#f8c1c3!important}.materialize-red-text.text-lighten-4{color:#f8c1c3!important}.materialize-red.lighten-3{background-color:#f3989b!important}.materialize-red-text.text-lighten-3{color:#f3989b!important}.materialize-red.lighten-2{background-color:#ee6e73!important}.materialize-red-text.text-lighten-2{color:#ee6e73!important}.materialize-red.lighten-1{background-color:#ea454b!important}.materialize-red-text.text-lighten-1{color:#ea454b!important}.materialize-red.darken-1{background-color:#d0181e!important}.materialize-red-text.text-darken-1{color:#d0181e!important}.materialize-red.darken-2{background-color:#b9151b!important}.materialize-red-text.text-darken-2{color:#b9151b!important}.materialize-red.darken-3{background-color:#a21318!important}.materialize-red-text.text-darken-3{color:#a21318!important}.materialize-red.darken-4{background-color:#8b1014!important}.materialize-red-text.text-darken-4{color:#8b1014!important}.red{background-color:#f44336!important}.red-text{color:#f44336!important}.red.lighten-5{background-color:#ffebee!important}.red-text.text-lighten-5{color:#ffebee!important}.red.lighten-4{background-color:#ffcdd2!important}.red-text.text-lighten-4{color:#ffcdd2!important}.red.lighten-3{background-color:#ef9a9a!important}.red-text.text-lighten-3{color:#ef9a9a!important}.red.lighten-2{background-color:#e57373!important}.red-text.text-lighten-2{color:#e57373!important}.red.lighten-1{background-color:#ef5350!important}.red-text.text-lighten-1{color:#ef5350!important}.red.darken-1{background-color:#e53935!important}.red-text.text-darken-1{color:#e53935!important}.red.darken-2{background-color:#d32f2f!important}.red-text.text-darken-2{color:#d32f2f!important}.red.darken-3{background-color:#c62828!important}.red-text.text-darken-3{color:#c62828!important}.red.darken-4{background-color:#b71c1c!important}.red-text.text-darken-4{color:#b71c1c!important}.red.accent-1{background-color:#ff8a80!important}.red-text.text-accent-1{color:#ff8a80!important}.red.accent-2{background-color:#ff5252!important}.red-text.text-accent-2{color:#ff5252!important}.red.accent-3{background-color:#ff1744!important}.red-text.text-accent-3{color:#ff1744!important}.red.accent-4{background-color:#d50000!important}.red-text.text-accent-4{color:#d50000!important}.pink{background-color:#e91e63!important}.pink-text{color:#e91e63!important}.pink.lighten-5{background-color:#fce4ec!important}.pink-text.text-lighten-5{color:#fce4ec!important}.pink.lighten-4{background-color:#f8bbd0!important}.pink-text.text-lighten-4{color:#f8bbd0!important}.pink.lighten-3{background-color:#f48fb1!important}.pink-text.text-lighten-3{color:#f48fb1!important}.pink.lighten-2{background-color:#f06292!important}.pink-text.text-lighten-2{color:#f06292!important}.pink.lighten-1{background-color:#ec407a!important}.pink-text.text-lighten-1{color:#ec407a!important}.pink.darken-1{background-color:#d81b60!important}.pink-text.text-darken-1{color:#d81b60!important}.pink.darken-2{background-color:#c2185b!important}.pink-text.text-darken-2{color:#c2185b!important}.pink.darken-3{background-color:#ad1457!important}.pink-text.text-darken-3{color:#ad1457!important}.pink.darken-4{background-color:#880e4f!important}.pink-text.text-darken-4{color:#880e4f!important}.pink.accent-1{background-color:#ff80ab!important}.pink-text.text-accent-1{color:#ff80ab!important}.pink.accent-2{background-color:#ff4081!important}.pink-text.text-accent-2{color:#ff4081!important}.pink.accent-3{background-color:#f50057!important}.pink-text.text-accent-3{color:#f50057!important}.pink.accent-4{background-color:#c51162!important}.pink-text.text-accent-4{color:#c51162!important}.purple{background-color:#9c27b0!important}.purple-text{color:#9c27b0!important}.purple.lighten-5{background-color:#f3e5f5!important}.purple-text.text-lighten-5{color:#f3e5f5!important}.purple.lighten-4{background-color:#e1bee7!important}.purple-text.text-lighten-4{color:#e1bee7!important}.purple.lighten-3{background-color:#ce93d8!important}.purple-text.text-lighten-3{color:#ce93d8!important}.purple.lighten-2{background-color:#ba68c8!important}.purple-text.text-lighten-2{color:#ba68c8!important}.purple.lighten-1{background-color:#ab47bc!important}.purple-text.text-lighten-1{color:#ab47bc!important}.purple.darken-1{background-color:#8e24aa!important}.purple-text.text-darken-1{color:#8e24aa!important}.purple.darken-2{background-color:#7b1fa2!important}.purple-text.text-darken-2{color:#7b1fa2!important}.purple.darken-3{background-color:#6a1b9a!important}.purple-text.text-darken-3{color:#6a1b9a!important}.purple.darken-4{background-color:#4a148c!important}.purple-text.text-darken-4{color:#4a148c!important}.purple.accent-1{background-color:#ea80fc!important}.purple-text.text-accent-1{color:#ea80fc!important}.purple.accent-2{background-color:#e040fb!important}.purple-text.text-accent-2{color:#e040fb!important}.purple.accent-3{background-color:#d500f9!important}.purple-text.text-accent-3{color:#d500f9!important}.purple.accent-4{background-color:#a0f!important}.purple-text.text-accent-4{color:#a0f!important}.deep-purple{background-color:#673ab7!important}.deep-purple-text{color:#673ab7!important}.deep-purple.lighten-5{background-color:#ede7f6!important}.deep-purple-text.text-lighten-5{color:#ede7f6!important}.deep-purple.lighten-4{background-color:#d1c4e9!important}.deep-purple-text.text-lighten-4{color:#d1c4e9!important}.deep-purple.lighten-3{background-color:#b39ddb!important}.deep-purple-text.text-lighten-3{color:#b39ddb!important}.deep-purple.lighten-2{background-color:#9575cd!important}.deep-purple-text.text-lighten-2{color:#9575cd!important}.deep-purple.lighten-1{background-color:#7e57c2!important}.deep-purple-text.text-lighten-1{color:#7e57c2!important}.deep-purple.darken-1{background-color:#5e35b1!important}.deep-purple-text.text-darken-1{color:#5e35b1!important}.deep-purple.darken-2{background-color:#512da8!important}.deep-purple-text.text-darken-2{color:#512da8!important}.deep-purple.darken-3{background-color:#4527a0!important}.deep-purple-text.text-darken-3{color:#4527a0!important}.deep-purple.darken-4{background-color:#311b92!important}.deep-purple-text.text-darken-4{color:#311b92!important}.deep-purple.accent-1{background-color:#b388ff!important}.deep-purple-text.text-accent-1{color:#b388ff!important}.deep-purple.accent-2{background-color:#7c4dff!important}.deep-purple-text.text-accent-2{color:#7c4dff!important}.deep-purple.accent-3{background-color:#651fff!important}.deep-purple-text.text-accent-3{color:#651fff!important}.deep-purple.accent-4{background-color:#6200ea!important}.deep-purple-text.text-accent-4{color:#6200ea!important}.indigo{background-color:#3f51b5!important}.indigo-text{color:#3f51b5!important}.indigo.lighten-5{background-color:#e8eaf6!important}.indigo-text.text-lighten-5{color:#e8eaf6!important}.indigo.lighten-4{background-color:#c5cae9!important}.indigo-text.text-lighten-4{color:#c5cae9!important}.indigo.lighten-3{background-color:#9fa8da!important}.indigo-text.text-lighten-3{color:#9fa8da!important}.indigo.lighten-2{background-color:#7986cb!important}.indigo-text.text-lighten-2{color:#7986cb!important}.indigo.lighten-1{background-color:#5c6bc0!important}.indigo-text.text-lighten-1{color:#5c6bc0!important}.indigo.darken-1{background-color:#3949ab!important}.indigo-text.text-darken-1{color:#3949ab!important}.indigo.darken-2{background-color:#303f9f!important}.indigo-text.text-darken-2{color:#303f9f!important}.indigo.darken-3{background-color:#283593!important}.indigo-text.text-darken-3{color:#283593!important}.indigo.darken-4{background-color:#1a237e!important}.indigo-text.text-darken-4{color:#1a237e!important}.indigo.accent-1{background-color:#8c9eff!important}.indigo-text.text-accent-1{color:#8c9eff!important}.indigo.accent-2{background-color:#536dfe!important}.indigo-text.text-accent-2{color:#536dfe!important}.indigo.accent-3{background-color:#3d5afe!important}.indigo-text.text-accent-3{color:#3d5afe!important}.indigo.accent-4{background-color:#304ffe!important}.indigo-text.text-accent-4{color:#304ffe!important}.blue{background-color:#2196f3!important}.blue-text{color:#2196f3!important}.blue.lighten-5{background-color:#e3f2fd!important}.blue-text.text-lighten-5{color:#e3f2fd!important}.blue.lighten-4{background-color:#bbdefb!important}.blue-text.text-lighten-4{color:#bbdefb!important}.blue.lighten-3{background-color:#90caf9!important}.blue-text.text-lighten-3{color:#90caf9!important}.blue.lighten-2{background-color:#64b5f6!important}.blue-text.text-lighten-2{color:#64b5f6!important}.blue.lighten-1{background-color:#42a5f5!important}.blue-text.text-lighten-1{color:#42a5f5!important}.blue.darken-1{background-color:#1e88e5!important}.blue-text.text-darken-1{color:#1e88e5!important}.blue.darken-2{background-color:#1976d2!important}.blue-text.text-darken-2{color:#1976d2!important}.blue.darken-3{background-color:#1565c0!important}.blue-text.text-darken-3{color:#1565c0!important}.blue.darken-4{background-color:#0d47a1!important}.blue-text.text-darken-4{color:#0d47a1!important}.blue.accent-1{background-color:#82b1ff!important}.blue-text.text-accent-1{color:#82b1ff!important}.blue.accent-2{background-color:#448aff!important}.blue-text.text-accent-2{color:#448aff!important}.blue.accent-3{background-color:#2979ff!important}.blue-text.text-accent-3{color:#2979ff!important}.blue.accent-4{background-color:#2962ff!important}.blue-text.text-accent-4{color:#2962ff!important}.light-blue{background-color:#03a9f4!important}.light-blue-text{color:#03a9f4!important}.light-blue.lighten-5{background-color:#e1f5fe!important}.light-blue-text.text-lighten-5{color:#e1f5fe!important}.light-blue.lighten-4{background-color:#b3e5fc!important}.light-blue-text.text-lighten-4{color:#b3e5fc!important}.light-blue.lighten-3{background-color:#81d4fa!important}.light-blue-text.text-lighten-3{color:#81d4fa!important}.light-blue.lighten-2{background-color:#4fc3f7!important}.light-blue-text.text-lighten-2{color:#4fc3f7!important}.light-blue.lighten-1{background-color:#29b6f6!important}.light-blue-text.text-lighten-1{color:#29b6f6!important}.light-blue.darken-1{background-color:#039be5!important}.light-blue-text.text-darken-1{color:#039be5!important}.light-blue.darken-2{background-color:#0288d1!important}.light-blue-text.text-darken-2{color:#0288d1!important}.light-blue.darken-3{background-color:#0277bd!important}.light-blue-text.text-darken-3{color:#0277bd!important}.light-blue.darken-4{background-color:#01579b!important}.light-blue-text.text-darken-4{color:#01579b!important}.light-blue.accent-1{background-color:#80d8ff!important}.light-blue-text.text-accent-1{color:#80d8ff!important}.light-blue.accent-2{background-color:#40c4ff!important}.light-blue-text.text-accent-2{color:#40c4ff!important}.light-blue.accent-3{background-color:#00b0ff!important}.light-blue-text.text-accent-3{color:#00b0ff!important}.light-blue.accent-4{background-color:#0091ea!important}.light-blue-text.text-accent-4{color:#0091ea!important}.cyan{background-color:#00bcd4!important}.cyan-text{color:#00bcd4!important}.cyan.lighten-5{background-color:#e0f7fa!important}.cyan-text.text-lighten-5{color:#e0f7fa!important}.cyan.lighten-4{background-color:#b2ebf2!important}.cyan-text.text-lighten-4{color:#b2ebf2!important}.cyan.lighten-3{background-color:#80deea!important}.cyan-text.text-lighten-3{color:#80deea!important}.cyan.lighten-2{background-color:#4dd0e1!important}.cyan-text.text-lighten-2{color:#4dd0e1!important}.cyan.lighten-1{background-color:#26c6da!important}.cyan-text.text-lighten-1{color:#26c6da!important}.cyan.darken-1{background-color:#00acc1!important}.cyan-text.text-darken-1{color:#00acc1!important}.cyan.darken-2{background-color:#0097a7!important}.cyan-text.text-darken-2{color:#0097a7!important}.cyan.darken-3{background-color:#00838f!important}.cyan-text.text-darken-3{color:#00838f!important}.cyan.darken-4{background-color:#006064!important}.cyan-text.text-darken-4{color:#006064!important}.cyan.accent-1{background-color:#84ffff!important}.cyan-text.text-accent-1{color:#84ffff!important}.cyan.accent-2{background-color:#18ffff!important}.cyan-text.text-accent-2{color:#18ffff!important}.cyan.accent-3{background-color:#00e5ff!important}.cyan-text.text-accent-3{color:#00e5ff!important}.cyan.accent-4{background-color:#00b8d4!important}.cyan-text.text-accent-4{color:#00b8d4!important}.teal{background-color:#009688!important}.teal-text{color:#009688!important}.teal.lighten-5{background-color:#e0f2f1!important}.teal-text.text-lighten-5{color:#e0f2f1!important}.teal.lighten-4{background-color:#b2dfdb!important}.teal-text.text-lighten-4{color:#b2dfdb!important}.teal.lighten-3{background-color:#80cbc4!important}.teal-text.text-lighten-3{color:#80cbc4!important}.teal.lighten-2{background-color:#4db6ac!important}.teal-text.text-lighten-2{color:#4db6ac!important}.teal.lighten-1{background-color:#26a69a!important}.teal-text.text-lighten-1{color:#26a69a!important}.teal.darken-1{background-color:#00897b!important}.teal-text.text-darken-1{color:#00897b!important}.teal.darken-2{background-color:#00796b!important}.teal-text.text-darken-2{color:#00796b!important}.teal.darken-3{background-color:#00695c!important}.teal-text.text-darken-3{color:#00695c!important}.teal.darken-4{background-color:#004d40!important}.teal-text.text-darken-4{color:#004d40!important}.teal.accent-1{background-color:#a7ffeb!important}.teal-text.text-accent-1{color:#a7ffeb!important}.teal.accent-2{background-color:#64ffda!important}.teal-text.text-accent-2{color:#64ffda!important}.teal.accent-3{background-color:#1de9b6!important}.teal-text.text-accent-3{color:#1de9b6!important}.teal.accent-4{background-color:#00bfa5!important}.teal-text.text-accent-4{color:#00bfa5!important}.green{background-color:#4caf50!important}.green-text{color:#4caf50!important}.green.lighten-5{background-color:#e8f5e9!important}.green-text.text-lighten-5{color:#e8f5e9!important}.green.lighten-4{background-color:#c8e6c9!important}.green-text.text-lighten-4{color:#c8e6c9!important}.green.lighten-3{background-color:#a5d6a7!important}.green-text.text-lighten-3{color:#a5d6a7!important}.green.lighten-2{background-color:#81c784!important}.green-text.text-lighten-2{color:#81c784!important}.green.lighten-1{background-color:#66bb6a!important}.green-text.text-lighten-1{color:#66bb6a!important}.green.darken-1{background-color:#43a047!important}.green-text.text-darken-1{color:#43a047!important}.green.darken-2{background-color:#388e3c!important}.green-text.text-darken-2{color:#388e3c!important}.green.darken-3{background-color:#2e7d32!important}.green-text.text-darken-3{color:#2e7d32!important}.green.darken-4{background-color:#1b5e20!important}.green-text.text-darken-4{color:#1b5e20!important}.green.accent-1{background-color:#b9f6ca!important}.green-text.text-accent-1{color:#b9f6ca!important}.green.accent-2{background-color:#69f0ae!important}.green-text.text-accent-2{color:#69f0ae!important}.green.accent-3{background-color:#00e676!important}.green-text.text-accent-3{color:#00e676!important}.green.accent-4{background-color:#00c853!important}.green-text.text-accent-4{color:#00c853!important}.light-green{background-color:#8bc34a!important}.light-green-text{color:#8bc34a!important}.light-green.lighten-5{background-color:#f1f8e9!important}.light-green-text.text-lighten-5{color:#f1f8e9!important}.light-green.lighten-4{background-color:#dcedc8!important}.light-green-text.text-lighten-4{color:#dcedc8!important}.light-green.lighten-3{background-color:#c5e1a5!important}.light-green-text.text-lighten-3{color:#c5e1a5!important}.light-green.lighten-2{background-color:#aed581!important}.light-green-text.text-lighten-2{color:#aed581!important}.light-green.lighten-1{background-color:#9ccc65!important}.light-green-text.text-lighten-1{color:#9ccc65!important}.light-green.darken-1{background-color:#7cb342!important}.light-green-text.text-darken-1{color:#7cb342!important}.light-green.darken-2{background-color:#689f38!important}.light-green-text.text-darken-2{color:#689f38!important}.light-green.darken-3{background-color:#558b2f!important}.light-green-text.text-darken-3{color:#558b2f!important}.light-green.darken-4{background-color:#33691e!important}.light-green-text.text-darken-4{color:#33691e!important}.light-green.accent-1{background-color:#ccff90!important}.light-green-text.text-accent-1{color:#ccff90!important}.light-green.accent-2{background-color:#b2ff59!important}.light-green-text.text-accent-2{color:#b2ff59!important}.light-green.accent-3{background-color:#76ff03!important}.light-green-text.text-accent-3{color:#76ff03!important}.light-green.accent-4{background-color:#64dd17!important}.light-green-text.text-accent-4{color:#64dd17!important}.lime{background-color:#cddc39!important}.lime-text{color:#cddc39!important}.lime.lighten-5{background-color:#f9fbe7!important}.lime-text.text-lighten-5{color:#f9fbe7!important}.lime.lighten-4{background-color:#f0f4c3!important}.lime-text.text-lighten-4{color:#f0f4c3!important}.lime.lighten-3{background-color:#e6ee9c!important}.lime-text.text-lighten-3{color:#e6ee9c!important}.lime.lighten-2{background-color:#dce775!important}.lime-text.text-lighten-2{color:#dce775!important}.lime.lighten-1{background-color:#d4e157!important}.lime-text.text-lighten-1{color:#d4e157!important}.lime.darken-1{background-color:#c0ca33!important}.lime-text.text-darken-1{color:#c0ca33!important}.lime.darken-2{background-color:#afb42b!important}.lime-text.text-darken-2{color:#afb42b!important}.lime.darken-3{background-color:#9e9d24!important}.lime-text.text-darken-3{color:#9e9d24!important}.lime.darken-4{background-color:#827717!important}.lime-text.text-darken-4{color:#827717!important}.lime.accent-1{background-color:#f4ff81!important}.lime-text.text-accent-1{color:#f4ff81!important}.lime.accent-2{background-color:#eeff41!important}.lime-text.text-accent-2{color:#eeff41!important}.lime.accent-3{background-color:#c6ff00!important}.lime-text.text-accent-3{color:#c6ff00!important}.lime.accent-4{background-color:#aeea00!important}.lime-text.text-accent-4{color:#aeea00!important}.yellow{background-color:#ffeb3b!important}.yellow-text{color:#ffeb3b!important}.yellow.lighten-5{background-color:#fffde7!important}.yellow-text.text-lighten-5{color:#fffde7!important}.yellow.lighten-4{background-color:#fff9c4!important}.yellow-text.text-lighten-4{color:#fff9c4!important}.yellow.lighten-3{background-color:#fff59d!important}.yellow-text.text-lighten-3{color:#fff59d!important}.yellow.lighten-2{background-color:#fff176!important}.yellow-text.text-lighten-2{color:#fff176!important}.yellow.lighten-1{background-color:#ffee58!important}.yellow-text.text-lighten-1{color:#ffee58!important}.yellow.darken-1{background-color:#fdd835!important}.yellow-text.text-darken-1{color:#fdd835!important}.yellow.darken-2{background-color:#fbc02d!important}.yellow-text.text-darken-2{color:#fbc02d!important}.yellow.darken-3{background-color:#f9a825!important}.yellow-text.text-darken-3{color:#f9a825!important}.yellow.darken-4{background-color:#f57f17!important}.yellow-text.text-darken-4{color:#f57f17!important}.yellow.accent-1{background-color:#ffff8d!important}.yellow-text.text-accent-1{color:#ffff8d!important}.yellow.accent-2{background-color:#ff0!important}.yellow-text.text-accent-2{color:#ff0!important}.yellow.accent-3{background-color:#ffea00!important}.yellow-text.text-accent-3{color:#ffea00!important}.yellow.accent-4{background-color:#ffd600!important}.yellow-text.text-accent-4{color:#ffd600!important}.amber{background-color:#ffc107!important}.amber-text{color:#ffc107!important}.amber.lighten-5{background-color:#fff8e1!important}.amber-text.text-lighten-5{color:#fff8e1!important}.amber.lighten-4{background-color:#ffecb3!important}.amber-text.text-lighten-4{color:#ffecb3!important}.amber.lighten-3{background-color:#ffe082!important}.amber-text.text-lighten-3{color:#ffe082!important}.amber.lighten-2{background-color:#ffd54f!important}.amber-text.text-lighten-2{color:#ffd54f!important}.amber.lighten-1{background-color:#ffca28!important}.amber-text.text-lighten-1{color:#ffca28!important}.amber.darken-1{background-color:#ffb300!important}.amber-text.text-darken-1{color:#ffb300!important}.amber.darken-2{background-color:#ffa000!important}.amber-text.text-darken-2{color:#ffa000!important}.amber.darken-3{background-color:#ff8f00!important}.amber-text.text-darken-3{color:#ff8f00!important}.amber.darken-4{background-color:#ff6f00!important}.amber-text.text-darken-4{color:#ff6f00!important}.amber.accent-1{background-color:#ffe57f!important}.amber-text.text-accent-1{color:#ffe57f!important}.amber.accent-2{background-color:#ffd740!important}.amber-text.text-accent-2{color:#ffd740!important}.amber.accent-3{background-color:#ffc400!important}.amber-text.text-accent-3{color:#ffc400!important}.amber.accent-4{background-color:#ffab00!important}.amber-text.text-accent-4{color:#ffab00!important}.orange{background-color:#ff9800!important}.orange-text{color:#ff9800!important}.orange.lighten-5{background-color:#fff3e0!important}.orange-text.text-lighten-5{color:#fff3e0!important}.orange.lighten-4{background-color:#ffe0b2!important}.orange-text.text-lighten-4{color:#ffe0b2!important}.orange.lighten-3{background-color:#ffcc80!important}.orange-text.text-lighten-3{color:#ffcc80!important}.orange.lighten-2{background-color:#ffb74d!important}.orange-text.text-lighten-2{color:#ffb74d!important}.orange.lighten-1{background-color:#ffa726!important}.orange-text.text-lighten-1{color:#ffa726!important}.orange.darken-1{background-color:#fb8c00!important}.orange-text.text-darken-1{color:#fb8c00!important}.orange.darken-2{background-color:#f57c00!important}.orange-text.text-darken-2{color:#f57c00!important}.orange.darken-3{background-color:#ef6c00!important}.orange-text.text-darken-3{color:#ef6c00!important}.orange.darken-4{background-color:#e65100!important}.orange-text.text-darken-4{color:#e65100!important}.orange.accent-1{background-color:#ffd180!important}.orange-text.text-accent-1{color:#ffd180!important}.orange.accent-2{background-color:#ffab40!important}.orange-text.text-accent-2{color:#ffab40!important}.orange.accent-3{background-color:#ff9100!important}.orange-text.text-accent-3{color:#ff9100!important}.orange.accent-4{background-color:#ff6d00!important}.orange-text.text-accent-4{color:#ff6d00!important}.deep-orange{background-color:#ff5722!important}.deep-orange-text{color:#ff5722!important}.deep-orange.lighten-5{background-color:#fbe9e7!important}.deep-orange-text.text-lighten-5{color:#fbe9e7!important}.deep-orange.lighten-4{background-color:#ffccbc!important}.deep-orange-text.text-lighten-4{color:#ffccbc!important}.deep-orange.lighten-3{background-color:#ffab91!important}.deep-orange-text.text-lighten-3{color:#ffab91!important}.deep-orange.lighten-2{background-color:#ff8a65!important}.deep-orange-text.text-lighten-2{color:#ff8a65!important}.deep-orange.lighten-1{background-color:#ff7043!important}.deep-orange-text.text-lighten-1{color:#ff7043!important}.deep-orange.darken-1{background-color:#f4511e!important}.deep-orange-text.text-darken-1{color:#f4511e!important}.deep-orange.darken-2{background-color:#e64a19!important}.deep-orange-text.text-darken-2{color:#e64a19!important}.deep-orange.darken-3{background-color:#d84315!important}.deep-orange-text.text-darken-3{color:#d84315!important}.deep-orange.darken-4{background-color:#bf360c!important}.deep-orange-text.text-darken-4{color:#bf360c!important}.deep-orange.accent-1{background-color:#ff9e80!important}.deep-orange-text.text-accent-1{color:#ff9e80!important}.deep-orange.accent-2{background-color:#ff6e40!important}.deep-orange-text.text-accent-2{color:#ff6e40!important}.deep-orange.accent-3{background-color:#ff3d00!important}.deep-orange-text.text-accent-3{color:#ff3d00!important}.deep-orange.accent-4{background-color:#dd2c00!important}.deep-orange-text.text-accent-4{color:#dd2c00!important}.brown{background-color:#795548!important}.brown-text{color:#795548!important}.brown.lighten-5{background-color:#efebe9!important}.brown-text.text-lighten-5{color:#efebe9!important}.brown.lighten-4{background-color:#d7ccc8!important}.brown-text.text-lighten-4{color:#d7ccc8!important}.brown.lighten-3{background-color:#bcaaa4!important}.brown-text.text-lighten-3{color:#bcaaa4!important}.brown.lighten-2{background-color:#a1887f!important}.brown-text.text-lighten-2{color:#a1887f!important}.brown.lighten-1{background-color:#8d6e63!important}.brown-text.text-lighten-1{color:#8d6e63!important}.brown.darken-1{background-color:#6d4c41!important}.brown-text.text-darken-1{color:#6d4c41!important}.brown.darken-2{background-color:#5d4037!important}.brown-text.text-darken-2{color:#5d4037!important}.brown.darken-3{background-color:#4e342e!important}.brown-text.text-darken-3{color:#4e342e!important}.brown.darken-4{background-color:#3e2723!important}.brown-text.text-darken-4{color:#3e2723!important}.blue-grey{background-color:#607d8b!important}.blue-grey-text{color:#607d8b!important}.blue-grey.lighten-5{background-color:#eceff1!important}.blue-grey-text.text-lighten-5{color:#eceff1!important}.blue-grey.lighten-4{background-color:#cfd8dc!important}.blue-grey-text.text-lighten-4{color:#cfd8dc!important}.blue-grey.lighten-3{background-color:#b0bec5!important}.blue-grey-text.text-lighten-3{color:#b0bec5!important}.blue-grey.lighten-2{background-color:#90a4ae!important}.blue-grey-text.text-lighten-2{color:#90a4ae!important}.blue-grey.lighten-1{background-color:#78909c!important}.blue-grey-text.text-lighten-1{color:#78909c!important}.blue-grey.darken-1{background-color:#546e7a!important}.blue-grey-text.text-darken-1{color:#546e7a!important}.blue-grey.darken-2{background-color:#455a64!important}.blue-grey-text.text-darken-2{color:#455a64!important}.blue-grey.darken-3{background-color:#37474f!important}.blue-grey-text.text-darken-3{color:#37474f!important}.blue-grey.darken-4{background-color:#263238!important}.blue-grey-text.text-darken-4{color:#263238!important}.grey{background-color:#9e9e9e!important}.grey-text{color:#9e9e9e!important}.grey.lighten-5{background-color:#fafafa!important}.grey-text.text-lighten-5{color:#fafafa!important}.grey.lighten-4{background-color:#f5f5f5!important}.grey-text.text-lighten-4{color:#f5f5f5!important}.grey.lighten-3{background-color:#eee!important}.grey-text.text-lighten-3{color:#eee!important}.grey.lighten-2{background-color:#e0e0e0!important}.grey-text.text-lighten-2{color:#e0e0e0!important}.grey.lighten-1{background-color:#bdbdbd!important}.grey-text.text-lighten-1{color:#bdbdbd!important}.grey.darken-1{background-color:#757575!important}.grey-text.text-darken-1{color:#757575!important}.grey.darken-2{background-color:#616161!important}.grey-text.text-darken-2{color:#616161!important}.grey.darken-3{background-color:#424242!important}.grey-text.text-darken-3{color:#424242!important}.grey.darken-4{background-color:#212121!important}.grey-text.text-darken-4{color:#212121!important}.black{background-color:#000!important}.black-text{color:#000!important}.white{background-color:#fff!important}.white-text{color:#fff!important}.transparent{background-color:transparent!important}.transparent-text{color:transparent!important}\r\n\r\n/*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */html{font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%}body{margin:0}article,aside,details,figcaption,figure,footer,header,hgroup,main,menu,nav,section,summary{display:block}audio,canvas,progress,video{display:inline-block;vertical-align:baseline}audio:not([controls]){display:none;height:0}[hidden],template{display:none}a{background-color:transparent}a:active,a:hover{outline:0}abbr[title]{border-bottom:1px dotted}b,strong{font-weight:700}dfn{font-style:italic}h1{font-size:2em;margin:.67em 0}mark{background:#ff0;color:#000}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}img{border:0}svg:not(:root){overflow:hidden}figure{margin:1em 40px}hr{box-sizing:content-box;height:0}pre{overflow:auto}code,kbd,pre,samp{font-family:monospace,monospace;font-size:1em}button,input,optgroup,select,textarea{color:inherit;font:inherit;margin:0}button{overflow:visible}button,select{text-transform:none}button,html input[type=button],input[type=reset],input[type=submit]{-webkit-appearance:button;cursor:pointer}button[disabled],html input[disabled]{cursor:default}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}input{line-height:normal}input[type=checkbox],input[type=radio]{box-sizing:border-box;padding:0}input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{height:auto}input[type=search]{-webkit-appearance:textfield;box-sizing:content-box}input[type=search]::-webkit-search-cancel-button,input[type=search]::-webkit-search-decoration{-webkit-appearance:none}fieldset{border:1px solid silver;margin:0 2px;padding:.35em .625em .75em}legend{border:0;padding:0}textarea{overflow:auto}optgroup{font-weight:700}table{border-collapse:collapse;border-spacing:0}td,th{padding:0}html{box-sizing:border-box}*,:after,:before{box-sizing:inherit}ul:not(.browser-default){padding-left:0;list-style-type:none}ul:not(.browser-default) li{list-style-type:none}a{color:#039be5;-webkit-tap-highlight-color:transparent}.valign-wrapper{display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-align-items:center;-ms-flex-align:center;align-items:center}.valign-wrapper .valign{display:block}.clearfix{clear:both}.z-depth-0{box-shadow:none!important}.btn,.btn-floating,.btn-large,.card,.card-panel,.collapsible,.dropdown-content,.side-nav,.toast,.z-depth-1,nav{box-shadow:0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12),0 3px 1px -2px rgba(0,0,0,.2)}.btn-floating:hover,.btn-large:hover,.btn:hover,.z-depth-1-half{box-shadow:0 3px 3px 0 rgba(0,0,0,.14),0 1px 7px 0 rgba(0,0,0,.12),0 3px 1px -1px rgba(0,0,0,.2)}.z-depth-2{box-shadow:0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12),0 2px 4px -1px rgba(0,0,0,.3)}.z-depth-3{box-shadow:0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12),0 3px 5px -1px rgba(0,0,0,.3)}.modal,.z-depth-4{box-shadow:0 8px 10px 1px rgba(0,0,0,.14),0 3px 14px 2px rgba(0,0,0,.12),0 5px 5px -3px rgba(0,0,0,.3)}.z-depth-5{box-shadow:0 16px 24px 2px rgba(0,0,0,.14),0 6px 30px 5px rgba(0,0,0,.12),0 8px 10px -5px rgba(0,0,0,.3)}.hoverable{transition:box-shadow .25s;box-shadow:0}.hoverable:hover{transition:box-shadow .25s;box-shadow:0 8px 17px 0 rgba(0,0,0,.2),0 6px 20px 0 rgba(0,0,0,.19)}.divider{height:1px;overflow:hidden;background-color:#e0e0e0}blockquote{margin:20px 0;padding-left:1.5rem;border-left:5px solid #ee6e73}i{line-height:inherit}i.left{float:left;margin-right:15px}i.right{float:right;margin-left:15px}i.tiny{font-size:1rem}i.small{font-size:2rem}i.medium{font-size:4rem}i.large{font-size:6rem}img.responsive-img,video.responsive-video{max-width:100%;height:auto}.pagination li{display:inline-block;border-radius:2px;text-align:center;vertical-align:top;height:30px}.pagination li a{color:#444;display:inline-block;font-size:1.2rem;padding:0 10px;line-height:30px}.pagination li.active a{color:#fff}.pagination li.active{background-color:#ee6e73}.pagination li.disabled a{cursor:default;color:#999}.pagination li i{font-size:2rem}.pagination li.pages ul li{display:inline-block;float:none}@media only screen and (max-width:992px){.pagination{width:100%}.pagination li.next,.pagination li.prev{width:10%}.pagination li.pages{width:80%;overflow:hidden;white-space:nowrap}}.breadcrumb{font-size:18px;color:hsla(0,0%,100%,.7)}.breadcrumb [class*=mdi-],.breadcrumb [class^=mdi-],.breadcrumb i,.breadcrumb i.material-icons{display:inline-block;float:left;font-size:24px}.breadcrumb:before{content:\"\\E5CC\";color:hsla(0,0%,100%,.7);vertical-align:top;display:inline-block;font-family:Material Icons;font-weight:400;font-style:normal;font-size:25px;margin:0 10px 0 8px;-webkit-font-smoothing:antialiased}.breadcrumb:first-child:before{display:none}.breadcrumb:last-child{color:#fff}.parallax-container{position:relative;overflow:hidden;height:500px}.parallax{top:0;left:0;right:0;z-index:-1}.parallax,.parallax img{position:absolute;bottom:0}.parallax img{display:none;left:50%;min-width:100%;min-height:100%;-webkit-transform:translateZ(0);transform:translateZ(0);-webkit-transform:translateX(-50%);transform:translateX(-50%)}.pin-bottom,.pin-top{position:relative}.pinned{position:fixed!important}.fade-in,ul.staggered-list li{opacity:0}.fade-in{-webkit-transform-origin:0 50%;transform-origin:0 50%}@media only screen and (max-width:600px){.hide-on-small-and-down,.hide-on-small-only{display:none!important}}@media only screen and (max-width:992px){.hide-on-med-and-down{display:none!important}}@media only screen and (min-width:601px){.hide-on-med-and-up{display:none!important}}@media only screen and (min-width:600px) and (max-width:992px){.hide-on-med-only{display:none!important}}@media only screen and (min-width:993px){.hide-on-large-only{display:none!important}}@media only screen and (min-width:993px){.show-on-large{display:block!important}}@media only screen and (min-width:600px) and (max-width:992px){.show-on-medium{display:block!important}}@media only screen and (max-width:600px){.show-on-small{display:block!important}}@media only screen and (min-width:601px){.show-on-medium-and-up{display:block!important}}@media only screen and (max-width:992px){.show-on-medium-and-down{display:block!important}}@media only screen and (max-width:600px){.center-on-small-only{text-align:center}}footer.page-footer{margin-top:20px;padding-top:20px;background-color:#ee6e73}footer.page-footer .footer-copyright{overflow:hidden;height:50px;line-height:50px;color:hsla(0,0%,100%,.8);background-color:rgba(51,51,51,.08)}table,td,th{border:none}table{width:100%;display:table}table.bordered>tbody>tr,table.bordered>thead>tr{border-bottom:1px solid #d0d0d0}table.striped>tbody>tr:nth-child(odd){background-color:#f2f2f2}table.striped>tbody>tr>td{border-radius:0}table.highlight>tbody>tr{transition:background-color .25s ease}table.highlight>tbody>tr:hover{background-color:#f2f2f2}table.centered tbody tr td,table.centered thead tr th{text-align:center}thead{border-bottom:1px solid #d0d0d0}td,th{padding:15px 5px;display:table-cell;text-align:left;vertical-align:middle;border-radius:2px}@media only screen and (max-width:992px){table.responsive-table{width:100%;border-collapse:collapse;border-spacing:0;display:block;position:relative}table.responsive-table td:empty:before{content:\"\\A0\"}table.responsive-table td,table.responsive-table th{margin:0;vertical-align:top}table.responsive-table th{text-align:left}table.responsive-table thead{display:block;float:left}table.responsive-table thead tr{display:block;padding:0 10px 0 0}table.responsive-table thead tr th:before{content:\"\\A0\"}table.responsive-table tbody{display:block;width:auto;position:relative;overflow-x:auto;white-space:nowrap}table.responsive-table tbody tr{display:inline-block;vertical-align:top}table.responsive-table th{display:block;text-align:right}table.responsive-table td{display:block;min-height:1.25em;text-align:left}table.responsive-table tr{padding:0 10px}table.responsive-table thead{border:0;border-right:1px solid #d0d0d0}table.responsive-table.bordered th{border-bottom:0;border-left:0}table.responsive-table.bordered td{border-left:0;border-right:0;border-bottom:0}table.responsive-table.bordered tr{border:0}table.responsive-table.bordered tbody tr{border-right:1px solid #d0d0d0}}.collection{margin:.5rem 0 1rem;border:1px solid #e0e0e0;border-radius:2px;overflow:hidden;position:relative}.collection .collection-item{background-color:#fff;line-height:1.5rem;padding:10px 20px;margin:0;border-bottom:1px solid #e0e0e0}.collection .collection-item.avatar{min-height:84px;padding-left:72px;position:relative}.collection .collection-item.avatar .circle{position:absolute;width:42px;height:42px;overflow:hidden;left:15px;display:inline-block;vertical-align:middle}.collection .collection-item.avatar i.circle{font-size:18px;line-height:42px;color:#fff;background-color:#999;text-align:center}.collection .collection-item.avatar .title{font-size:16px}.collection .collection-item.avatar p{margin:0}.collection .collection-item.avatar .secondary-content{position:absolute;top:16px;right:16px}.collection .collection-item:last-child{border-bottom:none}.collection .collection-item.active{background-color:#26a69a;color:#eafaf9}.collection .collection-item.active .secondary-content{color:#fff}.collection a.collection-item{display:block;transition:.25s;color:#26a69a}.collection a.collection-item:not(.active):hover{background-color:#ddd}.collection.with-header .collection-header{background-color:#fff;border-bottom:1px solid #e0e0e0;padding:10px 20px}.collection.with-header .collection-item{padding-left:30px}.collection.with-header .collection-item.avatar{padding-left:72px}.secondary-content{float:right;color:#26a69a}.collapsible .collection{margin:0;border:none}span.badge{min-width:3rem;padding:0 6px;margin-left:14px;text-align:center;font-size:1rem;line-height:inherit;color:#757575;float:right;box-sizing:border-box}span.badge.new{font-weight:300;font-size:.8rem;color:#fff;background-color:#26a69a;border-radius:2px}span.badge.new:after{content:\" new\"}span.badge[data-badge-caption]:after{content:\" \" attr(data-badge-caption)}nav ul a span.badge{display:inline-block;float:none;margin-left:4px;line-height:22px;height:22px}.collapsible span.badge.new,.side-nav span.badge.new{position:relative;background-color:transparent}.collapsible span.badge.new:before,.side-nav span.badge.new:before{content:\"\";position:absolute;top:10px;right:0;bottom:10px;left:0;background-color:#26a69a;border-radius:2px;z-index:-1}.collapsible span.badge.new{z-index:1}.video-container{position:relative;padding-bottom:56.25%;height:0;overflow:hidden}.video-container embed,.video-container iframe,.video-container object{position:absolute;top:0;left:0;width:100%;height:100%}.progress{position:relative;height:4px;display:block;width:100%;background-color:#acece6;border-radius:2px;margin:.5rem 0 1rem;overflow:hidden}.progress .determinate{position:absolute;top:0;left:0;bottom:0;transition:width .3s linear}.progress .determinate,.progress .indeterminate{background-color:#26a69a}.progress .indeterminate:before{-webkit-animation:indeterminate 2.1s cubic-bezier(.65,.815,.735,.395) infinite;animation:indeterminate 2.1s cubic-bezier(.65,.815,.735,.395) infinite}.progress .indeterminate:after,.progress .indeterminate:before{content:\"\";position:absolute;background-color:inherit;top:0;left:0;bottom:0;will-change:left,right}.progress .indeterminate:after{-webkit-animation:indeterminate-short 2.1s cubic-bezier(.165,.84,.44,1) infinite;animation:indeterminate-short 2.1s cubic-bezier(.165,.84,.44,1) infinite;-webkit-animation-delay:1.15s;animation-delay:1.15s}@-webkit-keyframes indeterminate{0%{left:-35%;right:100%}60%{left:100%;right:-90%}to{left:100%;right:-90%}}@keyframes indeterminate{0%{left:-35%;right:100%}60%{left:100%;right:-90%}to{left:100%;right:-90%}}@-webkit-keyframes indeterminate-short{0%{left:-200%;right:100%}60%{left:107%;right:-8%}to{left:107%;right:-8%}}@keyframes indeterminate-short{0%{left:-200%;right:100%}60%{left:107%;right:-8%}to{left:107%;right:-8%}}.hide{display:none!important}.left-align{text-align:left}.right-align{text-align:right}.center,.center-align{text-align:center}.left{float:left!important}.right{float:right!important}.no-select,input[type=range],input[type=range]+.thumb{-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.circle{border-radius:50%}.center-block{display:block;margin-left:auto;margin-right:auto}.truncate{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.no-padding{padding:0!important}.material-icons{text-rendering:optimizeLegibility;-webkit-font-feature-settings:\"liga\";-moz-font-feature-settings:\"liga\";font-feature-settings:\"liga\"}.container{margin:0 auto;max-width:1280px;width:90%}@media only screen and (min-width:601px){.container{width:85%}}@media only screen and (min-width:993px){.container{width:70%}}.container .row{margin-left:-.75rem;margin-right:-.75rem}.section{padding-top:1rem;padding-bottom:1rem}.section.no-pad{padding:0}.section.no-pad-bot{padding-bottom:0}.section.no-pad-top{padding-top:0}.row{margin-left:auto;margin-right:auto;margin-bottom:20px}.row:after{content:\"\";display:table;clear:both}.row .col{float:left;box-sizing:border-box;padding:0 .75rem;min-height:1px}.row .col[class*=pull-],.row .col[class*=push-]{position:relative}.row .col.s1{width:8.3333333333%}.row .col.s1,.row .col.s2{margin-left:auto;left:auto;right:auto}.row .col.s2{width:16.6666666667%}.row .col.s3{width:25%}.row .col.s3,.row .col.s4{margin-left:auto;left:auto;right:auto}.row .col.s4{width:33.3333333333%}.row .col.s5{width:41.6666666667%}.row .col.s5,.row .col.s6{margin-left:auto;left:auto;right:auto}.row .col.s6{width:50%}.row .col.s7{width:58.3333333333%}.row .col.s7,.row .col.s8{margin-left:auto;left:auto;right:auto}.row .col.s8{width:66.6666666667%}.row .col.s9{width:75%}.row .col.s9,.row .col.s10{margin-left:auto;left:auto;right:auto}.row .col.s10{width:83.3333333333%}.row .col.s11{width:91.6666666667%}.row .col.s11,.row .col.s12{margin-left:auto;left:auto;right:auto}.row .col.s12{width:100%}.row .col.offset-s1{margin-left:8.3333333333%}.row .col.pull-s1{right:8.3333333333%}.row .col.push-s1{left:8.3333333333%}.row .col.offset-s2{margin-left:16.6666666667%}.row .col.pull-s2{right:16.6666666667%}.row .col.push-s2{left:16.6666666667%}.row .col.offset-s3{margin-left:25%}.row .col.pull-s3{right:25%}.row .col.push-s3{left:25%}.row .col.offset-s4{margin-left:33.3333333333%}.row .col.pull-s4{right:33.3333333333%}.row .col.push-s4{left:33.3333333333%}.row .col.offset-s5{margin-left:41.6666666667%}.row .col.pull-s5{right:41.6666666667%}.row .col.push-s5{left:41.6666666667%}.row .col.offset-s6{margin-left:50%}.row .col.pull-s6{right:50%}.row .col.push-s6{left:50%}.row .col.offset-s7{margin-left:58.3333333333%}.row .col.pull-s7{right:58.3333333333%}.row .col.push-s7{left:58.3333333333%}.row .col.offset-s8{margin-left:66.6666666667%}.row .col.pull-s8{right:66.6666666667%}.row .col.push-s8{left:66.6666666667%}.row .col.offset-s9{margin-left:75%}.row .col.pull-s9{right:75%}.row .col.push-s9{left:75%}.row .col.offset-s10{margin-left:83.3333333333%}.row .col.pull-s10{right:83.3333333333%}.row .col.push-s10{left:83.3333333333%}.row .col.offset-s11{margin-left:91.6666666667%}.row .col.pull-s11{right:91.6666666667%}.row .col.push-s11{left:91.6666666667%}.row .col.offset-s12{margin-left:100%}.row .col.pull-s12{right:100%}.row .col.push-s12{left:100%}@media only screen and (min-width:601px){.row .col.m1{width:8.3333333333%}.row .col.m1,.row .col.m2{margin-left:auto;left:auto;right:auto}.row .col.m2{width:16.6666666667%}.row .col.m3{width:25%}.row .col.m3,.row .col.m4{margin-left:auto;left:auto;right:auto}.row .col.m4{width:33.3333333333%}.row .col.m5{width:41.6666666667%}.row .col.m5,.row .col.m6{margin-left:auto;left:auto;right:auto}.row .col.m6{width:50%}.row .col.m7{width:58.3333333333%}.row .col.m7,.row .col.m8{margin-left:auto;left:auto;right:auto}.row .col.m8{width:66.6666666667%}.row .col.m9{width:75%}.row .col.m9,.row .col.m10{margin-left:auto;left:auto;right:auto}.row .col.m10{width:83.3333333333%}.row .col.m11{width:91.6666666667%}.row .col.m11,.row .col.m12{margin-left:auto;left:auto;right:auto}.row .col.m12{width:100%}.row .col.offset-m1{margin-left:8.3333333333%}.row .col.pull-m1{right:8.3333333333%}.row .col.push-m1{left:8.3333333333%}.row .col.offset-m2{margin-left:16.6666666667%}.row .col.pull-m2{right:16.6666666667%}.row .col.push-m2{left:16.6666666667%}.row .col.offset-m3{margin-left:25%}.row .col.pull-m3{right:25%}.row .col.push-m3{left:25%}.row .col.offset-m4{margin-left:33.3333333333%}.row .col.pull-m4{right:33.3333333333%}.row .col.push-m4{left:33.3333333333%}.row .col.offset-m5{margin-left:41.6666666667%}.row .col.pull-m5{right:41.6666666667%}.row .col.push-m5{left:41.6666666667%}.row .col.offset-m6{margin-left:50%}.row .col.pull-m6{right:50%}.row .col.push-m6{left:50%}.row .col.offset-m7{margin-left:58.3333333333%}.row .col.pull-m7{right:58.3333333333%}.row .col.push-m7{left:58.3333333333%}.row .col.offset-m8{margin-left:66.6666666667%}.row .col.pull-m8{right:66.6666666667%}.row .col.push-m8{left:66.6666666667%}.row .col.offset-m9{margin-left:75%}.row .col.pull-m9{right:75%}.row .col.push-m9{left:75%}.row .col.offset-m10{margin-left:83.3333333333%}.row .col.pull-m10{right:83.3333333333%}.row .col.push-m10{left:83.3333333333%}.row .col.offset-m11{margin-left:91.6666666667%}.row .col.pull-m11{right:91.6666666667%}.row .col.push-m11{left:91.6666666667%}.row .col.offset-m12{margin-left:100%}.row .col.pull-m12{right:100%}.row .col.push-m12{left:100%}}@media only screen and (min-width:993px){.row .col.l1{width:8.3333333333%}.row .col.l1,.row .col.l2{margin-left:auto;left:auto;right:auto}.row .col.l2{width:16.6666666667%}.row .col.l3{width:25%}.row .col.l3,.row .col.l4{margin-left:auto;left:auto;right:auto}.row .col.l4{width:33.3333333333%}.row .col.l5{width:41.6666666667%}.row .col.l5,.row .col.l6{margin-left:auto;left:auto;right:auto}.row .col.l6{width:50%}.row .col.l7{width:58.3333333333%}.row .col.l7,.row .col.l8{margin-left:auto;left:auto;right:auto}.row .col.l8{width:66.6666666667%}.row .col.l9{width:75%}.row .col.l9,.row .col.l10{margin-left:auto;left:auto;right:auto}.row .col.l10{width:83.3333333333%}.row .col.l11{width:91.6666666667%}.row .col.l11,.row .col.l12{margin-left:auto;left:auto;right:auto}.row .col.l12{width:100%}.row .col.offset-l1{margin-left:8.3333333333%}.row .col.pull-l1{right:8.3333333333%}.row .col.push-l1{left:8.3333333333%}.row .col.offset-l2{margin-left:16.6666666667%}.row .col.pull-l2{right:16.6666666667%}.row .col.push-l2{left:16.6666666667%}.row .col.offset-l3{margin-left:25%}.row .col.pull-l3{right:25%}.row .col.push-l3{left:25%}.row .col.offset-l4{margin-left:33.3333333333%}.row .col.pull-l4{right:33.3333333333%}.row .col.push-l4{left:33.3333333333%}.row .col.offset-l5{margin-left:41.6666666667%}.row .col.pull-l5{right:41.6666666667%}.row .col.push-l5{left:41.6666666667%}.row .col.offset-l6{margin-left:50%}.row .col.pull-l6{right:50%}.row .col.push-l6{left:50%}.row .col.offset-l7{margin-left:58.3333333333%}.row .col.pull-l7{right:58.3333333333%}.row .col.push-l7{left:58.3333333333%}.row .col.offset-l8{margin-left:66.6666666667%}.row .col.pull-l8{right:66.6666666667%}.row .col.push-l8{left:66.6666666667%}.row .col.offset-l9{margin-left:75%}.row .col.pull-l9{right:75%}.row .col.push-l9{left:75%}.row .col.offset-l10{margin-left:83.3333333333%}.row .col.pull-l10{right:83.3333333333%}.row .col.push-l10{left:83.3333333333%}.row .col.offset-l11{margin-left:91.6666666667%}.row .col.pull-l11{right:91.6666666667%}.row .col.push-l11{left:91.6666666667%}.row .col.offset-l12{margin-left:100%}.row .col.pull-l12{right:100%}.row .col.push-l12{left:100%}}nav{color:#fff;background-color:#ee6e73;width:100%;height:56px;line-height:56px}nav.nav-extended,nav.nav-extended .nav-wrapper{height:auto}nav a{color:#fff}nav [class*=mdi-],nav [class^=mdi-],nav i,nav i.material-icons{display:block;font-size:24px;height:56px;line-height:56px}nav .nav-wrapper{position:relative;height:100%}@media only screen and (min-width:993px){nav a.button-collapse{display:none}}nav .button-collapse{float:left;position:relative;z-index:1;height:56px;margin:0 18px}nav .button-collapse i{height:56px;line-height:56px}nav .brand-logo{position:absolute;color:#fff;display:inline-block;font-size:2.1rem;padding:0;white-space:nowrap}nav .brand-logo.center{left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%)}@media only screen and (max-width:992px){nav .brand-logo{left:50%;-webkit-transform:translateX(-50%);transform:translateX(-50%)}nav .brand-logo.left,nav .brand-logo.right{padding:0;-webkit-transform:none;transform:none}nav .brand-logo.left{left:.5rem}nav .brand-logo.right{right:.5rem;left:auto}}nav .brand-logo.right{right:.5rem;padding:0}nav .brand-logo [class*=mdi-],nav .brand-logo [class^=mdi-],nav .brand-logo i,nav .brand-logo i.material-icons{float:left;margin-right:15px}nav ul{margin:0}nav ul li{transition:background-color .3s;float:left;padding:0}nav ul li.active{background-color:rgba(0,0,0,.1)}nav ul a{transition:background-color .3s;font-size:1rem;color:#fff;display:block;padding:0 15px;cursor:pointer}nav ul a.btn,nav ul a.btn-flat,nav ul a.btn-floating,nav ul a.btn-large{margin-top:-2px;margin-left:15px;margin-right:15px}nav ul a:hover{background-color:rgba(0,0,0,.1)}nav ul.left{float:left}nav form{height:100%}nav .input-field{margin:0;height:100%}nav .input-field input{height:100%;font-size:1.2rem;border:none;padding-left:2rem}nav .input-field input:focus,nav .input-field input[type=date]:valid,nav .input-field input[type=email]:valid,nav .input-field input[type=password]:valid,nav .input-field input[type=text]:valid,nav .input-field input[type=url]:valid{border:none;box-shadow:none}nav .input-field label{top:0;left:0}nav .input-field label i{color:hsla(0,0%,100%,.7);transition:color .3s}nav .input-field label.active i{color:#fff}nav .input-field label.active{-webkit-transform:translateY(0);transform:translateY(0)}.navbar-fixed{position:relative;height:56px;z-index:997}.navbar-fixed nav{position:fixed}@media only screen and (min-width:601px){nav,nav .nav-wrapper i,nav a.button-collapse,nav a.button-collapse i{height:64px;line-height:64px}.navbar-fixed{height:64px}}a{text-decoration:none}html{line-height:1.5;font-family:Roboto,sans-serif;font-weight:400;color:rgba(0,0,0,.87)}@media only screen and (min-width:0){html{font-size:14px}}@media only screen and (min-width:992px){html{font-size:14.5px}}@media only screen and (min-width:1200px){html{font-size:15px}}h1,h2,h3,h4,h5,h6{font-weight:400;line-height:1.1}h1 a,h2 a,h3 a,h4 a,h5 a,h6 a{font-weight:inherit}h1{font-size:4.2rem;margin:2.1rem 0 1.68rem}h1,h2{line-height:110%}h2{font-size:3.56rem;margin:1.78rem 0 1.424rem}h3{font-size:2.92rem;margin:1.46rem 0 1.168rem}h3,h4{line-height:110%}h4{font-size:2.28rem;margin:1.14rem 0 .912rem}h5{font-size:1.64rem;margin:.82rem 0 .656rem}h5,h6{line-height:110%}h6{font-size:1rem;margin:.5rem 0 .4rem}em{font-style:italic}strong{font-weight:500}small{font-size:75%}.light,footer.page-footer .footer-copyright{font-weight:300}.thin{font-weight:200}.flow-text{font-weight:300}@media only screen and (min-width:360px){.flow-text{font-size:1.2rem}}@media only screen and (min-width:390px){.flow-text{font-size:1.224rem}}@media only screen and (min-width:420px){.flow-text{font-size:1.248rem}}@media only screen and (min-width:450px){.flow-text{font-size:1.272rem}}@media only screen and (min-width:480px){.flow-text{font-size:1.296rem}}@media only screen and (min-width:510px){.flow-text{font-size:1.32rem}}@media only screen and (min-width:540px){.flow-text{font-size:1.344rem}}@media only screen and (min-width:570px){.flow-text{font-size:1.368rem}}@media only screen and (min-width:600px){.flow-text{font-size:1.392rem}}@media only screen and (min-width:630px){.flow-text{font-size:1.416rem}}@media only screen and (min-width:660px){.flow-text{font-size:1.44rem}}@media only screen and (min-width:690px){.flow-text{font-size:1.464rem}}@media only screen and (min-width:720px){.flow-text{font-size:1.488rem}}@media only screen and (min-width:750px){.flow-text{font-size:1.512rem}}@media only screen and (min-width:780px){.flow-text{font-size:1.536rem}}@media only screen and (min-width:810px){.flow-text{font-size:1.56rem}}@media only screen and (min-width:840px){.flow-text{font-size:1.584rem}}@media only screen and (min-width:870px){.flow-text{font-size:1.608rem}}@media only screen and (min-width:900px){.flow-text{font-size:1.632rem}}@media only screen and (min-width:930px){.flow-text{font-size:1.656rem}}@media only screen and (min-width:960px){.flow-text{font-size:1.68rem}}@media only screen and (max-width:360px){.flow-text{font-size:1.2rem}}.card-panel{padding:20px}.card,.card-panel{transition:box-shadow .25s;margin:.5rem 0 1rem;border-radius:2px;background-color:#fff}.card{position:relative}.card .card-title{font-size:24px;font-weight:300}.card .card-title.activator{cursor:pointer}.card.large,.card.medium,.card.small{position:relative}.card.large .card-image,.card.medium .card-image,.card.small .card-image{max-height:60%;overflow:hidden}.card.large .card-image+.card-content,.card.medium .card-image+.card-content,.card.small .card-image+.card-content{max-height:40%}.card.large .card-content,.card.medium .card-content,.card.small .card-content{max-height:100%;overflow:hidden}.card.large .card-action,.card.medium .card-action,.card.small .card-action{position:absolute;bottom:0;left:0;right:0}.card.small{height:300px}.card.medium{height:400px}.card.large{height:500px}.card.horizontal{display:-webkit-flex;display:-ms-flexbox;display:flex}.card.horizontal.large .card-image,.card.horizontal.medium .card-image,.card.horizontal.small .card-image{height:100%;max-height:none;overflow:visible}.card.horizontal.large .card-image img,.card.horizontal.medium .card-image img,.card.horizontal.small .card-image img{height:100%}.card.horizontal .card-image{max-width:50%}.card.horizontal .card-image img{border-radius:2px 0 0 2px;max-width:100%;width:auto}.card.horizontal .card-stacked{display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-flex:1;-ms-flex:1;flex:1;position:relative}.card.horizontal .card-stacked .card-content{-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1}.card.sticky-action .card-action{z-index:2}.card.sticky-action .card-reveal{z-index:1;padding-bottom:64px}.card .card-image{position:relative}.card .card-image img{display:block;border-radius:2px 2px 0 0;position:relative;left:0;right:0;top:0;bottom:0;width:100%}.card .card-image .card-title{color:#fff;position:absolute;bottom:0;left:0;padding:20px}.card .card-content{padding:20px;border-radius:0 0 2px 2px}.card .card-content p{margin:0;color:inherit}.card .card-content .card-title{line-height:48px}.card .card-action{position:relative;background-color:inherit;border-top:1px solid hsla(0,0%,63%,.2);padding:20px}.card .card-action a:not(.btn):not(.btn-large):not(.btn-floating){color:#ffab40;margin-right:20px;transition:color .3s ease;text-transform:uppercase}.card .card-action a:not(.btn):not(.btn-large):not(.btn-floating):hover{color:#ffd8a6}.card .card-reveal{padding:20px;position:absolute;background-color:#fff;width:100%;overflow-y:auto;left:0;top:100%;height:100%;z-index:3;display:none}.card .card-reveal .card-title{cursor:pointer;display:block}#toast-container{display:block;position:fixed;z-index:10000}@media only screen and (max-width:600px){#toast-container{min-width:100%;bottom:0}}@media only screen and (min-width:601px) and (max-width:992px){#toast-container{left:5%;bottom:7%;max-width:90%}}@media only screen and (min-width:993px){#toast-container{top:10%;right:7%;max-width:86%}}.toast{border-radius:2px;top:0;width:auto;clear:both;margin-top:10px;position:relative;max-width:100%;height:auto;min-height:48px;line-height:1.5em;word-break:break-all;background-color:#323232;padding:10px 25px;font-size:1.1rem;font-weight:300;color:#fff;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between}.toast .btn,.toast .btn-flat,.toast .btn-large{margin:0;margin-left:3rem}.toast.rounded{border-radius:24px}@media only screen and (max-width:600px){.toast{width:100%;border-radius:0}}@media only screen and (min-width:601px) and (max-width:992px){.toast{float:left}}@media only screen and (min-width:993px){.toast{float:right}}.tabs{position:relative;overflow-x:auto;overflow-y:hidden;height:48px;width:100%;background-color:#fff;margin:0 auto;white-space:nowrap}.tabs.tabs-transparent{background-color:transparent}.tabs.tabs-transparent .tab.disabled a,.tabs.tabs-transparent .tab.disabled a:hover,.tabs.tabs-transparent .tab a{color:hsla(0,0%,100%,.7)}.tabs.tabs-transparent .tab a.active,.tabs.tabs-transparent .tab a:hover{color:#fff}.tabs.tabs-transparent .indicator{background-color:#fff}.tabs.tabs-fixed-width{display:-webkit-flex;display:-ms-flexbox;display:flex}.tabs.tabs-fixed-width .tab{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1}.tabs .tab{display:inline-block;text-align:center;line-height:48px;height:48px;padding:0;margin:0;text-transform:uppercase}.tabs .tab a{color:rgba(238,110,115,.7);display:block;width:100%;height:100%;padding:0 24px;font-size:14px;text-overflow:ellipsis;overflow:hidden;transition:color .28s ease}.tabs .tab a.active,.tabs .tab a:hover{background-color:transparent;color:#ee6e73}.tabs .tab.disabled a,.tabs .tab.disabled a:hover{color:rgba(238,110,115,.7);cursor:default}.tabs .indicator{position:absolute;bottom:0;height:2px;background-color:#f6b2b5;will-change:left,right}@media only screen and (max-width:992px){.tabs{display:-webkit-flex;display:-ms-flexbox;display:flex}.tabs .tab{-webkit-box-flex:1;-webkit-flex-grow:1;-ms-flex-positive:1;flex-grow:1}.tabs .tab a{padding:0 12px}}.material-tooltip{padding:10px 8px;font-size:1rem;z-index:2000;background-color:transparent;border-radius:2px;color:#fff;min-height:36px;line-height:120%;text-align:center;max-width:calc(100% - 4px);overflow:hidden;left:0;top:0;pointer-events:none}.backdrop,.material-tooltip{opacity:0;display:none;position:absolute}.backdrop{height:7px;width:14px;border-radius:0 0 50% 50%;background-color:#323232;z-index:-1;-webkit-transform-origin:50% 0;transform-origin:50% 0;-webkit-transform:translateZ(0);transform:translateZ(0)}.btn,.btn-flat,.btn-large{border:none;border-radius:2px;display:inline-block;height:36px;line-height:36px;padding:0 2rem;text-transform:uppercase;vertical-align:middle;-webkit-tap-highlight-color:transparent}.btn-flat.disabled,.btn-flat:disabled,.btn-flat[disabled],.btn-floating.disabled,.btn-floating:disabled,.btn-floating[disabled],.btn-large.disabled,.btn-large:disabled,.btn-large[disabled],.btn.disabled,.btn:disabled,.btn[disabled],.disabled.btn-large,[disabled].btn-large{pointer-events:none;background-color:#dfdfdf!important;box-shadow:none;color:#9f9f9f!important;cursor:default}.btn-flat.disabled:hover,.btn-flat:disabled:hover,.btn-flat[disabled]:hover,.btn-floating.disabled:hover,.btn-floating:disabled:hover,.btn-floating[disabled]:hover,.btn-large.disabled:hover,.btn-large:disabled:hover,.btn-large[disabled]:hover,.btn.disabled:hover,.btn:disabled:hover,.btn[disabled]:hover,.disabled.btn-large:hover,[disabled].btn-large:hover{background-color:#dfdfdf!important;color:#9f9f9f!important}.btn,.btn-flat,.btn-floating,.btn-large{outline:0}.btn-flat i,.btn-floating i,.btn-large i,.btn i{font-size:1.3rem;line-height:inherit}.btn-floating:focus,.btn-large:focus,.btn:focus{background-color:#1d7d74}.btn,.btn-large{text-decoration:none;color:#fff;background-color:#26a69a;text-align:center;letter-spacing:.5px;transition:.2s ease-out;cursor:pointer}.btn-large:hover,.btn:hover{background-color:#2bbbad}.btn-floating{position:relative;overflow:hidden;z-index:1;width:40px;height:40px;padding:0;background-color:#26a69a;border-radius:50%;transition:.3s;cursor:pointer;vertical-align:middle}.btn-floating,.btn-floating i{display:inline-block;color:#fff;line-height:40px}.btn-floating i{width:inherit;text-align:center;font-size:1.6rem}.btn-floating:hover{background-color:#26a69a}.btn-floating:before{border-radius:0}.btn-floating.btn-large{width:56px;height:56px}.btn-floating.btn-large i{line-height:56px}button.btn-floating{border:none}.fixed-action-btn{position:fixed;right:23px;bottom:23px;padding-top:15px;margin-bottom:0;z-index:998}.fixed-action-btn.active ul{visibility:visible}.fixed-action-btn.horizontal{padding:0 0 0 15px}.fixed-action-btn.horizontal ul{text-align:right;right:64px;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%);height:100%;left:auto;width:500px}.fixed-action-btn.horizontal ul li{display:inline-block;margin:15px 15px 0 0}.fixed-action-btn.toolbar{padding:0;height:56px}.fixed-action-btn.toolbar.active>a i{opacity:0}.fixed-action-btn.toolbar ul{display:-webkit-flex;display:-ms-flexbox;display:flex;top:0;bottom:0}.fixed-action-btn.toolbar ul li{-webkit-flex:1;-ms-flex:1;flex:1;display:inline-block;margin:0;height:100%;transition:none}.fixed-action-btn.toolbar ul li a{display:block;overflow:hidden;position:relative;width:100%;height:100%;background-color:transparent;box-shadow:none;color:#fff;line-height:56px;z-index:1}.fixed-action-btn.toolbar ul li a i{line-height:inherit}.fixed-action-btn ul{left:0;right:0;text-align:center;position:absolute;bottom:64px;margin:0;visibility:hidden}.fixed-action-btn ul li{margin-bottom:15px}.fixed-action-btn ul a.btn-floating{opacity:0}.fixed-action-btn .fab-backdrop{position:absolute;top:0;left:0;z-index:-1;width:40px;height:40px;background-color:#26a69a;border-radius:50%;-webkit-transform:scale(0);transform:scale(0)}.btn-flat{box-shadow:none;color:#343434;cursor:pointer;transition:background-color .2s}.btn-flat,.btn-flat:active,.btn-flat:focus{background-color:transparent}.btn-flat:focus,.btn-flat:hover{background-color:rgba(0,0,0,.1);box-shadow:none}.btn-flat:active{background-color:rgba(0,0,0,.2)}.btn-flat.disabled{background-color:transparent!important;color:#b3b3b3!important;cursor:default}.btn-large{height:54px;line-height:54px}.btn-large i{font-size:1.6rem}.btn-block{display:block}.dropdown-content{background-color:#fff;margin:0;display:none;min-width:100px;max-height:650px;overflow-y:auto;opacity:0;position:absolute;z-index:999;will-change:width,height}.dropdown-content li{clear:both;color:rgba(0,0,0,.87);cursor:pointer;min-height:50px;line-height:1.5rem;width:100%;text-align:left;text-transform:none}.dropdown-content li.active,.dropdown-content li.selected,.dropdown-content li:hover{background-color:#eee}.dropdown-content li.active.selected{background-color:#e1e1e1}.dropdown-content li.divider{min-height:0;height:1px}.dropdown-content li>a,.dropdown-content li>span{font-size:16px;color:#26a69a;display:block;line-height:22px;padding:14px 16px}.dropdown-content li>span>label{top:1px;left:0;height:18px}.dropdown-content li>a>i{height:inherit;line-height:inherit}.input-field.col .dropdown-content [type=checkbox]+label{top:1px;left:0;height:18px}\r\n\r\n/*!\r\n * Waves v0.6.0\r\n * http://fian.my.id/Waves\r\n *\r\n * Copyright 2014 Alfiana E. Sibuea and other contributors\r\n * Released under the MIT license\r\n * https://github.com/fians/Waves/blob/master/LICENSE\r\n */.waves-effect{position:relative;cursor:pointer;display:inline-block;overflow:hidden;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;vertical-align:middle;z-index:1;will-change:opacity,transform;transition:.3s ease-out}.waves-effect .waves-ripple{position:absolute;border-radius:50%;width:20px;height:20px;margin-top:-10px;margin-left:-10px;opacity:0;background:rgba(0,0,0,.2);transition:all .7s ease-out;transition-property:opacity,-webkit-transform;transition-property:transform,opacity;transition-property:transform,opacity,-webkit-transform;-webkit-transform:scale(0);transform:scale(0);pointer-events:none}.waves-effect.waves-light .waves-ripple{background-color:hsla(0,0%,100%,.45)}.waves-effect.waves-red .waves-ripple{background-color:rgba(244,67,54,.7)}.waves-effect.waves-yellow .waves-ripple{background-color:rgba(255,235,59,.7)}.waves-effect.waves-orange .waves-ripple{background-color:rgba(255,152,0,.7)}.waves-effect.waves-purple .waves-ripple{background-color:rgba(156,39,176,.7)}.waves-effect.waves-green .waves-ripple{background-color:rgba(76,175,80,.7)}.waves-effect.waves-teal .waves-ripple{background-color:rgba(0,150,136,.7)}.waves-effect input[type=button],.waves-effect input[type=reset],.waves-effect input[type=submit]{border:0;font-style:normal;font-size:inherit;text-transform:inherit;background:none}.waves-effect img{position:relative;z-index:-1}.waves-notransition{transition:none!important}.waves-circle{-webkit-transform:translateZ(0);transform:translateZ(0);-webkit-mask-image:-webkit-radial-gradient(circle,#fff 100%,#000 0)}.waves-input-wrapper{border-radius:.2em;vertical-align:bottom}.waves-input-wrapper .waves-button-input{position:relative;top:0;left:0;z-index:1}.waves-circle{text-align:center;width:2.5em;height:2.5em;line-height:2.5em;border-radius:50%;-webkit-mask-image:none}.waves-block{display:block}.waves-effect .waves-ripple{z-index:-1}.modal{display:none;position:fixed;left:0;right:0;background-color:#fafafa;padding:0;max-height:70%;width:55%;margin:auto;overflow-y:auto;border-radius:2px;will-change:top,opacity}@media only screen and (max-width:992px){.modal{width:80%}}.modal h1,.modal h2,.modal h3,.modal h4{margin-top:0}.modal .modal-content{padding:24px}.modal .modal-close{cursor:pointer}.modal .modal-footer{border-radius:0 0 2px 2px;background-color:#fafafa;padding:4px 6px;height:56px;width:100%}.modal .modal-footer .btn,.modal .modal-footer .btn-flat,.modal .modal-footer .btn-large{float:right;margin:6px 0}.modal-overlay{position:fixed;z-index:999;top:-100px;left:0;bottom:0;right:0;height:125%;width:100%;background:#000;display:none;will-change:opacity}.modal.modal-fixed-footer{padding:0;height:70%}.modal.modal-fixed-footer .modal-content{position:absolute;height:calc(100% - 56px);max-height:100%;width:100%;overflow-y:auto}.modal.modal-fixed-footer .modal-footer{border-top:1px solid rgba(0,0,0,.1);position:absolute;bottom:0}.modal.bottom-sheet{top:auto;bottom:-100%;margin:0;width:100%;max-height:45%;border-radius:0;will-change:bottom,opacity}.collapsible{border-top:1px solid #ddd;border-right:1px solid #ddd;border-left:1px solid #ddd;margin:.5rem 0 1rem}.collapsible-header{display:block;cursor:pointer;min-height:3rem;line-height:3rem;padding:0 1rem;background-color:#fff;border-bottom:1px solid #ddd}.collapsible-header i{width:2rem;font-size:1.6rem;line-height:3rem;display:block;float:left;text-align:center;margin-right:1rem}.collapsible-body{display:none;border-bottom:1px solid #ddd;box-sizing:border-box}.collapsible-body p{margin:0;padding:2rem}.side-nav .collapsible,.side-nav.fixed .collapsible{border:none;box-shadow:none}.side-nav .collapsible li,.side-nav.fixed .collapsible li{padding:0}.side-nav .collapsible-header,.side-nav.fixed .collapsible-header{background-color:transparent;border:none;line-height:inherit;height:inherit;padding:0 16px}.side-nav .collapsible-header:hover,.side-nav.fixed .collapsible-header:hover{background-color:rgba(0,0,0,.05)}.side-nav .collapsible-header i,.side-nav.fixed .collapsible-header i{line-height:inherit}.side-nav .collapsible-body,.side-nav.fixed .collapsible-body{border:0;background-color:#fff}.side-nav .collapsible-body li a,.side-nav.fixed .collapsible-body li a{padding:0 23.5px 0 31px}.collapsible.popout{border:none;box-shadow:none}.collapsible.popout>li{box-shadow:0 2px 5px 0 rgba(0,0,0,.16),0 2px 10px 0 rgba(0,0,0,.12);margin:0 24px;transition:margin .35s cubic-bezier(.25,.46,.45,.94)}.collapsible.popout>li.active{box-shadow:0 5px 11px 0 rgba(0,0,0,.18),0 4px 15px 0 rgba(0,0,0,.15);margin:16px 0}.chip{display:inline-block;height:32px;font-size:13px;font-weight:500;color:rgba(0,0,0,.6);line-height:32px;padding:0 12px;border-radius:16px;background-color:#e4e4e4;margin-bottom:5px;margin-right:5px}.chip img{float:left;margin:0 8px 0 -12px;height:32px;width:32px;border-radius:50%}.chip .close{cursor:pointer;float:right;font-size:16px;line-height:32px;padding-left:8px}.chips{border:none;border-bottom:1px solid #9e9e9e;box-shadow:none;margin:0 0 20px;min-height:45px;outline:none;transition:all .3s}.chips.focus{border-bottom:1px solid #26a69a;box-shadow:0 1px 0 0 #26a69a}.chips:hover{cursor:text}.chips .chip.selected{background-color:#26a69a;color:#fff}.chips .input{background:none;border:0;color:rgba(0,0,0,.6);display:inline-block;font-size:1rem;height:3rem;line-height:32px;outline:0;margin:0;padding:0!important;width:120px!important}.chips .input:focus{border:0!important;box-shadow:none!important}.prefix~.chips{margin-left:3rem;width:92%;width:calc(100% - 3rem)}.chips:empty~label{font-size:.8rem;-webkit-transform:translateY(-140%);transform:translateY(-140%)}.materialboxed{display:block;cursor:-webkit-zoom-in;cursor:zoom-in;position:relative;transition:opacity .4s}.materialboxed:hover{will-change:left,top,width,height}.materialboxed:hover:not(.active){opacity:.8}.materialboxed.active{cursor:-webkit-zoom-out;cursor:zoom-out}#materialbox-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background-color:#292929;z-index:1000;will-change:opacity}.materialbox-caption{position:fixed;display:none;color:#fff;line-height:50px;bottom:0;width:100%;text-align:center;padding:0 15%;height:50px;z-index:1000;-webkit-font-smoothing:antialiased}select:focus{outline:1px solid #c9f3ef}button:focus{outline:none;background-color:#2ab7a9}label{font-size:.8rem;color:#9e9e9e}::-webkit-input-placeholder{color:#d1d1d1}:-moz-placeholder,::-moz-placeholder{color:#d1d1d1}:-ms-input-placeholder{color:#d1d1d1}input:not([type]),input[type=date],input[type=datetime-local],input[type=datetime],input[type=email],input[type=number],input[type=password],input[type=search],input[type=tel],input[type=text],input[type=time],input[type=url],textarea.materialize-textarea{background-color:transparent;border:none;border-bottom:1px solid #9e9e9e;border-radius:0;outline:none;height:3rem;width:100%;font-size:1rem;margin:0 0 20px;padding:0;box-shadow:none;box-sizing:content-box;transition:all .3s}input:not([type]):disabled,input:not([type])[readonly=readonly],input[type=date]:disabled,input[type=date][readonly=readonly],input[type=datetime-local]:disabled,input[type=datetime-local][readonly=readonly],input[type=datetime]:disabled,input[type=datetime][readonly=readonly],input[type=email]:disabled,input[type=email][readonly=readonly],input[type=number]:disabled,input[type=number][readonly=readonly],input[type=password]:disabled,input[type=password][readonly=readonly],input[type=search]:disabled,input[type=search][readonly=readonly],input[type=tel]:disabled,input[type=tel][readonly=readonly],input[type=text]:disabled,input[type=text][readonly=readonly],input[type=time]:disabled,input[type=time][readonly=readonly],input[type=url]:disabled,input[type=url][readonly=readonly],textarea.materialize-textarea:disabled,textarea.materialize-textarea[readonly=readonly]{color:rgba(0,0,0,.26);border-bottom:1px dotted rgba(0,0,0,.26)}input:not([type]):disabled+label,input:not([type])[readonly=readonly]+label,input[type=date]:disabled+label,input[type=date][readonly=readonly]+label,input[type=datetime-local]:disabled+label,input[type=datetime-local][readonly=readonly]+label,input[type=datetime]:disabled+label,input[type=datetime][readonly=readonly]+label,input[type=email]:disabled+label,input[type=email][readonly=readonly]+label,input[type=number]:disabled+label,input[type=number][readonly=readonly]+label,input[type=password]:disabled+label,input[type=password][readonly=readonly]+label,input[type=search]:disabled+label,input[type=search][readonly=readonly]+label,input[type=tel]:disabled+label,input[type=tel][readonly=readonly]+label,input[type=text]:disabled+label,input[type=text][readonly=readonly]+label,input[type=time]:disabled+label,input[type=time][readonly=readonly]+label,input[type=url]:disabled+label,input[type=url][readonly=readonly]+label,textarea.materialize-textarea:disabled+label,textarea.materialize-textarea[readonly=readonly]+label{color:rgba(0,0,0,.26)}input:not([type]):focus:not([readonly]),input[type=date]:focus:not([readonly]),input[type=datetime-local]:focus:not([readonly]),input[type=datetime]:focus:not([readonly]),input[type=email]:focus:not([readonly]),input[type=number]:focus:not([readonly]),input[type=password]:focus:not([readonly]),input[type=search]:focus:not([readonly]),input[type=tel]:focus:not([readonly]),input[type=text]:focus:not([readonly]),input[type=time]:focus:not([readonly]),input[type=url]:focus:not([readonly]),textarea.materialize-textarea:focus:not([readonly]){border-bottom:1px solid #26a69a;box-shadow:0 1px 0 0 #26a69a}input:not([type]):focus:not([readonly])+label,input[type=date]:focus:not([readonly])+label,input[type=datetime-local]:focus:not([readonly])+label,input[type=datetime]:focus:not([readonly])+label,input[type=email]:focus:not([readonly])+label,input[type=number]:focus:not([readonly])+label,input[type=password]:focus:not([readonly])+label,input[type=search]:focus:not([readonly])+label,input[type=tel]:focus:not([readonly])+label,input[type=text]:focus:not([readonly])+label,input[type=time]:focus:not([readonly])+label,input[type=url]:focus:not([readonly])+label,textarea.materialize-textarea:focus:not([readonly])+label{color:#26a69a}input:not([type]).valid,input:not([type]):focus.valid,input[type=date].valid,input[type=date]:focus.valid,input[type=datetime-local].valid,input[type=datetime-local]:focus.valid,input[type=datetime].valid,input[type=datetime]:focus.valid,input[type=email].valid,input[type=email]:focus.valid,input[type=number].valid,input[type=number]:focus.valid,input[type=password].valid,input[type=password]:focus.valid,input[type=search].valid,input[type=search]:focus.valid,input[type=tel].valid,input[type=tel]:focus.valid,input[type=text].valid,input[type=text]:focus.valid,input[type=time].valid,input[type=time]:focus.valid,input[type=url].valid,input[type=url]:focus.valid,textarea.materialize-textarea.valid,textarea.materialize-textarea:focus.valid{border-bottom:1px solid #4caf50;box-shadow:0 1px 0 0 #4caf50}input:not([type]).valid+label:after,input:not([type]):focus.valid+label:after,input[type=date].valid+label:after,input[type=date]:focus.valid+label:after,input[type=datetime-local].valid+label:after,input[type=datetime-local]:focus.valid+label:after,input[type=datetime].valid+label:after,input[type=datetime]:focus.valid+label:after,input[type=email].valid+label:after,input[type=email]:focus.valid+label:after,input[type=number].valid+label:after,input[type=number]:focus.valid+label:after,input[type=password].valid+label:after,input[type=password]:focus.valid+label:after,input[type=search].valid+label:after,input[type=search]:focus.valid+label:after,input[type=tel].valid+label:after,input[type=tel]:focus.valid+label:after,input[type=text].valid+label:after,input[type=text]:focus.valid+label:after,input[type=time].valid+label:after,input[type=time]:focus.valid+label:after,input[type=url].valid+label:after,input[type=url]:focus.valid+label:after,textarea.materialize-textarea.valid+label:after,textarea.materialize-textarea:focus.valid+label:after{content:attr(data-success);color:#4caf50;opacity:1}input:not([type]).invalid,input:not([type]):focus.invalid,input[type=date].invalid,input[type=date]:focus.invalid,input[type=datetime-local].invalid,input[type=datetime-local]:focus.invalid,input[type=datetime].invalid,input[type=datetime]:focus.invalid,input[type=email].invalid,input[type=email]:focus.invalid,input[type=number].invalid,input[type=number]:focus.invalid,input[type=password].invalid,input[type=password]:focus.invalid,input[type=search].invalid,input[type=search]:focus.invalid,input[type=tel].invalid,input[type=tel]:focus.invalid,input[type=text].invalid,input[type=text]:focus.invalid,input[type=time].invalid,input[type=time]:focus.invalid,input[type=url].invalid,input[type=url]:focus.invalid,textarea.materialize-textarea.invalid,textarea.materialize-textarea:focus.invalid{border-bottom:1px solid #f44336;box-shadow:0 1px 0 0 #f44336}input:not([type]).invalid+label:after,input:not([type]):focus.invalid+label:after,input[type=date].invalid+label:after,input[type=date]:focus.invalid+label:after,input[type=datetime-local].invalid+label:after,input[type=datetime-local]:focus.invalid+label:after,input[type=datetime].invalid+label:after,input[type=datetime]:focus.invalid+label:after,input[type=email].invalid+label:after,input[type=email]:focus.invalid+label:after,input[type=number].invalid+label:after,input[type=number]:focus.invalid+label:after,input[type=password].invalid+label:after,input[type=password]:focus.invalid+label:after,input[type=search].invalid+label:after,input[type=search]:focus.invalid+label:after,input[type=tel].invalid+label:after,input[type=tel]:focus.invalid+label:after,input[type=text].invalid+label:after,input[type=text]:focus.invalid+label:after,input[type=time].invalid+label:after,input[type=time]:focus.invalid+label:after,input[type=url].invalid+label:after,input[type=url]:focus.invalid+label:after,textarea.materialize-textarea.invalid+label:after,textarea.materialize-textarea:focus.invalid+label:after{content:attr(data-error);color:#f44336;opacity:1}input:not([type]).validate+label,input[type=date].validate+label,input[type=datetime-local].validate+label,input[type=datetime].validate+label,input[type=email].validate+label,input[type=number].validate+label,input[type=password].validate+label,input[type=search].validate+label,input[type=tel].validate+label,input[type=text].validate+label,input[type=time].validate+label,input[type=url].validate+label,textarea.materialize-textarea.validate+label{width:100%;pointer-events:none}input:not([type])+label:after,input[type=date]+label:after,input[type=datetime-local]+label:after,input[type=datetime]+label:after,input[type=email]+label:after,input[type=number]+label:after,input[type=password]+label:after,input[type=search]+label:after,input[type=tel]+label:after,input[type=text]+label:after,input[type=time]+label:after,input[type=url]+label:after,textarea.materialize-textarea+label:after{display:block;content:\"\";position:absolute;top:60px;opacity:0;transition:opacity .2s ease-out,color .2s ease-out}.input-field{position:relative;margin-top:1rem}.input-field.inline{display:inline-block;vertical-align:middle;margin-left:5px}.input-field.inline .select-dropdown,.input-field.inline input{margin-bottom:1rem}.input-field.col label{left:.75rem}.input-field.col .prefix~.validate~label,.input-field.col .prefix~label{width:calc(100% - 3rem - 1.5rem)}.input-field label{color:#9e9e9e;position:absolute;top:.8rem;left:0;font-size:1rem;cursor:text;transition:.2s ease-out}.input-field label.active{font-size:.8rem;-webkit-transform:translateY(-140%);transform:translateY(-140%)}.input-field .prefix{position:absolute;width:3rem;font-size:2rem;transition:color .2s}.input-field .prefix.active{color:#26a69a}.input-field .prefix~.autocomplete-content,.input-field .prefix~.validate~label,.input-field .prefix~input,.input-field .prefix~label,.input-field .prefix~textarea{margin-left:3rem;width:92%;width:calc(100% - 3rem)}.input-field .prefix~label{margin-left:3rem}@media only screen and (max-width:992px){.input-field .prefix~input{width:86%;width:calc(100% - 3rem)}}@media only screen and (max-width:600px){.input-field .prefix~input{width:80%;width:calc(100% - 3rem)}}.input-field input[type=search]{display:block;line-height:inherit;padding-left:4rem;width:calc(100% - 4rem)}.input-field input[type=search]:focus{background-color:#fff;border:0;box-shadow:none;color:#444}.input-field input[type=search]:focus+label i,.input-field input[type=search]:focus~.material-icons,.input-field input[type=search]:focus~.mdi-navigation-close{color:#444}.input-field input[type=search]+label{left:1rem}.input-field input[type=search]~.material-icons,.input-field input[type=search]~.mdi-navigation-close{position:absolute;top:0;right:1rem;color:transparent;cursor:pointer;font-size:2rem;transition:color .3s}textarea{width:100%;height:3rem;background-color:transparent}textarea.materialize-textarea{overflow-y:hidden;padding:.8rem 0 1.6rem;resize:none;min-height:3rem}.hiddendiv{display:none;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;padding-top:1.2rem}.autocomplete-content{margin-top:-15px;display:block;opacity:1;position:static}.autocomplete-content li .highlight{color:#444}.autocomplete-content li img{height:40px;width:40px;margin:5px 15px}[type=radio]:checked,[type=radio]:not(:checked){position:absolute;left:-9999px;opacity:0}[type=radio]:checked+label,[type=radio]:not(:checked)+label{position:relative;padding-left:35px;cursor:pointer;display:inline-block;height:25px;line-height:25px;font-size:1rem;transition:.28s ease;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}[type=radio]+label:after,[type=radio]+label:before{content:\"\";position:absolute;left:0;top:0;margin:4px;width:16px;height:16px;z-index:0;transition:.28s ease}[type=radio].with-gap:checked+label:after,[type=radio].with-gap:checked+label:before,[type=radio]:checked+label:after,[type=radio]:checked+label:before,[type=radio]:not(:checked)+label:after,[type=radio]:not(:checked)+label:before{border-radius:50%}[type=radio]:not(:checked)+label:after,[type=radio]:not(:checked)+label:before{border:2px solid #5a5a5a}[type=radio]:not(:checked)+label:after{-webkit-transform:scale(0);transform:scale(0)}[type=radio]:checked+label:before{border:2px solid transparent}[type=radio].with-gap:checked+label:after,[type=radio].with-gap:checked+label:before,[type=radio]:checked+label:after{border:2px solid #26a69a}[type=radio].with-gap:checked+label:after,[type=radio]:checked+label:after{background-color:#26a69a}[type=radio]:checked+label:after{-webkit-transform:scale(1.02);transform:scale(1.02)}[type=radio].with-gap:checked+label:after{-webkit-transform:scale(.5);transform:scale(.5)}[type=radio].tabbed:focus+label:before{box-shadow:0 0 0 10px rgba(0,0,0,.1)}[type=radio].with-gap:disabled:checked+label:before{border:2px solid rgba(0,0,0,.26)}[type=radio].with-gap:disabled:checked+label:after{border:none;background-color:rgba(0,0,0,.26)}[type=radio]:disabled:checked+label:before,[type=radio]:disabled:not(:checked)+label:before{background-color:transparent;border-color:rgba(0,0,0,.26)}[type=radio]:disabled+label{color:rgba(0,0,0,.26)}[type=radio]:disabled:not(:checked)+label:before{border-color:rgba(0,0,0,.26)}[type=radio]:disabled:checked+label:after{background-color:rgba(0,0,0,.26);border-color:#bdbdbd}form p{margin-bottom:10px;text-align:left}form p:last-child{margin-bottom:0}[type=checkbox]:checked,[type=checkbox]:not(:checked){position:absolute;left:-9999px;opacity:0}[type=checkbox]+label{position:relative;padding-left:35px;cursor:pointer;display:inline-block;height:25px;line-height:25px;font-size:1rem;-webkit-user-select:none;-moz-user-select:none;-khtml-user-select:none;-ms-user-select:none}[type=checkbox]+label:before,[type=checkbox]:not(.filled-in)+label:after{content:\"\";position:absolute;top:0;left:0;width:18px;height:18px;z-index:0;border:2px solid #5a5a5a;border-radius:1px;margin-top:2px;transition:.2s}[type=checkbox]:not(.filled-in)+label:after{border:0;-webkit-transform:scale(0);transform:scale(0)}[type=checkbox]:not(:checked):disabled+label:before{border:none;background-color:rgba(0,0,0,.26)}[type=checkbox].tabbed:focus+label:after{-webkit-transform:scale(1);transform:scale(1);border:0;border-radius:50%;box-shadow:0 0 0 10px rgba(0,0,0,.1);background-color:rgba(0,0,0,.1)}[type=checkbox]:checked+label:before{top:-4px;left:-5px;width:12px;height:22px;border-top:2px solid transparent;border-left:2px solid transparent;border-right:2px solid #26a69a;border-bottom:2px solid #26a69a;-webkit-transform:rotate(40deg);transform:rotate(40deg);-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-transform-origin:100% 100%;transform-origin:100% 100%}[type=checkbox]:checked:disabled+label:before{border-right:2px solid rgba(0,0,0,.26);border-bottom:2px solid rgba(0,0,0,.26)}[type=checkbox]:indeterminate+label:before{top:-11px;left:-12px;width:10px;height:22px;border-top:none;border-left:none;border-right:2px solid #26a69a;border-bottom:none;-webkit-transform:rotate(90deg);transform:rotate(90deg);-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-transform-origin:100% 100%;transform-origin:100% 100%}[type=checkbox]:indeterminate:disabled+label:before{border-right:2px solid rgba(0,0,0,.26);background-color:transparent}[type=checkbox].filled-in+label:after{border-radius:2px}[type=checkbox].filled-in+label:after,[type=checkbox].filled-in+label:before{content:\"\";left:0;position:absolute;transition:border .25s,background-color .25s,width .2s .1s,height .2s .1s,top .2s .1s,left .2s .1s;z-index:1}[type=checkbox].filled-in:not(:checked)+label:before{width:0;height:0;border:3px solid transparent;left:6px;top:10px;-webkit-transform:rotate(37deg);transform:rotate(37deg);-webkit-transform-origin:20% 40%;transform-origin:100% 100%}[type=checkbox].filled-in:not(:checked)+label:after{height:20px;width:20px;background-color:transparent;border:2px solid #5a5a5a;top:0;z-index:0}[type=checkbox].filled-in:checked+label:before{top:0;left:1px;width:8px;height:13px;border-top:2px solid transparent;border-left:2px solid transparent;border-right:2px solid #fff;border-bottom:2px solid #fff;-webkit-transform:rotate(37deg);transform:rotate(37deg);-webkit-transform-origin:100% 100%;transform-origin:100% 100%}[type=checkbox].filled-in:checked+label:after{top:0;width:20px;height:20px;border:2px solid #26a69a;background-color:#26a69a;z-index:0}[type=checkbox].filled-in.tabbed:focus+label:after{border-radius:2px;border-color:#5a5a5a;background-color:rgba(0,0,0,.1)}[type=checkbox].filled-in.tabbed:checked:focus+label:after{border-radius:2px;background-color:#26a69a;border-color:#26a69a}[type=checkbox].filled-in:disabled:not(:checked)+label:before{background-color:transparent;border:2px solid transparent}[type=checkbox].filled-in:disabled:not(:checked)+label:after{border-color:transparent;background-color:#bdbdbd}[type=checkbox].filled-in:disabled:checked+label:before{background-color:transparent}[type=checkbox].filled-in:disabled:checked+label:after{background-color:#bdbdbd;border-color:#bdbdbd}.switch,.switch *{-webkit-user-select:none;-moz-user-select:none;-khtml-user-select:none;-ms-user-select:none}.switch label{cursor:pointer}.switch label input[type=checkbox]{opacity:0;width:0;height:0}.switch label input[type=checkbox]:checked+.lever{background-color:#84c7c1}.switch label input[type=checkbox]:checked+.lever:after{background-color:#26a69a;left:24px}.switch label .lever{content:\"\";display:inline-block;position:relative;width:40px;height:15px;background-color:#818181;border-radius:15px;margin-right:10px;transition:background .3s ease;vertical-align:middle;margin:0 16px}.switch label .lever:after{content:\"\";position:absolute;display:inline-block;width:21px;height:21px;background-color:#f1f1f1;border-radius:21px;box-shadow:0 1px 3px 1px rgba(0,0,0,.4);left:-5px;top:-3px;transition:left .3s ease,background .3s ease,box-shadow .1s ease}input[type=checkbox]:checked:not(:disabled).tabbed:focus~.lever:after,input[type=checkbox]:checked:not(:disabled)~.lever:active:after{box-shadow:0 1px 3px 1px rgba(0,0,0,.4),0 0 0 15px rgba(38,166,154,.1)}input[type=checkbox]:not(:disabled).tabbed:focus~.lever:after,input[type=checkbox]:not(:disabled)~.lever:active:after{box-shadow:0 1px 3px 1px rgba(0,0,0,.4),0 0 0 15px rgba(0,0,0,.08)}.switch input[type=checkbox][disabled]+.lever{cursor:default}.switch label input[type=checkbox][disabled]+.lever:after,.switch label input[type=checkbox][disabled]:checked+.lever:after{background-color:#bdbdbd}select{display:none}select.browser-default{display:block}select{background-color:hsla(0,0%,100%,.9);width:100%;padding:5px;border:1px solid #f2f2f2;border-radius:2px;height:3rem}.select-label{position:absolute}.select-wrapper{position:relative}.select-wrapper input.select-dropdown{position:relative;cursor:pointer;background-color:transparent;border:none;border-bottom:1px solid #9e9e9e;outline:none;height:3rem;line-height:3rem;width:100%;font-size:1rem;margin:0 0 20px;padding:0;display:block}.select-wrapper span.caret{color:initial;position:absolute;right:0;top:0;bottom:0;height:10px;margin:auto 0;font-size:10px;line-height:10px}.select-wrapper span.caret.disabled{color:rgba(0,0,0,.26)}.select-wrapper+label{position:absolute;top:-14px;font-size:.8rem}select:disabled{color:rgba(0,0,0,.3)}.select-wrapper input.select-dropdown:disabled{color:rgba(0,0,0,.3);cursor:default;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;border-bottom:1px solid rgba(0,0,0,.3)}.select-wrapper i{color:rgba(0,0,0,.3)}.select-dropdown li.disabled,.select-dropdown li.disabled>span,.select-dropdown li.optgroup{color:rgba(0,0,0,.3);background-color:transparent}.prefix~.select-wrapper{margin-left:3rem;width:92%;width:calc(100% - 3rem)}.prefix~label{margin-left:3rem}.select-dropdown li img{height:40px;width:40px;margin:5px 15px;float:right}.select-dropdown li.optgroup{border-top:1px solid #eee}.select-dropdown li.optgroup.selected>span{color:rgba(0,0,0,.7)}.select-dropdown li.optgroup>span{color:rgba(0,0,0,.4)}.select-dropdown li.optgroup~li.optgroup-option{padding-left:1rem}.file-field{position:relative}.file-field .file-path-wrapper{overflow:hidden;padding-left:10px}.file-field input.file-path{width:100%}.file-field .btn,.file-field .btn-large{float:left;height:3rem;line-height:3rem}.file-field span{cursor:pointer}.file-field input[type=file]{position:absolute;top:0;right:0;left:0;bottom:0;width:100%;margin:0;padding:0;font-size:20px;cursor:pointer;opacity:0;filter:alpha(opacity=0)}.range-field{position:relative}input[type=range],input[type=range]+.thumb{cursor:pointer}input[type=range]{position:relative;background-color:transparent;border:none;outline:none;width:100%;margin:15px 0;padding:0}input[type=range]:focus{outline:none}input[type=range]+.thumb{position:absolute;border:none;height:0;width:0;border-radius:50%;background-color:#26a69a;top:10px;margin-left:-6px;-webkit-transform-origin:50% 50%;transform-origin:50% 50%;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}input[type=range]+.thumb .value{display:block;width:30px;text-align:center;color:#26a69a;font-size:0;-webkit-transform:rotate(45deg);transform:rotate(45deg)}input[type=range]+.thumb.active{border-radius:50% 50% 50% 0}input[type=range]+.thumb.active .value{color:#fff;margin-left:-1px;margin-top:8px;font-size:10px}input[type=range]{-webkit-appearance:none}input[type=range]::-webkit-slider-runnable-track{height:3px;background:#c2c0c2;border:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;border:none;height:14px;width:14px;border-radius:50%;background-color:#26a69a;-webkit-transform-origin:50% 50%;transform-origin:50% 50%;margin:-5px 0 0;transition:.3s}input[type=range]:focus::-webkit-slider-runnable-track{background:#ccc}input[type=range]{border:1px solid #fff}input[type=range]::-moz-range-track{height:3px;background:#ddd;border:none}input[type=range]::-moz-range-thumb{border:none;height:14px;width:14px;border-radius:50%;background:#26a69a;margin-top:-5px}input[type=range]:-moz-focusring{outline:1px solid #fff;outline-offset:-1px}input[type=range]:focus::-moz-range-track{background:#ccc}input[type=range]::-ms-track{height:3px;background:transparent;border-color:transparent;border-width:6px 0;color:transparent}input[type=range]::-ms-fill-lower{background:#777}input[type=range]::-ms-fill-upper{background:#ddd}input[type=range]::-ms-thumb{border:none;height:14px;width:14px;border-radius:50%;background:#26a69a}input[type=range]:focus::-ms-fill-lower{background:#888}input[type=range]:focus::-ms-fill-upper{background:#ccc}.table-of-contents.fixed{position:fixed}.table-of-contents li{padding:2px 0}.table-of-contents a{font-weight:300;color:#757575;padding-left:20px;height:1.5rem;line-height:1.5rem;letter-spacing:.4;display:inline-block}.table-of-contents a:hover{color:#a8a8a8;padding-left:19px;border-left:1px solid #ea4a4f}.table-of-contents a.active{font-weight:500;padding-left:18px;border-left:2px solid #ea4a4f}.side-nav{position:fixed;width:300px;left:0;top:0;margin:0;-webkit-transform:translateX(-100%);transform:translateX(-100%);height:calc(100% + 60px);height:100%;padding-bottom:60px;background-color:#fff;z-index:999;overflow-y:auto;will-change:transform;-webkit-backface-visibility:hidden;backface-visibility:hidden;-webkit-transform:translateX(-105%);transform:translateX(-105%)}.side-nav.right-aligned{right:0;-webkit-transform:translateX(105%);transform:translateX(105%);left:auto;-webkit-transform:translateX(100%);transform:translateX(100%)}.side-nav .collapsible{margin:0}.side-nav li{float:none;line-height:48px}.side-nav li.active{background-color:rgba(0,0,0,.05)}.side-nav a{color:rgba(0,0,0,.87);display:block;font-size:14px;font-weight:500;height:48px;line-height:48px;padding:0 32px}.side-nav a:hover{background-color:rgba(0,0,0,.05)}.side-nav a.btn,.side-nav a.btn-flat,.side-nav a.btn-floating,.side-nav a.btn-large{margin:10px 15px}.side-nav a.btn,.side-nav a.btn-floating,.side-nav a.btn-large{color:#fff}.side-nav a.btn-flat{color:#343434}.side-nav a.btn-large:hover,.side-nav a.btn:hover{background-color:#2bbbad}.side-nav a.btn-floating:hover{background-color:#26a69a}.side-nav li>a>[class*=mdi-],.side-nav li>a>[class^=mdi-],.side-nav li>a>i,.side-nav li>a>i.material-icons{float:left;height:48px;line-height:48px;margin:0 32px 0 0;width:24px;color:rgba(0,0,0,.54)}.side-nav .divider{margin:8px 0 0}.side-nav .subheader{cursor:auto;pointer-events:none;color:rgba(0,0,0,.54);font-size:14px;font-weight:500;line-height:48px}.side-nav .subheader:hover{background-color:transparent}.side-nav .userView{position:relative;padding:32px 32px 0;margin-bottom:8px}.side-nav .userView>a{height:auto;padding:0}.side-nav .userView>a:hover{background-color:transparent}.side-nav .userView .background{overflow:hidden;position:absolute;top:0;right:0;bottom:0;left:0;z-index:-1}.side-nav .userView .circle,.side-nav .userView .email,.side-nav .userView .name{display:block}.side-nav .userView .circle{height:64px;width:64px}.side-nav .userView .email,.side-nav .userView .name{font-size:14px;line-height:24px}.side-nav .userView .name{margin-top:16px;font-weight:500}.side-nav .userView .email{padding-bottom:16px;font-weight:400}.drag-target{height:100%;width:10px;position:fixed;top:0;z-index:998}.side-nav.fixed{left:0;-webkit-transform:translateX(0);transform:translateX(0);position:fixed}.side-nav.fixed.right-aligned{right:0;left:auto}@media only screen and (max-width:992px){.side-nav.fixed{-webkit-transform:translateX(-105%);transform:translateX(-105%)}.side-nav.fixed.right-aligned{-webkit-transform:translateX(105%);transform:translateX(105%)}.side-nav a{padding:0 16px}.side-nav .userView{padding:16px 16px 0}}.side-nav .collapsible-body>ul:not(.collapsible)>li.active,.side-nav.fixed .collapsible-body>ul:not(.collapsible)>li.active{background-color:#ee6e73}.side-nav .collapsible-body>ul:not(.collapsible)>li.active a,.side-nav.fixed .collapsible-body>ul:not(.collapsible)>li.active a{color:#fff}#sidenav-overlay{position:fixed;top:0;left:0;right:0;height:120vh;background-color:rgba(0,0,0,.5);z-index:997;will-change:opacity}.preloader-wrapper{display:inline-block;position:relative;width:48px;height:48px}.preloader-wrapper.small{width:36px;height:36px}.preloader-wrapper.big{width:64px;height:64px}.preloader-wrapper.active{-webkit-animation:container-rotate 1568ms linear infinite;animation:container-rotate 1568ms linear infinite}@-webkit-keyframes container-rotate{to{-webkit-transform:rotate(1turn)}}@keyframes container-rotate{to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}.spinner-layer{position:absolute;width:100%;height:100%;opacity:0;border-color:#26a69a}.spinner-blue,.spinner-blue-only{border-color:#4285f4}.spinner-red,.spinner-red-only{border-color:#db4437}.spinner-yellow,.spinner-yellow-only{border-color:#f4b400}.spinner-green,.spinner-green-only{border-color:#0f9d58}.active .spinner-layer.spinner-blue{-webkit-animation:fill-unfill-rotate 5332ms cubic-bezier(.4,0,.2,1) infinite both,blue-fade-in-out 5332ms cubic-bezier(.4,0,.2,1) infinite both;animation:fill-unfill-rotate 5332ms cubic-bezier(.4,0,.2,1) infinite both,blue-fade-in-out 5332ms cubic-bezier(.4,0,.2,1) infinite both}.active .spinner-layer.spinner-red{-webkit-animation:fill-unfill-rotate 5332ms cubic-bezier(.4,0,.2,1) infinite both,red-fade-in-out 5332ms cubic-bezier(.4,0,.2,1) infinite both;animation:fill-unfill-rotate 5332ms cubic-bezier(.4,0,.2,1) infinite both,red-fade-in-out 5332ms cubic-bezier(.4,0,.2,1) infinite both}.active .spinner-layer.spinner-yellow{-webkit-animation:fill-unfill-rotate 5332ms cubic-bezier(.4,0,.2,1) infinite both,yellow-fade-in-out 5332ms cubic-bezier(.4,0,.2,1) infinite both;animation:fill-unfill-rotate 5332ms cubic-bezier(.4,0,.2,1) infinite both,yellow-fade-in-out 5332ms cubic-bezier(.4,0,.2,1) infinite both}.active .spinner-layer.spinner-green{-webkit-animation:fill-unfill-rotate 5332ms cubic-bezier(.4,0,.2,1) infinite both,green-fade-in-out 5332ms cubic-bezier(.4,0,.2,1) infinite both;animation:fill-unfill-rotate 5332ms cubic-bezier(.4,0,.2,1) infinite both,green-fade-in-out 5332ms cubic-bezier(.4,0,.2,1) infinite both}.active .spinner-layer,.active .spinner-layer.spinner-blue-only,.active .spinner-layer.spinner-green-only,.active .spinner-layer.spinner-red-only,.active .spinner-layer.spinner-yellow-only{opacity:1;-webkit-animation:fill-unfill-rotate 5332ms cubic-bezier(.4,0,.2,1) infinite both;animation:fill-unfill-rotate 5332ms cubic-bezier(.4,0,.2,1) infinite both}@-webkit-keyframes fill-unfill-rotate{12.5%{-webkit-transform:rotate(135deg)}25%{-webkit-transform:rotate(270deg)}37.5%{-webkit-transform:rotate(405deg)}50%{-webkit-transform:rotate(540deg)}62.5%{-webkit-transform:rotate(675deg)}75%{-webkit-transform:rotate(810deg)}87.5%{-webkit-transform:rotate(945deg)}to{-webkit-transform:rotate(3turn)}}@keyframes fill-unfill-rotate{12.5%{-webkit-transform:rotate(135deg);transform:rotate(135deg)}25%{-webkit-transform:rotate(270deg);transform:rotate(270deg)}37.5%{-webkit-transform:rotate(405deg);transform:rotate(405deg)}50%{-webkit-transform:rotate(540deg);transform:rotate(540deg)}62.5%{-webkit-transform:rotate(675deg);transform:rotate(675deg)}75%{-webkit-transform:rotate(810deg);transform:rotate(810deg)}87.5%{-webkit-transform:rotate(945deg);transform:rotate(945deg)}to{-webkit-transform:rotate(3turn);transform:rotate(3turn)}}@-webkit-keyframes blue-fade-in-out{0%{opacity:1}25%{opacity:1}26%{opacity:0}89%{opacity:0}90%{opacity:1}to{opacity:1}}@keyframes blue-fade-in-out{0%{opacity:1}25%{opacity:1}26%{opacity:0}89%{opacity:0}90%{opacity:1}to{opacity:1}}@-webkit-keyframes red-fade-in-out{0%{opacity:0}15%{opacity:0}25%{opacity:1}50%{opacity:1}51%{opacity:0}}@keyframes red-fade-in-out{0%{opacity:0}15%{opacity:0}25%{opacity:1}50%{opacity:1}51%{opacity:0}}@-webkit-keyframes yellow-fade-in-out{0%{opacity:0}40%{opacity:0}50%{opacity:1}75%{opacity:1}76%{opacity:0}}@keyframes yellow-fade-in-out{0%{opacity:0}40%{opacity:0}50%{opacity:1}75%{opacity:1}76%{opacity:0}}@-webkit-keyframes green-fade-in-out{0%{opacity:0}65%{opacity:0}75%{opacity:1}90%{opacity:1}to{opacity:0}}@keyframes green-fade-in-out{0%{opacity:0}65%{opacity:0}75%{opacity:1}90%{opacity:1}to{opacity:0}}.gap-patch{position:absolute;top:0;left:45%;width:10%;height:100%;overflow:hidden;border-color:inherit}.gap-patch .circle{width:1000%;left:-450%}.circle-clipper{display:inline-block;position:relative;width:50%;height:100%;overflow:hidden;border-color:inherit}.circle-clipper .circle{width:200%;height:100%;border-width:3px;border-style:solid;border-color:inherit;border-bottom-color:transparent!important;border-radius:50%;-webkit-animation:none;animation:none;position:absolute;top:0;right:0;bottom:0}.circle-clipper.left .circle{left:0;border-right-color:transparent!important;-webkit-transform:rotate(129deg);transform:rotate(129deg)}.circle-clipper.right .circle{left:-100%;border-left-color:transparent!important;-webkit-transform:rotate(-129deg);transform:rotate(-129deg)}.active .circle-clipper.left .circle{-webkit-animation:left-spin 1333ms cubic-bezier(.4,0,.2,1) infinite both;animation:left-spin 1333ms cubic-bezier(.4,0,.2,1) infinite both}.active .circle-clipper.right .circle{-webkit-animation:right-spin 1333ms cubic-bezier(.4,0,.2,1) infinite both;animation:right-spin 1333ms cubic-bezier(.4,0,.2,1) infinite both}@-webkit-keyframes left-spin{0%{-webkit-transform:rotate(130deg)}50%{-webkit-transform:rotate(-5deg)}to{-webkit-transform:rotate(130deg)}}@keyframes left-spin{0%{-webkit-transform:rotate(130deg);transform:rotate(130deg)}50%{-webkit-transform:rotate(-5deg);transform:rotate(-5deg)}to{-webkit-transform:rotate(130deg);transform:rotate(130deg)}}@-webkit-keyframes right-spin{0%{-webkit-transform:rotate(-130deg)}50%{-webkit-transform:rotate(5deg)}to{-webkit-transform:rotate(-130deg)}}@keyframes right-spin{0%{-webkit-transform:rotate(-130deg);transform:rotate(-130deg)}50%{-webkit-transform:rotate(5deg);transform:rotate(5deg)}to{-webkit-transform:rotate(-130deg);transform:rotate(-130deg)}}#spinnerContainer.cooldown{-webkit-animation:container-rotate 1568ms linear infinite,fade-out .4s cubic-bezier(.4,0,.2,1);animation:container-rotate 1568ms linear infinite,fade-out .4s cubic-bezier(.4,0,.2,1)}@-webkit-keyframes fade-out{0%{opacity:1}to{opacity:0}}@keyframes fade-out{0%{opacity:1}to{opacity:0}}.slider{position:relative;height:400px;width:100%}.slider.fullscreen{height:100%;width:100%;position:absolute;top:0;left:0;right:0;bottom:0}.slider.fullscreen ul.slides{height:100%}.slider.fullscreen ul.indicators{z-index:2;bottom:30px}.slider .slides{background-color:#9e9e9e;margin:0;height:400px}.slider .slides li{opacity:0;position:absolute;top:0;left:0;z-index:1;width:100%;height:inherit;overflow:hidden}.slider .slides li img{height:100%;width:100%;background-size:cover;background-position:50%}.slider .slides li .caption{color:#fff;position:absolute;top:15%;left:15%;width:70%;opacity:0}.slider .slides li .caption p{color:#e0e0e0}.slider .slides li.active{z-index:2}.slider .indicators{position:absolute;text-align:center;left:0;right:0;bottom:0;margin:0}.slider .indicators .indicator-item{display:inline-block;position:relative;cursor:pointer;height:16px;width:16px;margin:0 12px;background-color:#e0e0e0;transition:background-color .3s;border-radius:50%}.slider .indicators .indicator-item.active{background-color:#4caf50}.carousel{overflow:hidden;position:relative;width:100%;height:400px;-webkit-perspective:500px;perspective:500px;-webkit-transform-style:preserve-3d;transform-style:preserve-3d;-webkit-transform-origin:0 50%;transform-origin:0 50%}.carousel.carousel-slider{top:0;left:0;height:0}.carousel.carousel-slider .carousel-fixed-item{position:absolute;left:0;right:0;bottom:20px;z-index:1}.carousel.carousel-slider .carousel-fixed-item.with-indicators{bottom:68px}.carousel.carousel-slider .carousel-item{width:100%;height:100%;min-height:400px;position:absolute;top:0;left:0}.carousel.carousel-slider .carousel-item h2{font-size:24px;font-weight:500;line-height:32px}.carousel.carousel-slider .carousel-item p{font-size:15px}.carousel .carousel-item{display:none;width:200px;height:400px;position:absolute;top:0;left:0}.carousel .carousel-item img{width:100%}.carousel .indicators{position:absolute;text-align:center;left:0;right:0;bottom:0;margin:0}.carousel .indicators .indicator-item{display:inline-block;position:relative;cursor:pointer;height:8px;width:8px;margin:24px 4px;background-color:hsla(0,0%,100%,.5);transition:background-color .3s;border-radius:50%}.carousel .indicators .indicator-item.active{background-color:#fff}.picker{font-size:16px;text-align:left;line-height:1.2;color:#000;position:absolute;z-index:10000;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.picker__input{cursor:default}.picker__input.picker__input--active{border-color:#0089ec}.picker__holder{width:100%;overflow-y:auto;-webkit-overflow-scrolling:touch}\r\n\r\n/*!\r\n * Default mobile-first, responsive styling for pickadate.js\r\n * Demo: http://amsul.github.io/pickadate.js\r\n */.picker__frame,.picker__holder{bottom:0;left:0;right:0;top:100%}.picker__holder{position:fixed;transition:background .15s ease-out,top 0s .15s;-webkit-backface-visibility:hidden}.picker__frame{position:absolute;min-width:256px;width:300px;max-height:350px;-ms-filter:\"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)\";filter:alpha(opacity=0);-moz-opacity:0;opacity:0;transition:all .15s ease-out}@media (min-height:28.875em){.picker__frame{overflow:visible;top:auto;bottom:-100%;max-height:80%}}@media (min-height:40.125em){.picker__frame{margin-bottom:7.5%}}.picker__wrap{display:table;width:100%;height:100%}@media (min-height:28.875em){.picker__wrap{display:block}}.picker__box{background:#fff;display:table-cell;vertical-align:middle}@media (min-height:28.875em){.picker__box{display:block;border:1px solid #777;border-top-color:#898989;border-bottom-width:0;border-radius:5px 5px 0 0;box-shadow:0 12px 36px 16px rgba(0,0,0,.24)}}.picker--opened .picker__holder{top:0;background:transparent;-ms-filter:\"progid:DXImageTransform.Microsoft.gradient(startColorstr=#1E000000,endColorstr=#1E000000)\";zoom:1;background:rgba(0,0,0,.32);transition:background .15s ease-out}.picker--opened .picker__frame{top:0;-ms-filter:\"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)\";filter:alpha(opacity=100);-moz-opacity:1;opacity:1}@media (min-height:35.875em){.picker--opened .picker__frame{top:10%;bottom:auto}}.picker__input.picker__input--active{border-color:#e3f2fd}.picker__frame{margin:0 auto;max-width:325px}@media (min-height:38.875em){.picker--opened .picker__frame{top:10%;bottom:auto}}.picker__box{padding:0 1em}.picker__header{text-align:center;position:relative;margin-top:.75em}.picker__month,.picker__year{display:inline-block;margin-left:.25em;margin-right:.25em}.picker__select--month,.picker__select--year{height:2em;padding:0;margin-left:.25em;margin-right:.25em}.picker__select--month.browser-default{display:inline;background-color:#fff;width:40%}.picker__select--year.browser-default{display:inline;background-color:#fff;width:26%}.picker__select--month:focus,.picker__select--year:focus{border-color:rgba(0,0,0,.05)}.picker__nav--next,.picker__nav--prev{position:absolute;padding:.5em 1.25em;width:1em;height:1em;box-sizing:content-box;top:-.25em}.picker__nav--prev{left:-1em;padding-right:1.25em}.picker__nav--next{right:-1em;padding-left:1.25em}.picker__nav--disabled,.picker__nav--disabled:before,.picker__nav--disabled:before:hover,.picker__nav--disabled:hover{cursor:default;background:none;border-right-color:#f5f5f5;border-left-color:#f5f5f5}.picker__table{border-collapse:collapse;border-spacing:0;table-layout:fixed;font-size:1rem;width:100%;margin-top:.75em}.picker__table,.picker__table td,.picker__table th{text-align:center}.picker__table td{margin:0;padding:0}.picker__weekday{width:14.285714286%;font-size:.75em;padding-bottom:.25em;color:#999;font-weight:500}@media (min-height:33.875em){.picker__weekday{padding-bottom:.5em}}.picker__day--today{position:relative;color:#595959;letter-spacing:-.3;padding:.75rem 0;font-weight:400;border:1px solid transparent}.picker__day--disabled:before{border-top-color:#aaa}.picker__day--infocus:hover{cursor:pointer;color:#000;font-weight:500}.picker__day--outfocus{display:none;padding:.75rem 0;color:#fff}.picker__day--outfocus:hover{cursor:pointer;color:#ddd;font-weight:500}.picker--focused .picker__day--highlighted,.picker__day--highlighted:hover{cursor:pointer}.picker--focused .picker__day--selected,.picker__day--selected,.picker__day--selected:hover{-webkit-transform:scale(.75);transform:scale(.75);background:#0089ec}.picker--focused .picker__day--disabled,.picker__day--disabled,.picker__day--disabled:hover{background:#f5f5f5;border-color:#f5f5f5;color:#ddd;cursor:default}.picker__day--highlighted.picker__day--disabled,.picker__day--highlighted.picker__day--disabled:hover{background:#bbb}.picker__footer{text-align:center;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-justify-content:space-between;-ms-flex-pack:justify;justify-content:space-between}.picker__button--clear,.picker__button--close,.picker__button--today{border:1px solid #fff;background:#fff;font-size:.8em;padding:.66em 0;font-weight:700;width:33%;display:inline-block;vertical-align:bottom}.picker__button--clear:hover,.picker__button--close:hover,.picker__button--today:hover{cursor:pointer;color:#000;background:#b1dcfb;border-bottom-color:#b1dcfb}.picker__button--clear:focus,.picker__button--close:focus,.picker__button--today:focus{background:#b1dcfb;border-color:rgba(0,0,0,.05);outline:none}.picker__button--clear:before,.picker__button--close:before,.picker__button--today:before{position:relative;display:inline-block;height:0}.picker__button--clear:before,.picker__button--today:before{content:\" \";margin-right:.45em}.picker__button--today:before{top:-.05em;width:0;border-top:.66em solid #0059bc;border-left:.66em solid transparent}.picker__button--clear:before{top:-.25em;width:.66em;border-top:3px solid #e20}.picker__button--close:before{content:\"\\D7\";top:-.1em;vertical-align:top;font-size:1.1em;margin-right:.35em;color:#777}.picker__button--today[disabled],.picker__button--today[disabled]:hover{background:#f5f5f5;border-color:#f5f5f5;color:#ddd;cursor:default}.picker__button--today[disabled]:before{border-top-color:#aaa}.picker__box{border-radius:2px;overflow:hidden}.picker__date-display{text-align:center;background-color:#26a69a;color:#fff;padding-bottom:15px;font-weight:300}.picker__nav--next:hover,.picker__nav--prev:hover{cursor:pointer;color:#000;background:#a1ded8}.picker__weekday-display{background-color:#1f897f;padding:10px;font-weight:200;letter-spacing:.5;font-size:1rem;margin-bottom:15px}.picker__month-display{text-transform:uppercase;font-size:2rem}.picker__day-display{font-size:4.5rem;font-weight:400}.picker__year-display{font-size:1.8rem;color:hsla(0,0%,100%,.4)}.picker__box{padding:0}.picker__calendar-container{padding:0 1rem}.picker__calendar-container thead{border:none}.picker__table{margin-top:0;margin-bottom:.5em}.picker__day--infocus{color:#595959;letter-spacing:-.3;padding:.75rem 0;font-weight:400;border:1px solid transparent}.picker__day.picker__day--today{color:#26a69a}.picker__day.picker__day--today.picker__day--selected{color:#fff}.picker__weekday{font-size:.9rem}.picker--focused .picker__day--selected,.picker__day--selected,.picker__day--selected:hover{border-radius:50%;-webkit-transform:scale(.9);transform:scale(.9);background-color:#26a69a;color:#fff}.picker--focused .picker__day--selected.picker__day--outfocus,.picker__day--selected.picker__day--outfocus,.picker__day--selected:hover.picker__day--outfocus{background-color:#a1ded8}.picker__footer{text-align:right;padding:5px 10px}.picker__close,.picker__today{font-size:1.1rem;padding:0 1rem;color:#26a69a}.picker__nav--next:before,.picker__nav--prev:before{content:\" \";border-top:.5em solid transparent;border-bottom:.5em solid transparent;border-right:.75em solid #676767;width:0;height:0;display:block;margin:0 auto}.picker__nav--next:before{border-right:0;border-left:.75em solid #676767}button.picker__clear:focus,button.picker__close:focus,button.picker__today:focus{background-color:#a1ded8}.picker__list{list-style:none;padding:.75em 0 4.2em;margin:0}.picker__list-item{border-bottom:1px solid #ddd;border-top:1px solid #ddd;margin-bottom:-1px;position:relative;background:#fff;padding:.75em 1.25em}@media (min-height:46.75em){.picker__list-item{padding:.5em 1em}}.picker__list-item:hover{cursor:pointer;color:#000;background:#b1dcfb}.picker__list-item--highlighted,.picker__list-item:hover{border-color:#0089ec;z-index:10}.picker--focused .picker__list-item--highlighted,.picker__list-item--highlighted:hover{cursor:pointer;color:#000;background:#b1dcfb}.picker--focused .picker__list-item--selected,.picker__list-item--selected,.picker__list-item--selected:hover{background:#0089ec;color:#fff;z-index:10}.picker--focused .picker__list-item--disabled,.picker__list-item--disabled,.picker__list-item--disabled:hover{background:#f5f5f5;border-color:#f5f5f5;color:#ddd;cursor:default;border-color:#ddd;z-index:auto}.picker--time .picker__button--clear{display:block;width:80%;margin:1em auto 0;padding:1em 1.25em;background:none;border:0;font-weight:500;font-size:.67em;text-align:center;text-transform:uppercase;color:#666}.picker--time .picker__button--clear:focus,.picker--time .picker__button--clear:hover{color:#000;background:#b1dcfb;background:#e20;border-color:#e20;cursor:pointer;color:#fff;outline:none}.picker--time .picker__button--clear:before{top:-.25em;color:#666;font-size:1.25em;font-weight:700}.picker--time .picker__button--clear:focus:before,.picker--time .picker__button--clear:hover:before{color:#fff}.picker--time .picker__frame{min-width:256px;max-width:320px}.picker--time .picker__box{font-size:1em;background:#f2f2f2;padding:0}@media (min-height:40.125em){.picker--time .picker__box{margin-bottom:5em}}", ""]);

// exports


/***/ }),

/***/ 238:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(78)();
// imports


// module
exports.push([module.i, ".InputRange-slider{-webkit-appearance:none;-moz-appearance:none;appearance:none;background:#3f51b5;border:1px solid #3f51b5;border-radius:100%;cursor:pointer;display:block;height:1rem;margin-left:-.5rem;margin-top:-.65rem;outline:none;position:absolute;top:50%;transition:-webkit-transform .3s ease-out,box-shadow .3s ease-out;transition:transform .3s ease-out,box-shadow .3s ease-out;width:1rem}.InputRange-slider:active{-webkit-transform:scale(1.3);transform:scale(1.3)}.InputRange-slider:focus{box-shadow:0 0 0 5px rgba(63,81,181,.2)}.InputRange.is-disabled .InputRange-slider{background:#ccc;border:1px solid #ccc;box-shadow:none;-webkit-transform:none;transform:none}.InputRange-sliderContainer{transition:left .3s ease-out}.InputRange-label{color:#aaa;font-family:Helvetica Neue,san-serif;font-size:.8rem;white-space:nowrap}.InputRange-label--max,.InputRange-label--min{bottom:-1.4rem;position:absolute}.InputRange-label--min{left:0}.InputRange-label--max{right:0}.InputRange-label--value{position:absolute;top:-1.8rem}.InputRange-labelContainer{left:-50%;position:relative}.InputRange-label--max .InputRange-labelContainer{left:50%}.InputRange-track{background:#eee;border-radius:.3rem;cursor:pointer;display:block;height:.3rem;position:relative;transition:left .3s ease-out,width .3s ease-out}.InputRange.is-disabled .InputRange-track{background:#eee}.InputRange-track--container{left:0;margin-top:-.15rem;position:absolute;right:0;top:50%}.InputRange-track--active{background:#3f51b5}.InputRange{height:1rem;position:relative;width:100%}", ""]);

// exports


/***/ }),

/***/ 239:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(78)();
// imports


// module
exports.push([module.i, ".input-field label{left:0}.range-slider{margin:65px 0 30px}.range-slider label{top:-37px}label{color:#fff!important}.pagination li>a{cursor:pointer}.pagination{margin-bottom:5px}a.secondary-content{position:relative!important;flex:1;text-align:right;top:0!important;right:0!important}.secondary-content .material-icons{font-size:36px}.artist-detail .header{display:flex;justify-content:space-between}.flex{display:flex;justify-content:space-around}.wrap{flex-wrap:wrap}.album img{width:250px!important}.has-error{color:red}.spacer a{margin:0 10px;cursor:pointer}li.collection-item.avatar{display:flex;align-items:center;padding-left:10px!important}li.collection-item.avatar img{position:relative!important;left:0!important;margin:0 10px!important}.retired{background-color:#ddd!important}.select{font-size:1rem}select{display:block!important;margin-bottom:10px;height:30px;color:#000}", ""]);

// exports


/***/ }),

/***/ 26:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony export (immutable) */ __webpack_exports__["a"] = isReactChildren;
/* harmony export (immutable) */ __webpack_exports__["c"] = createRouteFromReactElement;
/* unused harmony export createRoutesFromReactChildren */
/* harmony export (immutable) */ __webpack_exports__["b"] = createRoutes;
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };



function isValidChild(object) {
  return object == null || __WEBPACK_IMPORTED_MODULE_0_react___default.a.isValidElement(object);
}

function isReactChildren(object) {
  return isValidChild(object) || Array.isArray(object) && object.every(isValidChild);
}

function createRoute(defaultProps, props) {
  return _extends({}, defaultProps, props);
}

function createRouteFromReactElement(element) {
  var type = element.type;
  var route = createRoute(type.defaultProps, element.props);

  if (route.children) {
    var childRoutes = createRoutesFromReactChildren(route.children, route);

    if (childRoutes.length) route.childRoutes = childRoutes;

    delete route.children;
  }

  return route;
}

/**
 * Creates and returns a routes object from the given ReactChildren. JSX
 * provides a convenient way to visualize how routes in the hierarchy are
 * nested.
 *
 *   import { Route, createRoutesFromReactChildren } from 'react-router'
 *
 *   const routes = createRoutesFromReactChildren(
 *     <Route component={App}>
 *       <Route path="home" component={Dashboard}/>
 *       <Route path="news" component={NewsFeed}/>
 *     </Route>
 *   )
 *
 * Note: This method is automatically used when you provide <Route> children
 * to a <Router> component.
 */
function createRoutesFromReactChildren(children, parentRoute) {
  var routes = [];

  __WEBPACK_IMPORTED_MODULE_0_react___default.a.Children.forEach(children, function (element) {
    if (__WEBPACK_IMPORTED_MODULE_0_react___default.a.isValidElement(element)) {
      // Component classes may have a static create* method.
      if (element.type.createRouteFromReactElement) {
        var route = element.type.createRouteFromReactElement(element, parentRoute);

        if (route) routes.push(route);
      } else {
        routes.push(createRouteFromReactElement(element));
      }
    }
  });

  return routes;
}

/**
 * Creates and returns an array of routes from the given object which
 * may be a JSX route, a plain object route, or an array of either.
 */
function createRoutes(routes) {
  if (isReactChildren(routes)) {
    routes = createRoutesFromReactChildren(routes);
  } else if (routes && !Array.isArray(routes)) {
    routes = [routes];
  }

  return routes;
}

/***/ }),

/***/ 27:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */



/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = function() {};

if (true) {
  warning = function(condition, format, args) {
    var len = arguments.length;
    args = new Array(len > 2 ? len - 2 : 0);
    for (var key = 2; key < len; key++) {
      args[key - 2] = arguments[key];
    }
    if (format === undefined) {
      throw new Error(
        '`warning(condition, format, ...args)` requires a warning ' +
        'message argument'
      );
    }

    if (format.length < 10 || (/^[s\W]*$/).test(format)) {
      throw new Error(
        'The warning format should be able to uniquely identify this ' +
        'warning. Please, use a more descriptive format than: ' + format
      );
    }

    if (!condition) {
      var argIndex = 0;
      var message = 'Warning: ' +
        format.replace(/%s/g, function() {
          return args[argIndex++];
        });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch(x) {}
    }
  };
}

module.exports = warning;


/***/ }),

/***/ 34:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.locationsAreEqual = exports.statesAreEqual = exports.createLocation = exports.createQuery = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _invariant = __webpack_require__(8);

var _invariant2 = _interopRequireDefault(_invariant);

var _warning = __webpack_require__(27);

var _warning2 = _interopRequireDefault(_warning);

var _PathUtils = __webpack_require__(23);

var _Actions = __webpack_require__(53);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createQuery = exports.createQuery = function createQuery(props) {
  return _extends(Object.create(null), props);
};

var createLocation = exports.createLocation = function createLocation() {
  var input = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/';
  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _Actions.POP;
  var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

  var object = typeof input === 'string' ? (0, _PathUtils.parsePath)(input) : input;

   true ? (0, _warning2.default)(!object.path, 'Location descriptor objects should have a `pathname`, not a `path`.') : void 0;

  var pathname = object.pathname || '/';
  var search = object.search || '';
  var hash = object.hash || '';
  var state = object.state;

  return {
    pathname: pathname,
    search: search,
    hash: hash,
    state: state,
    action: action,
    key: key
  };
};

var isDate = function isDate(object) {
  return Object.prototype.toString.call(object) === '[object Date]';
};

var statesAreEqual = exports.statesAreEqual = function statesAreEqual(a, b) {
  if (a === b) return true;

  var typeofA = typeof a === 'undefined' ? 'undefined' : _typeof(a);
  var typeofB = typeof b === 'undefined' ? 'undefined' : _typeof(b);

  if (typeofA !== typeofB) return false;

  !(typeofA !== 'function') ?  true ? (0, _invariant2.default)(false, 'You must not store functions in location state') : (0, _invariant2.default)(false) : void 0;

  // Not the same object, but same type.
  if (typeofA === 'object') {
    !!(isDate(a) && isDate(b)) ?  true ? (0, _invariant2.default)(false, 'You must not store Date objects in location state') : (0, _invariant2.default)(false) : void 0;

    if (!Array.isArray(a)) {
      var keysofA = Object.keys(a);
      var keysofB = Object.keys(b);
      return keysofA.length === keysofB.length && keysofA.every(function (key) {
        return statesAreEqual(a[key], b[key]);
      });
    }

    return Array.isArray(b) && a.length === b.length && a.every(function (item, index) {
      return statesAreEqual(item, b[index]);
    });
  }

  // All other serializable types (string, number, boolean)
  // should be strict equal.
  return false;
};

var locationsAreEqual = exports.locationsAreEqual = function locationsAreEqual(a, b) {
  return a.key === b.key &&
  // a.action === b.action && // Different action !== location change.
  a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && statesAreEqual(a.state, b.state);
};

/***/ }),

/***/ 38:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_invariant__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_invariant___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_invariant__);
/* unused harmony export compilePattern */
/* harmony export (immutable) */ __webpack_exports__["b"] = matchPattern;
/* harmony export (immutable) */ __webpack_exports__["a"] = getParamNames;
/* unused harmony export getParams */
/* harmony export (immutable) */ __webpack_exports__["c"] = formatPattern;


function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function _compilePattern(pattern) {
  var regexpSource = '';
  var paramNames = [];
  var tokens = [];

  var match = void 0,
      lastIndex = 0,
      matcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|\*\*|\*|\(|\)|\\\(|\\\)/g;
  while (match = matcher.exec(pattern)) {
    if (match.index !== lastIndex) {
      tokens.push(pattern.slice(lastIndex, match.index));
      regexpSource += escapeRegExp(pattern.slice(lastIndex, match.index));
    }

    if (match[1]) {
      regexpSource += '([^/]+)';
      paramNames.push(match[1]);
    } else if (match[0] === '**') {
      regexpSource += '(.*)';
      paramNames.push('splat');
    } else if (match[0] === '*') {
      regexpSource += '(.*?)';
      paramNames.push('splat');
    } else if (match[0] === '(') {
      regexpSource += '(?:';
    } else if (match[0] === ')') {
      regexpSource += ')?';
    } else if (match[0] === '\\(') {
      regexpSource += '\\(';
    } else if (match[0] === '\\)') {
      regexpSource += '\\)';
    }

    tokens.push(match[0]);

    lastIndex = matcher.lastIndex;
  }

  if (lastIndex !== pattern.length) {
    tokens.push(pattern.slice(lastIndex, pattern.length));
    regexpSource += escapeRegExp(pattern.slice(lastIndex, pattern.length));
  }

  return {
    pattern: pattern,
    regexpSource: regexpSource,
    paramNames: paramNames,
    tokens: tokens
  };
}

var CompiledPatternsCache = Object.create(null);

function compilePattern(pattern) {
  if (!CompiledPatternsCache[pattern]) CompiledPatternsCache[pattern] = _compilePattern(pattern);

  return CompiledPatternsCache[pattern];
}

/**
 * Attempts to match a pattern on the given pathname. Patterns may use
 * the following special characters:
 *
 * - :paramName     Matches a URL segment up to the next /, ?, or #. The
 *                  captured string is considered a "param"
 * - ()             Wraps a segment of the URL that is optional
 * - *              Consumes (non-greedy) all characters up to the next
 *                  character in the pattern, or to the end of the URL if
 *                  there is none
 * - **             Consumes (greedy) all characters up to the next character
 *                  in the pattern, or to the end of the URL if there is none
 *
 *  The function calls callback(error, matched) when finished.
 * The return value is an object with the following properties:
 *
 * - remainingPathname
 * - paramNames
 * - paramValues
 */
function matchPattern(pattern, pathname) {
  // Ensure pattern starts with leading slash for consistency with pathname.
  if (pattern.charAt(0) !== '/') {
    pattern = '/' + pattern;
  }

  var _compilePattern2 = compilePattern(pattern),
      regexpSource = _compilePattern2.regexpSource,
      paramNames = _compilePattern2.paramNames,
      tokens = _compilePattern2.tokens;

  if (pattern.charAt(pattern.length - 1) !== '/') {
    regexpSource += '/?'; // Allow optional path separator at end.
  }

  // Special-case patterns like '*' for catch-all routes.
  if (tokens[tokens.length - 1] === '*') {
    regexpSource += '$';
  }

  var match = pathname.match(new RegExp('^' + regexpSource, 'i'));
  if (match == null) {
    return null;
  }

  var matchedPath = match[0];
  var remainingPathname = pathname.substr(matchedPath.length);

  if (remainingPathname) {
    // Require that the match ends at a path separator, if we didn't match
    // the full path, so any remaining pathname is a new path segment.
    if (matchedPath.charAt(matchedPath.length - 1) !== '/') {
      return null;
    }

    // If there is a remaining pathname, treat the path separator as part of
    // the remaining pathname for properly continuing the match.
    remainingPathname = '/' + remainingPathname;
  }

  return {
    remainingPathname: remainingPathname,
    paramNames: paramNames,
    paramValues: match.slice(1).map(function (v) {
      return v && decodeURIComponent(v);
    })
  };
}

function getParamNames(pattern) {
  return compilePattern(pattern).paramNames;
}

function getParams(pattern, pathname) {
  var match = matchPattern(pattern, pathname);
  if (!match) {
    return null;
  }

  var paramNames = match.paramNames,
      paramValues = match.paramValues;

  var params = {};

  paramNames.forEach(function (paramName, index) {
    params[paramName] = paramValues[index];
  });

  return params;
}

/**
 * Returns a version of the given pattern with params interpolated. Throws
 * if there is a dynamic segment of the pattern for which there is no param.
 */
function formatPattern(pattern, params) {
  params = params || {};

  var _compilePattern3 = compilePattern(pattern),
      tokens = _compilePattern3.tokens;

  var parenCount = 0,
      pathname = '',
      splatIndex = 0,
      parenHistory = [];

  var token = void 0,
      paramName = void 0,
      paramValue = void 0;
  for (var i = 0, len = tokens.length; i < len; ++i) {
    token = tokens[i];

    if (token === '*' || token === '**') {
      paramValue = Array.isArray(params.splat) ? params.splat[splatIndex++] : params.splat;

      !(paramValue != null || parenCount > 0) ?  true ? __WEBPACK_IMPORTED_MODULE_0_invariant___default()(false, 'Missing splat #%s for path "%s"', splatIndex, pattern) : invariant(false) : void 0;

      if (paramValue != null) pathname += encodeURI(paramValue);
    } else if (token === '(') {
      parenHistory[parenCount] = '';
      parenCount += 1;
    } else if (token === ')') {
      var parenText = parenHistory.pop();
      parenCount -= 1;

      if (parenCount) parenHistory[parenCount - 1] += parenText;else pathname += parenText;
    } else if (token === '\\(') {
      pathname += '(';
    } else if (token === '\\)') {
      pathname += ')';
    } else if (token.charAt(0) === ':') {
      paramName = token.substring(1);
      paramValue = params[paramName];

      !(paramValue != null || parenCount > 0) ?  true ? __WEBPACK_IMPORTED_MODULE_0_invariant___default()(false, 'Missing "%s" parameter for path "%s"', paramName, pattern) : invariant(false) : void 0;

      if (paramValue == null) {
        if (parenCount) {
          parenHistory[parenCount - 1] = '';

          var curTokenIdx = tokens.indexOf(token);
          var tokensSubset = tokens.slice(curTokenIdx, tokens.length);
          var nextParenIdx = -1;

          for (var _i = 0; _i < tokensSubset.length; _i++) {
            if (tokensSubset[_i] == ')') {
              nextParenIdx = _i;
              break;
            }
          }

          !(nextParenIdx > 0) ?  true ? __WEBPACK_IMPORTED_MODULE_0_invariant___default()(false, 'Path "%s" is missing end paren at segment "%s"', pattern, tokensSubset.join('')) : invariant(false) : void 0;

          // jump to ending paren
          i = curTokenIdx + nextParenIdx - 1;
        }
      } else if (parenCount) parenHistory[parenCount - 1] += encodeURIComponent(paramValue);else pathname += encodeURIComponent(paramValue);
    } else {
      if (parenCount) parenHistory[parenCount - 1] += token;else pathname += token;
    }
  }

  !(parenCount <= 0) ?  true ? __WEBPACK_IMPORTED_MODULE_0_invariant___default()(false, 'Path "%s" is missing end paren', pattern) : invariant(false) : void 0;

  return pathname.replace(/\/+/g, '/');
}

/***/ }),

/***/ 39:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_warning__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_warning___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_warning__);
/* harmony export (immutable) */ __webpack_exports__["a"] = routerWarning;
/* unused harmony export _resetWarned */


var warned = {};

function routerWarning(falseToWarn, message) {
  // Only issue deprecation warnings once.
  if (message.indexOf('deprecated') !== -1) {
    if (warned[message]) {
      return;
    }

    warned[message] = true;
  }

  message = '[react-router] ' + message;

  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  __WEBPACK_IMPORTED_MODULE_0_warning___default.a.apply(undefined, [falseToWarn, message].concat(args));
}

function _resetWarned() {
  warned = {};
}

/***/ }),

/***/ 41:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
const SET_AGE_RANGE = 'set_age_range';
/* harmony export (immutable) */ __webpack_exports__["f"] = SET_AGE_RANGE;

const SET_YEARS_ACTIVE_RANGE = 'SET_YEARS_ACTIVE_RANGE';
/* harmony export (immutable) */ __webpack_exports__["g"] = SET_YEARS_ACTIVE_RANGE;

const SEARCH_ARTISTS = 'SEARCH_ARTISTS';
/* harmony export (immutable) */ __webpack_exports__["h"] = SEARCH_ARTISTS;

const FIND_ARTIST = 'FIND_ARTIST';
/* harmony export (immutable) */ __webpack_exports__["i"] = FIND_ARTIST;

const RESET_ARTIST = 'RESET_ARTIST';
/* harmony export (immutable) */ __webpack_exports__["a"] = RESET_ARTIST;

const CREATE_ERROR = 'CREATE_ERROR';
/* harmony export (immutable) */ __webpack_exports__["j"] = CREATE_ERROR;

const CLEAR_ERROR = 'CLEAR_ERROR';
/* harmony export (immutable) */ __webpack_exports__["b"] = CLEAR_ERROR;

const SELECT_ARTIST = 'SELECT_ARTIST';
/* harmony export (immutable) */ __webpack_exports__["c"] = SELECT_ARTIST;

const DESELECT_ARTIST = 'DESELECT_ARTIST';
/* harmony export (immutable) */ __webpack_exports__["d"] = DESELECT_ARTIST;

const RESET_SELECTION = 'RESET_SELECTION';
/* harmony export (immutable) */ __webpack_exports__["e"] = RESET_SELECTION;


/***/ }),

/***/ 50:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_prop_types__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_prop_types___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_prop_types__);
/* harmony export (immutable) */ __webpack_exports__["c"] = falsy;
/* unused harmony export history */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return component; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return components; });
/* unused harmony export route */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return routes; });


function falsy(props, propName, componentName) {
  if (props[propName]) return new Error('<' + componentName + '> should not have a "' + propName + '" prop');
}

var history = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_prop_types__["shape"])({
  listen: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  push: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  replace: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  go: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  goBack: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired,
  goForward: __WEBPACK_IMPORTED_MODULE_0_prop_types__["func"].isRequired
});

var component = __WEBPACK_IMPORTED_MODULE_0_prop_types__["elementType"];
var components = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_prop_types__["oneOfType"])([component, __WEBPACK_IMPORTED_MODULE_0_prop_types__["object"]]);
var route = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_prop_types__["oneOfType"])([__WEBPACK_IMPORTED_MODULE_0_prop_types__["object"], __WEBPACK_IMPORTED_MODULE_0_prop_types__["element"]]);
var routes = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_prop_types__["oneOfType"])([route, __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0_prop_types__["arrayOf"])(route)]);

/***/ }),

/***/ 52:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Router__ = __webpack_require__(1416);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return __WEBPACK_IMPORTED_MODULE_0__Router__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__Link__ = __webpack_require__(185);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return __WEBPACK_IMPORTED_MODULE_1__Link__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__IndexLink__ = __webpack_require__(1412);
/* unused harmony reexport IndexLink */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__withRouter__ = __webpack_require__(1427);
/* unused harmony reexport withRouter */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__IndexRedirect__ = __webpack_require__(1413);
/* unused harmony reexport IndexRedirect */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__IndexRoute__ = __webpack_require__(1414);
/* unused harmony reexport IndexRoute */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__Redirect__ = __webpack_require__(187);
/* unused harmony reexport Redirect */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__Route__ = __webpack_require__(1415);
/* unused harmony reexport Route */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__RouteUtils__ = __webpack_require__(26);
/* unused harmony reexport createRoutes */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__RouterContext__ = __webpack_require__(117);
/* unused harmony reexport RouterContext */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__PropTypes__ = __webpack_require__(116);
/* unused harmony reexport locationShape */
/* unused harmony reexport routerShape */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__match__ = __webpack_require__(1425);
/* unused harmony reexport match */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__useRouterHistory__ = __webpack_require__(192);
/* unused harmony reexport useRouterHistory */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__PatternUtils__ = __webpack_require__(38);
/* unused harmony reexport formatPattern */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__applyRouterMiddleware__ = __webpack_require__(1418);
/* unused harmony reexport applyRouterMiddleware */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__browserHistory__ = __webpack_require__(1419);
/* unused harmony reexport browserHistory */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__hashHistory__ = __webpack_require__(1423);
/* harmony reexport (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return __WEBPACK_IMPORTED_MODULE_16__hashHistory__["a"]; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__createMemoryHistory__ = __webpack_require__(189);
/* unused harmony reexport createMemoryHistory */
/* components */









/* components (configuration) */










/* utils */















/* histories */








/***/ }),

/***/ 53:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
/**
 * Indicates that navigation was caused by a call to history.push.
 */
var PUSH = exports.PUSH = 'PUSH';

/**
 * Indicates that navigation was caused by a call to history.replace.
 */
var REPLACE = exports.REPLACE = 'REPLACE';

/**
 * Indicates that navigation was caused by some other action such
 * as using a browser's back/forward buttons and/or manually manipulating
 * the URL in a browser's location bar. This is the default.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
 * for more information.
 */
var POP = exports.POP = 'POP';

/***/ }),

/***/ 54:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var addEventListener = exports.addEventListener = function addEventListener(node, event, listener) {
  return node.addEventListener ? node.addEventListener(event, listener, false) : node.attachEvent('on' + event, listener);
};

var removeEventListener = exports.removeEventListener = function removeEventListener(node, event, listener) {
  return node.removeEventListener ? node.removeEventListener(event, listener, false) : node.detachEvent('on' + event, listener);
};

/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */
var supportsHistory = exports.supportsHistory = function supportsHistory() {
  var ua = window.navigator.userAgent;

  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;

  return window.history && 'pushState' in window.history;
};

/**
 * Returns false if using go(n) with hash history causes a full page reload.
 */
var supportsGoWithoutReloadUsingHash = exports.supportsGoWithoutReloadUsingHash = function supportsGoWithoutReloadUsingHash() {
  return window.navigator.userAgent.indexOf('Firefox') === -1;
};

/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */
var supportsPopstateOnHashchange = exports.supportsPopstateOnHashchange = function supportsPopstateOnHashchange() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
};

/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */
var isExtraneousPopstateEvent = exports.isExtraneousPopstateEvent = function isExtraneousPopstateEvent(event) {
  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
};

/***/ }),

/***/ 77:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lodash___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_lodash__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_react_router__ = __webpack_require__(52);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__types__ = __webpack_require__(41);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__database_queries_GetAgeRange__ = __webpack_require__(216);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__database_queries_GetAgeRange___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3__database_queries_GetAgeRange__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__database_queries_GetYearsActiveRange__ = __webpack_require__(217);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__database_queries_GetYearsActiveRange___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4__database_queries_GetYearsActiveRange__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__database_queries_SearchArtists__ = __webpack_require__(218);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__database_queries_SearchArtists___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5__database_queries_SearchArtists__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__database_queries_FindArtist__ = __webpack_require__(215);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__database_queries_FindArtist___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__database_queries_FindArtist__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__database_queries_CreateArtist__ = __webpack_require__(212);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__database_queries_CreateArtist___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_7__database_queries_CreateArtist__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__database_queries_EditArtist__ = __webpack_require__(214);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__database_queries_EditArtist___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_8__database_queries_EditArtist__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__database_queries_DeleteArtist__ = __webpack_require__(213);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__database_queries_DeleteArtist___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_9__database_queries_DeleteArtist__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__database_queries_SetRetired__ = __webpack_require__(220);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__database_queries_SetRetired___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_10__database_queries_SetRetired__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__database_queries_SetNotRetired__ = __webpack_require__(219);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__database_queries_SetNotRetired___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_11__database_queries_SetNotRetired__);














const resetArtist = () => {
  return { type: __WEBPACK_IMPORTED_MODULE_2__types__["a" /* RESET_ARTIST */] };
};
/* harmony export (immutable) */ __webpack_exports__["resetArtist"] = resetArtist;


const clearError = () => {
  return { type: __WEBPACK_IMPORTED_MODULE_2__types__["b" /* CLEAR_ERROR */] };
};
/* harmony export (immutable) */ __webpack_exports__["clearError"] = clearError;


const selectArtist = id => {
  return { type: __WEBPACK_IMPORTED_MODULE_2__types__["c" /* SELECT_ARTIST */], payload: id };
};
/* harmony export (immutable) */ __webpack_exports__["selectArtist"] = selectArtist;


const deselectArtist = id => {
  return { type: __WEBPACK_IMPORTED_MODULE_2__types__["d" /* DESELECT_ARTIST */], payload: id };
};
/* harmony export (immutable) */ __webpack_exports__["deselectArtist"] = deselectArtist;


const setRetired = ids => (dispatch, getState) => SetRetiredProxy(ids.map(id => id.toString())).then(() => dispatch({ type: __WEBPACK_IMPORTED_MODULE_2__types__["e" /* RESET_SELECTION */] })).then(() => refreshSearch(dispatch, getState));
/* harmony export (immutable) */ __webpack_exports__["setRetired"] = setRetired;


const setNotRetired = ids => (dispatch, getState) => SetNotRetiredProxy(ids.map(id => id.toString())).then(() => dispatch({ type: __WEBPACK_IMPORTED_MODULE_2__types__["e" /* RESET_SELECTION */] })).then(() => refreshSearch(dispatch, getState));
/* harmony export (immutable) */ __webpack_exports__["setNotRetired"] = setNotRetired;


const setAgeRange = () => dispatch => GetAgeRangeProxy().then(result => dispatch({ type: __WEBPACK_IMPORTED_MODULE_2__types__["f" /* SET_AGE_RANGE */], payload: result }));
/* harmony export (immutable) */ __webpack_exports__["setAgeRange"] = setAgeRange;


const setYearsActiveRange = () => dispatch => GetYearsActiveRangeProxy().then(result => dispatch({ type: __WEBPACK_IMPORTED_MODULE_2__types__["g" /* SET_YEARS_ACTIVE_RANGE */], payload: result }));
/* harmony export (immutable) */ __webpack_exports__["setYearsActiveRange"] = setYearsActiveRange;


const searchArtists = (...criteria) => dispatch => SearchArtistsProxy(...criteria).then((result = []) => dispatch({ type: __WEBPACK_IMPORTED_MODULE_2__types__["h" /* SEARCH_ARTISTS */], payload: result }));
/* harmony export (immutable) */ __webpack_exports__["searchArtists"] = searchArtists;


const findArtist = id => dispatch => FindArtistProxy(id).then(artist => dispatch({ type: __WEBPACK_IMPORTED_MODULE_2__types__["i" /* FIND_ARTIST */], payload: artist }));
/* harmony export (immutable) */ __webpack_exports__["findArtist"] = findArtist;


const createArtist = props => dispatch => CreateArtistProxy(props).then(artist => {
  __WEBPACK_IMPORTED_MODULE_1_react_router__["b" /* hashHistory */].push(`artists/${artist._id}`);
}).catch(error => {
  console.log(error);
  dispatch({ type: __WEBPACK_IMPORTED_MODULE_2__types__["j" /* CREATE_ERROR */], payload: error });
});
/* harmony export (immutable) */ __webpack_exports__["createArtist"] = createArtist;


const editArtist = (id, props) => dispatch => EditArtistProxy(id, props).then(() => __WEBPACK_IMPORTED_MODULE_1_react_router__["b" /* hashHistory */].push(`artists/${id}`)).catch(error => {
  console.log(error);
  dispatch({ type: __WEBPACK_IMPORTED_MODULE_2__types__["j" /* CREATE_ERROR */], payload: error });
});
/* harmony export (immutable) */ __webpack_exports__["editArtist"] = editArtist;


const deleteArtist = id => dispatch => DeleteArtistProxy(id).then(() => __WEBPACK_IMPORTED_MODULE_1_react_router__["b" /* hashHistory */].push('/')).catch(error => {
  console.log(error);
  dispatch({ type: __WEBPACK_IMPORTED_MODULE_2__types__["j" /* CREATE_ERROR */], payload: error });
});
/* harmony export (immutable) */ __webpack_exports__["deleteArtist"] = deleteArtist;


//
// Faux Proxies

const GetAgeRangeProxy = (...args) => {
  const result = __WEBPACK_IMPORTED_MODULE_3__database_queries_GetAgeRange___default()(...args);
  if (!result || !result.then) {
    return new Promise(() => {});
  }
  return result;
};

const GetYearsActiveRangeProxy = (...args) => {
  const result = __WEBPACK_IMPORTED_MODULE_4__database_queries_GetYearsActiveRange___default()(...args);
  if (!result || !result.then) {
    return new Promise(() => {});
  }
  return result;
};

const SearchArtistsProxy = (criteria, offset, limit) => {
  const result = __WEBPACK_IMPORTED_MODULE_5__database_queries_SearchArtists___default()(__WEBPACK_IMPORTED_MODULE_0_lodash___default.a.omit(criteria, 'sort'), criteria.sort, offset, limit);
  if (!result || !result.then) {
    return new Promise(() => {});
  }
  return result;
};

const FindArtistProxy = (...args) => {
  const result = __WEBPACK_IMPORTED_MODULE_6__database_queries_FindArtist___default()(...args);
  if (!result || !result.then) {
    return new Promise(() => {});
  }
  return result;
};

const CreateArtistProxy = (...args) => {
  const result = __WEBPACK_IMPORTED_MODULE_7__database_queries_CreateArtist___default()(...args);
  if (!result || !result.then) {
    return new Promise(() => {});
  }
  return result;
};

const EditArtistProxy = (...args) => {
  const result = __WEBPACK_IMPORTED_MODULE_8__database_queries_EditArtist___default()(...args);
  if (!result || !result.then) {
    return new Promise(() => {});
  }
  return result;
};

const DeleteArtistProxy = (...args) => {
  const result = __WEBPACK_IMPORTED_MODULE_9__database_queries_DeleteArtist___default()(...args);
  if (!result || !result.then) {
    return new Promise(() => {});
  }
  return result;
};

const SetRetiredProxy = _ids => {
  const result = __WEBPACK_IMPORTED_MODULE_10__database_queries_SetRetired___default()(_ids);
  if (!result || !result.then) {
    return new Promise(() => {});
  }
  return result;
};

const SetNotRetiredProxy = _ids => {
  const result = __WEBPACK_IMPORTED_MODULE_11__database_queries_SetNotRetired___default()(_ids);
  if (!result || !result.then) {
    return new Promise(() => {});
  }
  return result;
};

//
// Helpers

const refreshSearch = (dispatch, getState) => {
  const { artists: { offset, limit } } = getState();
  const criteria = getState().form.filters.values;

  dispatch(searchArtists(__WEBPACK_IMPORTED_MODULE_0_lodash___default.a.extend({}, { name: '' }, criteria), offset, limit));
};

/***/ }),

/***/ 78:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),

/***/ 80:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
exports.go = exports.replaceLocation = exports.pushLocation = exports.startListener = exports.getUserConfirmation = exports.getCurrentLocation = undefined;

var _LocationUtils = __webpack_require__(34);

var _DOMUtils = __webpack_require__(54);

var _DOMStateStorage = __webpack_require__(132);

var _PathUtils = __webpack_require__(23);

var _ExecutionEnvironment = __webpack_require__(81);

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

var needsHashchangeListener = _ExecutionEnvironment.canUseDOM && !(0, _DOMUtils.supportsPopstateOnHashchange)();

var _createLocation = function _createLocation(historyState) {
  var key = historyState && historyState.key;

  return (0, _LocationUtils.createLocation)({
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: key ? (0, _DOMStateStorage.readState)(key) : undefined
  }, undefined, key);
};

var getCurrentLocation = exports.getCurrentLocation = function getCurrentLocation() {
  var historyState = void 0;
  try {
    historyState = window.history.state || {};
  } catch (error) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    historyState = {};
  }

  return _createLocation(historyState);
};

var getUserConfirmation = exports.getUserConfirmation = function getUserConfirmation(message, callback) {
  return callback(window.confirm(message));
}; // eslint-disable-line no-alert

var startListener = exports.startListener = function startListener(listener) {
  var handlePopState = function handlePopState(event) {
    if ((0, _DOMUtils.isExtraneousPopstateEvent)(event)) // Ignore extraneous popstate events in WebKit
      return;
    listener(_createLocation(event.state));
  };

  (0, _DOMUtils.addEventListener)(window, PopStateEvent, handlePopState);

  var handleUnpoppedHashChange = function handleUnpoppedHashChange() {
    return listener(getCurrentLocation());
  };

  if (needsHashchangeListener) {
    (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleUnpoppedHashChange);
  }

  return function () {
    (0, _DOMUtils.removeEventListener)(window, PopStateEvent, handlePopState);

    if (needsHashchangeListener) {
      (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleUnpoppedHashChange);
    }
  };
};

var updateLocation = function updateLocation(location, updateState) {
  var state = location.state,
      key = location.key;


  if (state !== undefined) (0, _DOMStateStorage.saveState)(key, state);

  updateState({ key: key }, (0, _PathUtils.createPath)(location));
};

var pushLocation = exports.pushLocation = function pushLocation(location) {
  return updateLocation(location, function (state, path) {
    return window.history.pushState(state, null, path);
  });
};

var replaceLocation = exports.replaceLocation = function replaceLocation(location) {
  return updateLocation(location, function (state, path) {
    return window.history.replaceState(state, null, path);
  });
};

var go = exports.go = function go(n) {
  if (n) window.history.go(n);
};

/***/ }),

/***/ 81:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;
var canUseDOM = exports.canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

/***/ }),

/***/ 82:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _AsyncUtils = __webpack_require__(1214);

var _PathUtils = __webpack_require__(23);

var _runTransitionHook = __webpack_require__(83);

var _runTransitionHook2 = _interopRequireDefault(_runTransitionHook);

var _Actions = __webpack_require__(53);

var _LocationUtils = __webpack_require__(34);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createHistory = function createHistory() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var getCurrentLocation = options.getCurrentLocation,
      getUserConfirmation = options.getUserConfirmation,
      pushLocation = options.pushLocation,
      replaceLocation = options.replaceLocation,
      go = options.go,
      keyLength = options.keyLength;


  var currentLocation = void 0;
  var pendingLocation = void 0;
  var beforeListeners = [];
  var listeners = [];
  var allKeys = [];

  var getCurrentIndex = function getCurrentIndex() {
    if (pendingLocation && pendingLocation.action === _Actions.POP) return allKeys.indexOf(pendingLocation.key);

    if (currentLocation) return allKeys.indexOf(currentLocation.key);

    return -1;
  };

  var updateLocation = function updateLocation(nextLocation) {
    var currentIndex = getCurrentIndex();

    currentLocation = nextLocation;

    if (currentLocation.action === _Actions.PUSH) {
      allKeys = [].concat(allKeys.slice(0, currentIndex + 1), [currentLocation.key]);
    } else if (currentLocation.action === _Actions.REPLACE) {
      allKeys[currentIndex] = currentLocation.key;
    }

    listeners.forEach(function (listener) {
      return listener(currentLocation);
    });
  };

  var listenBefore = function listenBefore(listener) {
    beforeListeners.push(listener);

    return function () {
      return beforeListeners = beforeListeners.filter(function (item) {
        return item !== listener;
      });
    };
  };

  var listen = function listen(listener) {
    listeners.push(listener);

    return function () {
      return listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  };

  var confirmTransitionTo = function confirmTransitionTo(location, callback) {
    (0, _AsyncUtils.loopAsync)(beforeListeners.length, function (index, next, done) {
      (0, _runTransitionHook2.default)(beforeListeners[index], location, function (result) {
        return result != null ? done(result) : next();
      });
    }, function (message) {
      if (getUserConfirmation && typeof message === 'string') {
        getUserConfirmation(message, function (ok) {
          return callback(ok !== false);
        });
      } else {
        callback(message !== false);
      }
    });
  };

  var transitionTo = function transitionTo(nextLocation) {
    if (currentLocation && (0, _LocationUtils.locationsAreEqual)(currentLocation, nextLocation) || pendingLocation && (0, _LocationUtils.locationsAreEqual)(pendingLocation, nextLocation)) return; // Nothing to do

    pendingLocation = nextLocation;

    confirmTransitionTo(nextLocation, function (ok) {
      if (pendingLocation !== nextLocation) return; // Transition was interrupted during confirmation

      pendingLocation = null;

      if (ok) {
        // Treat PUSH to same path like REPLACE to be consistent with browsers
        if (nextLocation.action === _Actions.PUSH) {
          var prevPath = (0, _PathUtils.createPath)(currentLocation);
          var nextPath = (0, _PathUtils.createPath)(nextLocation);

          if (nextPath === prevPath && (0, _LocationUtils.statesAreEqual)(currentLocation.state, nextLocation.state)) nextLocation.action = _Actions.REPLACE;
        }

        if (nextLocation.action === _Actions.POP) {
          updateLocation(nextLocation);
        } else if (nextLocation.action === _Actions.PUSH) {
          if (pushLocation(nextLocation) !== false) updateLocation(nextLocation);
        } else if (nextLocation.action === _Actions.REPLACE) {
          if (replaceLocation(nextLocation) !== false) updateLocation(nextLocation);
        }
      } else if (currentLocation && nextLocation.action === _Actions.POP) {
        var prevIndex = allKeys.indexOf(currentLocation.key);
        var nextIndex = allKeys.indexOf(nextLocation.key);

        if (prevIndex !== -1 && nextIndex !== -1) go(prevIndex - nextIndex); // Restore the URL
      }
    });
  };

  var push = function push(input) {
    return transitionTo(createLocation(input, _Actions.PUSH));
  };

  var replace = function replace(input) {
    return transitionTo(createLocation(input, _Actions.REPLACE));
  };

  var goBack = function goBack() {
    return go(-1);
  };

  var goForward = function goForward() {
    return go(1);
  };

  var createKey = function createKey() {
    return Math.random().toString(36).substr(2, keyLength || 6);
  };

  var createHref = function createHref(location) {
    return (0, _PathUtils.createPath)(location);
  };

  var createLocation = function createLocation(location, action) {
    var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : createKey();
    return (0, _LocationUtils.createLocation)(location, action, key);
  };

  return {
    getCurrentLocation: getCurrentLocation,
    listenBefore: listenBefore,
    listen: listen,
    transitionTo: transitionTo,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    createKey: createKey,
    createPath: _PathUtils.createPath,
    createHref: createHref,
    createLocation: createLocation
  };
};

exports.default = createHistory;

/***/ }),

/***/ 83:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.__esModule = true;

var _warning = __webpack_require__(27);

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var runTransitionHook = function runTransitionHook(hook, location, callback) {
  var result = hook(location, callback);

  if (hook.length < 2) {
    // Assume the hook runs synchronously and automatically
    // call the callback with the return value.
    callback(result);
  } else {
     true ? (0, _warning2.default)(result === undefined, 'You should not "return" in a transition hook with a callback argument; ' + 'call the callback instead') : void 0;
  }
};

exports.default = runTransitionHook;

/***/ })

},[231]);