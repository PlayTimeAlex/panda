/*!
 * ZeroClipboard
 * The ZeroClipboard library provides an easy way to copy text to the clipboard using an invisible Adobe Flash movie and a JavaScript interface.
 * Copyright (c) 2014 Jon Rohan, James M. Greene
 * Licensed MIT
 * http://zeroclipboard.org/
 * v2.1.6
 */
(function(window, undefined) {
  "use strict";
  /**
 * Store references to critically important global functions that may be
 * overridden on certain web pages.
 */
  var _window = window, _document = _window.document, _navigator = _window.navigator, _setTimeout = _window.setTimeout, _encodeURIComponent = _window.encodeURIComponent, _ActiveXObject = _window.ActiveXObject, _Error = _window.Error, _parseInt = _window.Number.parseInt || _window.parseInt, _parseFloat = _window.Number.parseFloat || _window.parseFloat, _isNaN = _window.Number.isNaN || _window.isNaN, _round = _window.Math.round, _now = _window.Date.now, _keys = _window.Object.keys, _defineProperty = _window.Object.defineProperty, _hasOwn = _window.Object.prototype.hasOwnProperty, _slice = _window.Array.prototype.slice, _unwrap = function() {
    var unwrapper = function(el) {
      return el;
    };
    if (typeof _window.wrap === "function" && typeof _window.unwrap === "function") {
      try {
        var div = _document.createElement("div");
        var unwrappedDiv = _window.unwrap(div);
        if (div.nodeType === 1 && unwrappedDiv && unwrappedDiv.nodeType === 1) {
          unwrapper = _window.unwrap;
        }
      } catch (e) {}
    }
    return unwrapper;
  }();
  /**
 * Convert an `arguments` object into an Array.
 *
 * @returns The arguments as an Array
 * @private
 */
  var _args = function(argumentsObj) {
    return _slice.call(argumentsObj, 0);
  };
  /**
 * Shallow-copy the owned, enumerable properties of one object over to another, similar to jQuery's `$.extend`.
 *
 * @returns The target object, augmented
 * @private
 */
  var _extend = function() {
    var i, len, arg, prop, src, copy, args = _args(arguments), target = args[0] || {};
    for (i = 1, len = args.length; i < len; i++) {
      if ((arg = args[i]) != null) {
        for (prop in arg) {
          if (_hasOwn.call(arg, prop)) {
            src = target[prop];
            copy = arg[prop];
            if (target !== copy && copy !== undefined) {
              target[prop] = copy;
            }
          }
        }
      }
    }
    return target;
  };
  /**
 * Return a deep copy of the source object or array.
 *
 * @returns Object or Array
 * @private
 */
  var _deepCopy = function(source) {
    var copy, i, len, prop;
    if (typeof source !== "object" || source == null) {
      copy = source;
    } else if (typeof source.length === "number") {
      copy = [];
      for (i = 0, len = source.length; i < len; i++) {
        if (_hasOwn.call(source, i)) {
          copy[i] = _deepCopy(source[i]);
        }
      }
    } else {
      copy = {};
      for (prop in source) {
        if (_hasOwn.call(source, prop)) {
          copy[prop] = _deepCopy(source[prop]);
        }
      }
    }
    return copy;
  };
  /**
 * Makes a shallow copy of `obj` (like `_extend`) but filters its properties based on a list of `keys` to keep.
 * The inverse of `_omit`, mostly. The big difference is that these properties do NOT need to be enumerable to
 * be kept.
 *
 * @returns A new filtered object.
 * @private
 */
  var _pick = function(obj, keys) {
    var newObj = {};
    for (var i = 0, len = keys.length; i < len; i++) {
      if (keys[i] in obj) {
        newObj[keys[i]] = obj[keys[i]];
      }
    }
    return newObj;
  };
  /**
 * Makes a shallow copy of `obj` (like `_extend`) but filters its properties based on a list of `keys` to omit.
 * The inverse of `_pick`.
 *
 * @returns A new filtered object.
 * @private
 */
  var _omit = function(obj, keys) {
    var newObj = {};
    for (var prop in obj) {
      if (keys.indexOf(prop) === -1) {
        newObj[prop] = obj[prop];
      }
    }
    return newObj;
  };
  /**
 * Remove all owned, enumerable properties from an object.
 *
 * @returns The original object without its owned, enumerable properties.
 * @private
 */
  var _deleteOwnProperties = function(obj) {
    if (obj) {
      for (var prop in obj) {
        if (_hasOwn.call(obj, prop)) {
          delete obj[prop];
        }
      }
    }
    return obj;
  };
  /**
 * Determine if an element is contained within another element.
 *
 * @returns Boolean
 * @private
 */
  var _containedBy = function(el, ancestorEl) {
    if (el && el.nodeType === 1 && el.ownerDocument && ancestorEl && (ancestorEl.nodeType === 1 && ancestorEl.ownerDocument && ancestorEl.ownerDocument === el.ownerDocument || ancestorEl.nodeType === 9 && !ancestorEl.ownerDocument && ancestorEl === el.ownerDocument)) {
      do {
        if (el === ancestorEl) {
          return true;
        }
        el = el.parentNode;
      } while (el);
    }
    return false;
  };
  /**
 * Get the URL path's parent directory.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getDirPathOfUrl = function(url) {
    var dir;
    if (typeof url === "string" && url) {
      dir = url.split("#")[0].split("?")[0];
      dir = url.slice(0, url.lastIndexOf("/") + 1);
    }
    return dir;
  };
  /**
 * Get the current script's URL by throwing an `Error` and analyzing it.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getCurrentScriptUrlFromErrorStack = function(stack) {
    var url, matches;
    if (typeof stack === "string" && stack) {
      matches = stack.match(/^(?:|[^:@]*@|.+\)@(?=http[s]?|file)|.+?\s+(?: at |@)(?:[^:\(]+ )*[\(]?)((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
      if (matches && matches[1]) {
        url = matches[1];
      } else {
        matches = stack.match(/\)@((?:http[s]?|file):\/\/[\/]?.+?\/[^:\)]*?)(?::\d+)(?::\d+)?/);
        if (matches && matches[1]) {
          url = matches[1];
        }
      }
    }
    return url;
  };
  /**
 * Get the current script's URL by throwing an `Error` and analyzing it.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getCurrentScriptUrlFromError = function() {
    var url, err;
    try {
      throw new _Error();
    } catch (e) {
      err = e;
    }
    if (err) {
      url = err.sourceURL || err.fileName || _getCurrentScriptUrlFromErrorStack(err.stack);
    }
    return url;
  };
  /**
 * Get the current script's URL.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getCurrentScriptUrl = function() {
    var jsPath, scripts, i;
    if (_document.currentScript && (jsPath = _document.currentScript.src)) {
      return jsPath;
    }
    scripts = _document.getElementsByTagName("script");
    if (scripts.length === 1) {
      return scripts[0].src || undefined;
    }
    if ("readyState" in scripts[0]) {
      for (i = scripts.length; i--; ) {
        if (scripts[i].readyState === "interactive" && (jsPath = scripts[i].src)) {
          return jsPath;
        }
      }
    }
    if (_document.readyState === "loading" && (jsPath = scripts[scripts.length - 1].src)) {
      return jsPath;
    }
    if (jsPath = _getCurrentScriptUrlFromError()) {
      return jsPath;
    }
    return undefined;
  };
  /**
 * Get the unanimous parent directory of ALL script tags.
 * If any script tags are either (a) inline or (b) from differing parent
 * directories, this method must return `undefined`.
 *
 * @returns String or `undefined`
 * @private
 */
  var _getUnanimousScriptParentDir = function() {
    var i, jsDir, jsPath, scripts = _document.getElementsByTagName("script");
    for (i = scripts.length; i--; ) {
      if (!(jsPath = scripts[i].src)) {
        jsDir = null;
        break;
      }
      jsPath = _getDirPathOfUrl(jsPath);
      if (jsDir == null) {
        jsDir = jsPath;
      } else if (jsDir !== jsPath) {
        jsDir = null;
        break;
      }
    }
    return jsDir || undefined;
  };
  /**
 * Get the presumed location of the "ZeroClipboard.swf" file, based on the location
 * of the executing JavaScript file (e.g. "ZeroClipboard.js", etc.).
 *
 * @returns String
 * @private
 */
  var _getDefaultSwfPath = function() {
    var jsDir = _getDirPathOfUrl(_getCurrentScriptUrl()) || _getUnanimousScriptParentDir() || "";
    return jsDir + "ZeroClipboard.swf";
  };
  /**
 * Keep track of the state of the Flash object.
 * @private
 */
  var _flashState = {
    bridge: null,
    version: "0.0.0",
    pluginType: "unknown",
    disabled: null,
    outdated: null,
    unavailable: null,
    deactivated: null,
    overdue: null,
    ready: null
  };
  /**
 * The minimum Flash Player version required to use ZeroClipboard completely.
 * @readonly
 * @private
 */
  var _minimumFlashVersion = "11.0.0";
  /**
 * Keep track of all event listener registrations.
 * @private
 */
  var _handlers = {};
  /**
 * Keep track of the currently activated element.
 * @private
 */
  var _currentElement;
  /**
 * Keep track of the element that was activated when a `copy` process started.
 * @private
 */
  var _copyTarget;
  /**
 * Keep track of data for the pending clipboard transaction.
 * @private
 */
  var _clipData = {};
  /**
 * Keep track of data formats for the pending clipboard transaction.
 * @private
 */
  var _clipDataFormatMap = null;
  /**
 * The `message` store for events
 * @private
 */
  var _eventMessages = {
    ready: "Flash communication is established",
    error: {
      "flash-disabled": "Flash is disabled or not installed",
      "flash-outdated": "Flash is too outdated to support ZeroClipboard",
      "flash-unavailable": "Flash is unable to communicate bidirectionally with JavaScript",
      "flash-deactivated": "Flash is too outdated for your browser and/or is configured as click-to-activate",
      "flash-overdue": "Flash communication was established but NOT within the acceptable time limit"
    }
  };
  /**
 * ZeroClipboard configuration defaults for the Core module.
 * @private
 */
  var _globalConfig = {
    swfPath: _getDefaultSwfPath(),
    trustedDomains: window.location.host ? [ window.location.host ] : [],
    cacheBust: true,
    forceEnhancedClipboard: false,
    flashLoadTimeout: 3e4,
    autoActivate: true,
    bubbleEvents: true,
    containerId: "global-zeroclipboard-html-bridge",
    containerClass: "global-zeroclipboard-container",
    swfObjectId: "global-zeroclipboard-flash-bridge",
    hoverClass: "zeroclipboard-is-hover",
    activeClass: "zeroclipboard-is-active",
    forceHandCursor: false,
    title: null,
    zIndex: 999999999
  };
  /**
 * The underlying implementation of `ZeroClipboard.config`.
 * @private
 */
  var _config = function(options) {
    if (typeof options === "object" && options !== null) {
      for (var prop in options) {
        if (_hasOwn.call(options, prop)) {
          if (/^(?:forceHandCursor|title|zIndex|bubbleEvents)$/.test(prop)) {
            _globalConfig[prop] = options[prop];
          } else if (_flashState.bridge == null) {
            if (prop === "containerId" || prop === "swfObjectId") {
              if (_isValidHtml4Id(options[prop])) {
                _globalConfig[prop] = options[prop];
              } else {
                throw new Error("The specified `" + prop + "` value is not valid as an HTML4 Element ID");
              }
            } else {
              _globalConfig[prop] = options[prop];
            }
          }
        }
      }
    }
    if (typeof options === "string" && options) {
      if (_hasOwn.call(_globalConfig, options)) {
        return _globalConfig[options];
      }
      return;
    }
    return _deepCopy(_globalConfig);
  };
  /**
 * The underlying implementation of `ZeroClipboard.state`.
 * @private
 */
  var _state = function() {
    return {
      browser: _pick(_navigator, [ "userAgent", "platform", "appName" ]),
      flash: _omit(_flashState, [ "bridge" ]),
      zeroclipboard: {
        version: ZeroClipboard.version,
        config: ZeroClipboard.config()
      }
    };
  };
  /**
 * The underlying implementation of `ZeroClipboard.isFlashUnusable`.
 * @private
 */
  var _isFlashUnusable = function() {
    return !!(_flashState.disabled || _flashState.outdated || _flashState.unavailable || _flashState.deactivated);
  };
  /**
 * The underlying implementation of `ZeroClipboard.on`.
 * @private
 */
  var _on = function(eventType, listener) {
    var i, len, events, added = {};
    if (typeof eventType === "string" && eventType) {
      events = eventType.toLowerCase().split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          ZeroClipboard.on(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].replace(/^on/, "");
        added[eventType] = true;
        if (!_handlers[eventType]) {
          _handlers[eventType] = [];
        }
        _handlers[eventType].push(listener);
      }
      if (added.ready && _flashState.ready) {
        ZeroClipboard.emit({
          type: "ready"
        });
      }
      if (added.error) {
        var errorTypes = [ "disabled", "outdated", "unavailable", "deactivated", "overdue" ];
        for (i = 0, len = errorTypes.length; i < len; i++) {
          if (_flashState[errorTypes[i]] === true) {
            ZeroClipboard.emit({
              type: "error",
              name: "flash-" + errorTypes[i]
            });
            break;
          }
        }
      }
    }
    return ZeroClipboard;
  };
  /**
 * The underlying implementation of `ZeroClipboard.off`.
 * @private
 */
  var _off = function(eventType, listener) {
    var i, len, foundIndex, events, perEventHandlers;
    if (arguments.length === 0) {
      events = _keys(_handlers);
    } else if (typeof eventType === "string" && eventType) {
      events = eventType.split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          ZeroClipboard.off(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].toLowerCase().replace(/^on/, "");
        perEventHandlers = _handlers[eventType];
        if (perEventHandlers && perEventHandlers.length) {
          if (listener) {
            foundIndex = perEventHandlers.indexOf(listener);
            while (foundIndex !== -1) {
              perEventHandlers.splice(foundIndex, 1);
              foundIndex = perEventHandlers.indexOf(listener, foundIndex);
            }
          } else {
            perEventHandlers.length = 0;
          }
        }
      }
    }
    return ZeroClipboard;
  };
  /**
 * The underlying implementation of `ZeroClipboard.handlers`.
 * @private
 */
  var _listeners = function(eventType) {
    var copy;
    if (typeof eventType === "string" && eventType) {
      copy = _deepCopy(_handlers[eventType]) || null;
    } else {
      copy = _deepCopy(_handlers);
    }
    return copy;
  };
  /**
 * The underlying implementation of `ZeroClipboard.emit`.
 * @private
 */
  var _emit = function(event) {
    var eventCopy, returnVal, tmp;
    event = _createEvent(event);
    if (!event) {
      return;
    }
    if (_preprocessEvent(event)) {
      return;
    }
    if (event.type === "ready" && _flashState.overdue === true) {
      return ZeroClipboard.emit({
        type: "error",
        name: "flash-overdue"
      });
    }
    eventCopy = _extend({}, event);
    _dispatchCallbacks.call(this, eventCopy);
    if (event.type === "copy") {
      tmp = _mapClipDataToFlash(_clipData);
      returnVal = tmp.data;
      _clipDataFormatMap = tmp.formatMap;
    }
    return returnVal;
  };
  /**
 * The underlying implementation of `ZeroClipboard.create`.
 * @private
 */
  var _create = function() {
    if (typeof _flashState.ready !== "boolean") {
      _flashState.ready = false;
    }
    if (!ZeroClipboard.isFlashUnusable() && _flashState.bridge === null) {
      var maxWait = _globalConfig.flashLoadTimeout;
      if (typeof maxWait === "number" && maxWait >= 0) {
        _setTimeout(function() {
          if (typeof _flashState.deactivated !== "boolean") {
            _flashState.deactivated = true;
          }
          if (_flashState.deactivated === true) {
            ZeroClipboard.emit({
              type: "error",
              name: "flash-deactivated"
            });
          }
        }, maxWait);
      }
      _flashState.overdue = false;
      _embedSwf();
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.destroy`.
 * @private
 */
  var _destroy = function() {
    ZeroClipboard.clearData();
    ZeroClipboard.blur();
    ZeroClipboard.emit("destroy");
    _unembedSwf();
    ZeroClipboard.off();
  };
  /**
 * The underlying implementation of `ZeroClipboard.setData`.
 * @private
 */
  var _setData = function(format, data) {
    var dataObj;
    if (typeof format === "object" && format && typeof data === "undefined") {
      dataObj = format;
      ZeroClipboard.clearData();
    } else if (typeof format === "string" && format) {
      dataObj = {};
      dataObj[format] = data;
    } else {
      return;
    }
    for (var dataFormat in dataObj) {
      if (typeof dataFormat === "string" && dataFormat && _hasOwn.call(dataObj, dataFormat) && typeof dataObj[dataFormat] === "string" && dataObj[dataFormat]) {
        _clipData[dataFormat] = dataObj[dataFormat];
      }
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.clearData`.
 * @private
 */
  var _clearData = function(format) {
    if (typeof format === "undefined") {
      _deleteOwnProperties(_clipData);
      _clipDataFormatMap = null;
    } else if (typeof format === "string" && _hasOwn.call(_clipData, format)) {
      delete _clipData[format];
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.getData`.
 * @private
 */
  var _getData = function(format) {
    if (typeof format === "undefined") {
      return _deepCopy(_clipData);
    } else if (typeof format === "string" && _hasOwn.call(_clipData, format)) {
      return _clipData[format];
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.focus`/`ZeroClipboard.activate`.
 * @private
 */
  var _focus = function(element) {
    if (!(element && element.nodeType === 1)) {
      return;
    }
    if (_currentElement) {
      _removeClass(_currentElement, _globalConfig.activeClass);
      if (_currentElement !== element) {
        _removeClass(_currentElement, _globalConfig.hoverClass);
      }
    }
    _currentElement = element;
    _addClass(element, _globalConfig.hoverClass);
    /*var newTitle = element.getAttribute("title") || _globalConfig.title;
    if (typeof newTitle === "string" && newTitle) {
      var htmlBridge = _getHtmlBridge(_flashState.bridge);
      if (htmlBridge) {
        htmlBridge.setAttribute("title", newTitle);
      }
    }*/
    var useHandCursor = _globalConfig.forceHandCursor === true || _getStyle(element, "cursor") === "pointer";
    _setHandCursor(useHandCursor);
    _reposition();
  };
  /**
 * The underlying implementation of `ZeroClipboard.blur`/`ZeroClipboard.deactivate`.
 * @private
 */
  var _blur = function() {
    var htmlBridge = _getHtmlBridge(_flashState.bridge);
    if (htmlBridge) {
      htmlBridge.removeAttribute("title");
      htmlBridge.style.left = "0px";
      htmlBridge.style.top = "-9999px";
      htmlBridge.style.width = "1px";
      htmlBridge.style.top = "1px";
    }
    if (_currentElement) {
      _removeClass(_currentElement, _globalConfig.hoverClass);
      _removeClass(_currentElement, _globalConfig.activeClass);
      _currentElement = null;
    }
  };
  /**
 * The underlying implementation of `ZeroClipboard.activeElement`.
 * @private
 */
  var _activeElement = function() {
    return _currentElement || null;
  };
  /**
 * Check if a value is a valid HTML4 `ID` or `Name` token.
 * @private
 */
  var _isValidHtml4Id = function(id) {
    return typeof id === "string" && id && /^[A-Za-z][A-Za-z0-9_:\-\.]*$/.test(id);
  };
  /**
 * Create or update an `event` object, based on the `eventType`.
 * @private
 */
  var _createEvent = function(event) {
    var eventType;
    if (typeof event === "string" && event) {
      eventType = event;
      event = {};
    } else if (typeof event === "object" && event && typeof event.type === "string" && event.type) {
      eventType = event.type;
    }
    if (!eventType) {
      return;
    }
    if (!event.target && /^(copy|aftercopy|_click)$/.test(eventType.toLowerCase())) {
      event.target = _copyTarget;
    }
    _extend(event, {
      type: eventType.toLowerCase(),
      target: event.target || _currentElement || null,
      relatedTarget: event.relatedTarget || null,
      currentTarget: _flashState && _flashState.bridge || null,
      timeStamp: event.timeStamp || _now() || null
    });
    var msg = _eventMessages[event.type];
    if (event.type === "error" && event.name && msg) {
      msg = msg[event.name];
    }
    if (msg) {
      event.message = msg;
    }
    if (event.type === "ready") {
      _extend(event, {
        target: null,
        version: _flashState.version
      });
    }
    if (event.type === "error") {
      if (/^flash-(disabled|outdated|unavailable|deactivated|overdue)$/.test(event.name)) {
        _extend(event, {
          target: null,
          minimumVersion: _minimumFlashVersion
        });
      }
      if (/^flash-(outdated|unavailable|deactivated|overdue)$/.test(event.name)) {
        _extend(event, {
          version: _flashState.version
        });
      }
    }
    if (event.type === "copy") {
      event.clipboardData = {
        setData: ZeroClipboard.setData,
        clearData: ZeroClipboard.clearData
      };
    }
    if (event.type === "aftercopy") {
      event = _mapClipResultsFromFlash(event, _clipDataFormatMap);
    }
    if (event.target && !event.relatedTarget) {
      event.relatedTarget = _getRelatedTarget(event.target);
    }
    event = _addMouseData(event);
    return event;
  };
  /**
 * Get a relatedTarget from the target's `data-clipboard-target` attribute
 * @private
 */
  var _getRelatedTarget = function(targetEl) {
    var relatedTargetId = targetEl && targetEl.getAttribute && targetEl.getAttribute("data-clipboard-target");
    return relatedTargetId ? _document.getElementById(relatedTargetId) : null;
  };
  /**
 * Add element and position data to `MouseEvent` instances
 * @private
 */
  var _addMouseData = function(event) {
    if (event && /^_(?:click|mouse(?:over|out|down|up|move))$/.test(event.type)) {
      var srcElement = event.target;
      var fromElement = event.type === "_mouseover" && event.relatedTarget ? event.relatedTarget : undefined;
      var toElement = event.type === "_mouseout" && event.relatedTarget ? event.relatedTarget : undefined;
      var pos = _getDOMObjectPosition(srcElement);
      var screenLeft = _window.screenLeft || _window.screenX || 0;
      var screenTop = _window.screenTop || _window.screenY || 0;
      var scrollLeft = _document.body.scrollLeft + _document.documentElement.scrollLeft;
      var scrollTop = _document.body.scrollTop + _document.documentElement.scrollTop;
      var pageX = pos.left + (typeof event._stageX === "number" ? event._stageX : 0);
      var pageY = pos.top + (typeof event._stageY === "number" ? event._stageY : 0);
      var clientX = pageX - scrollLeft;
      var clientY = pageY - scrollTop;
      var screenX = screenLeft + clientX;
      var screenY = screenTop + clientY;
      var moveX = typeof event.movementX === "number" ? event.movementX : 0;
      var moveY = typeof event.movementY === "number" ? event.movementY : 0;
      delete event._stageX;
      delete event._stageY;
      _extend(event, {
        srcElement: srcElement,
        fromElement: fromElement,
        toElement: toElement,
        screenX: screenX,
        screenY: screenY,
        pageX: pageX,
        pageY: pageY,
        clientX: clientX,
        clientY: clientY,
        x: clientX,
        y: clientY,
        movementX: moveX,
        movementY: moveY,
        offsetX: 0,
        offsetY: 0,
        layerX: 0,
        layerY: 0
      });
    }
    return event;
  };
  /**
 * Determine if an event's registered handlers should be execute synchronously or asynchronously.
 *
 * @returns {boolean}
 * @private
 */
  var _shouldPerformAsync = function(event) {
    var eventType = event && typeof event.type === "string" && event.type || "";
    return !/^(?:(?:before)?copy|destroy)$/.test(eventType);
  };
  /**
 * Control if a callback should be executed asynchronously or not.
 *
 * @returns `undefined`
 * @private
 */
  var _dispatchCallback = function(func, context, args, async) {
    if (async) {
      _setTimeout(function() {
        func.apply(context, args);
      }, 0);
    } else {
      func.apply(context, args);
    }
  };
  /**
 * Handle the actual dispatching of events to client instances.
 *
 * @returns `undefined`
 * @private
 */
  var _dispatchCallbacks = function(event) {
    if (!(typeof event === "object" && event && event.type)) {
      return;
    }
    var async = _shouldPerformAsync(event);
    var wildcardTypeHandlers = _handlers["*"] || [];
    var specificTypeHandlers = _handlers[event.type] || [];
    var handlers = wildcardTypeHandlers.concat(specificTypeHandlers);
    if (handlers && handlers.length) {
      var i, len, func, context, eventCopy, originalContext = this;
      for (i = 0, len = handlers.length; i < len; i++) {
        func = handlers[i];
        context = originalContext;
        if (typeof func === "string" && typeof _window[func] === "function") {
          func = _window[func];
        }
        if (typeof func === "object" && func && typeof func.handleEvent === "function") {
          context = func;
          func = func.handleEvent;
        }
        if (typeof func === "function") {
          eventCopy = _extend({}, event);
          _dispatchCallback(func, context, [ eventCopy ], async);
        }
      }
    }
    return this;
  };
  /**
 * Preprocess any special behaviors, reactions, or state changes after receiving this event.
 * Executes only once per event emitted, NOT once per client.
 * @private
 */
  var _preprocessEvent = function(event) {
    var element = event.target || _currentElement || null;
    var sourceIsSwf = event._source === "swf";
    delete event._source;
    var flashErrorNames = [ "flash-disabled", "flash-outdated", "flash-unavailable", "flash-deactivated", "flash-overdue" ];
    switch (event.type) {
     case "error":
      if (flashErrorNames.indexOf(event.name) !== -1) {
        _extend(_flashState, {
          disabled: event.name === "flash-disabled",
          outdated: event.name === "flash-outdated",
          unavailable: event.name === "flash-unavailable",
          deactivated: event.name === "flash-deactivated",
          overdue: event.name === "flash-overdue",
          ready: false
        });
      }
      break;

     case "ready":
      var wasDeactivated = _flashState.deactivated === true;
      _extend(_flashState, {
        disabled: false,
        outdated: false,
        unavailable: false,
        deactivated: false,
        overdue: wasDeactivated,
        ready: !wasDeactivated
      });
      break;

     case "beforecopy":
      _copyTarget = element;
      break;

     case "copy":
      var textContent, htmlContent, targetEl = event.relatedTarget;
      if (!(_clipData["text/html"] || _clipData["text/plain"]) && targetEl && (htmlContent = targetEl.value || targetEl.outerHTML || targetEl.innerHTML) && (textContent = targetEl.value || targetEl.textContent || targetEl.innerText)) {
        event.clipboardData.clearData();
        event.clipboardData.setData("text/plain", textContent);
        if (htmlContent !== textContent) {
          event.clipboardData.setData("text/html", htmlContent);
        }
      } else if (!_clipData["text/plain"] && event.target && (textContent = event.target.getAttribute("data-clipboard-text"))) {
        event.clipboardData.clearData();
        event.clipboardData.setData("text/plain", textContent);
      }
      break;

     case "aftercopy":
      ZeroClipboard.clearData();
      if (element && element !== _safeActiveElement() && element.focus) {
        element.focus();
      }
      break;

     case "_mouseover":
      ZeroClipboard.focus(element);
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        if (element && element !== event.relatedTarget && !_containedBy(event.relatedTarget, element)) {
          _fireMouseEvent(_extend({}, event, {
            type: "mouseenter",
            bubbles: false,
            cancelable: false
          }));
        }
        _fireMouseEvent(_extend({}, event, {
          type: "mouseover"
        }));
      }
      break;

     case "_mouseout":
      ZeroClipboard.blur();
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        if (element && element !== event.relatedTarget && !_containedBy(event.relatedTarget, element)) {
          _fireMouseEvent(_extend({}, event, {
            type: "mouseleave",
            bubbles: false,
            cancelable: false
          }));
        }
        _fireMouseEvent(_extend({}, event, {
          type: "mouseout"
        }));
      }
      break;

     case "_mousedown":
      _addClass(element, _globalConfig.activeClass);
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;

     case "_mouseup":
      _removeClass(element, _globalConfig.activeClass);
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;

     case "_click":
      _copyTarget = null;
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;

     case "_mousemove":
      if (_globalConfig.bubbleEvents === true && sourceIsSwf) {
        _fireMouseEvent(_extend({}, event, {
          type: event.type.slice(1)
        }));
      }
      break;
    }
    if (/^_(?:click|mouse(?:over|out|down|up|move))$/.test(event.type)) {
      return true;
    }
  };
  /**
 * Dispatch a synthetic MouseEvent.
 *
 * @returns `undefined`
 * @private
 */
  var _fireMouseEvent = function(event) {
    if (!(event && typeof event.type === "string" && event)) {
      return;
    }
    var e, target = event.target || null, doc = target && target.ownerDocument || _document, defaults = {
      view: doc.defaultView || _window,
      canBubble: true,
      cancelable: true,
      detail: event.type === "click" ? 1 : 0,
      button: typeof event.which === "number" ? event.which - 1 : typeof event.button === "number" ? event.button : doc.createEvent ? 0 : 1
    }, args = _extend(defaults, event);
    if (!target) {
      return;
    }
    if (doc.createEvent && target.dispatchEvent) {
      args = [ args.type, args.canBubble, args.cancelable, args.view, args.detail, args.screenX, args.screenY, args.clientX, args.clientY, args.ctrlKey, args.altKey, args.shiftKey, args.metaKey, args.button, args.relatedTarget ];
      e = doc.createEvent("MouseEvents");
      if (e.initMouseEvent) {
        e.initMouseEvent.apply(e, args);
        e._source = "js";
        target.dispatchEvent(e);
      }
    }
  };
  /**
 * Create the HTML bridge element to embed the Flash object into.
 * @private
 */
  var _createHtmlBridge = function() {
    var container = _document.createElement("div");
    container.id = _globalConfig.containerId;
    container.className = _globalConfig.containerClass;
    container.style.position = "absolute";
    container.style.left = "0px";
    container.style.top = "-9999px";
    container.style.width = "1px";
    container.style.height = "1px";
    container.style.zIndex = "" + _getSafeZIndex(_globalConfig.zIndex);
    return container;
  };
  /**
 * Get the HTML element container that wraps the Flash bridge object/element.
 * @private
 */
  var _getHtmlBridge = function(flashBridge) {
    var htmlBridge = flashBridge && flashBridge.parentNode;
    while (htmlBridge && htmlBridge.nodeName === "OBJECT" && htmlBridge.parentNode) {
      htmlBridge = htmlBridge.parentNode;
    }
    return htmlBridge || null;
  };
  /**
 * Create the SWF object.
 *
 * @returns The SWF object reference.
 * @private
 */
  var _embedSwf = function() {
    var len, flashBridge = _flashState.bridge, container = _getHtmlBridge(flashBridge);
    if (!flashBridge) {
      var allowScriptAccess = _determineScriptAccess(_window.location.host, _globalConfig);
      var allowNetworking = allowScriptAccess === "never" ? "none" : "all";
      var flashvars = _vars(_globalConfig);
      var swfUrl = _globalConfig.swfPath + _cacheBust(_globalConfig.swfPath, _globalConfig);
      container = _createHtmlBridge();
      var divToBeReplaced = _document.createElement("div");
      container.appendChild(divToBeReplaced);
      _document.body.appendChild(container);
      var tmpDiv = _document.createElement("div");
      var oldIE = _flashState.pluginType === "activex";
      tmpDiv.innerHTML = '<object id="' + _globalConfig.swfObjectId + '" name="' + _globalConfig.swfObjectId + '" ' + 'width="100%" height="100%" ' + (oldIE ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000"' : 'type="application/x-shockwave-flash" data="' + swfUrl + '"') + ">" + (oldIE ? '<param name="movie" value="' + swfUrl + '"/>' : "") + '<param name="allowScriptAccess" value="' + allowScriptAccess + '"/>' + '<param name="allowNetworking" value="' + allowNetworking + '"/>' + '<param name="menu" value="false"/>' + '<param name="wmode" value="transparent"/>' + '<param name="flashvars" value="' + flashvars + '"/>' + "</object>";
      flashBridge = tmpDiv.firstChild;
      tmpDiv = null;
      _unwrap(flashBridge).ZeroClipboard = ZeroClipboard;
      container.replaceChild(flashBridge, divToBeReplaced);
    }
    if (!flashBridge) {
      flashBridge = _document[_globalConfig.swfObjectId];
      if (flashBridge && (len = flashBridge.length)) {
        flashBridge = flashBridge[len - 1];
      }
      if (!flashBridge && container) {
        flashBridge = container.firstChild;
      }
    }
    _flashState.bridge = flashBridge || null;
    return flashBridge;
  };
  /**
 * Destroy the SWF object.
 * @private
 */
  var _unembedSwf = function() {
    var flashBridge = _flashState.bridge;
    if (flashBridge) {
      var htmlBridge = _getHtmlBridge(flashBridge);
      if (htmlBridge) {
        if (_flashState.pluginType === "activex" && "readyState" in flashBridge) {
          flashBridge.style.display = "none";
          (function removeSwfFromIE() {
            if (flashBridge.readyState === 4) {
              for (var prop in flashBridge) {
                if (typeof flashBridge[prop] === "function") {
                  flashBridge[prop] = null;
                }
              }
              if (flashBridge.parentNode) {
                flashBridge.parentNode.removeChild(flashBridge);
              }
              if (htmlBridge.parentNode) {
                htmlBridge.parentNode.removeChild(htmlBridge);
              }
            } else {
              _setTimeout(removeSwfFromIE, 10);
            }
          })();
        } else {
          if (flashBridge.parentNode) {
            flashBridge.parentNode.removeChild(flashBridge);
          }
          if (htmlBridge.parentNode) {
            htmlBridge.parentNode.removeChild(htmlBridge);
          }
        }
      }
      _flashState.ready = null;
      _flashState.bridge = null;
      _flashState.deactivated = null;
    }
  };
  /**
 * Map the data format names of the "clipData" to Flash-friendly names.
 *
 * @returns A new transformed object.
 * @private
 */
  var _mapClipDataToFlash = function(clipData) {
    var newClipData = {}, formatMap = {};
    if (!(typeof clipData === "object" && clipData)) {
      return;
    }
    for (var dataFormat in clipData) {
      if (dataFormat && _hasOwn.call(clipData, dataFormat) && typeof clipData[dataFormat] === "string" && clipData[dataFormat]) {
        switch (dataFormat.toLowerCase()) {
         case "text/plain":
         case "text":
         case "air:text":
         case "flash:text":
          newClipData.text = clipData[dataFormat];
          formatMap.text = dataFormat;
          break;

         case "text/html":
         case "html":
         case "air:html":
         case "flash:html":
          newClipData.html = clipData[dataFormat];
          formatMap.html = dataFormat;
          break;

         case "application/rtf":
         case "text/rtf":
         case "rtf":
         case "richtext":
         case "air:rtf":
         case "flash:rtf":
          newClipData.rtf = clipData[dataFormat];
          formatMap.rtf = dataFormat;
          break;

         default:
          break;
        }
      }
    }
    return {
      data: newClipData,
      formatMap: formatMap
    };
  };
  /**
 * Map the data format names from Flash-friendly names back to their original "clipData" names (via a format mapping).
 *
 * @returns A new transformed object.
 * @private
 */
  var _mapClipResultsFromFlash = function(clipResults, formatMap) {
    if (!(typeof clipResults === "object" && clipResults && typeof formatMap === "object" && formatMap)) {
      return clipResults;
    }
    var newResults = {};
    for (var prop in clipResults) {
      if (_hasOwn.call(clipResults, prop)) {
        if (prop !== "success" && prop !== "data") {
          newResults[prop] = clipResults[prop];
          continue;
        }
        newResults[prop] = {};
        var tmpHash = clipResults[prop];
        for (var dataFormat in tmpHash) {
          if (dataFormat && _hasOwn.call(tmpHash, dataFormat) && _hasOwn.call(formatMap, dataFormat)) {
            newResults[prop][formatMap[dataFormat]] = tmpHash[dataFormat];
          }
        }
      }
    }
    return newResults;
  };
  /**
 * Will look at a path, and will create a "?noCache={time}" or "&noCache={time}"
 * query param string to return. Does NOT append that string to the original path.
 * This is useful because ExternalInterface often breaks when a Flash SWF is cached.
 *
 * @returns The `noCache` query param with necessary "?"/"&" prefix.
 * @private
 */
  var _cacheBust = function(path, options) {
    var cacheBust = options == null || options && options.cacheBust === true;
    if (cacheBust) {
      return (path.indexOf("?") === -1 ? "?" : "&") + "noCache=" + _now();
    } else {
      return "";
    }
  };
  /**
 * Creates a query string for the FlashVars param.
 * Does NOT include the cache-busting query param.
 *
 * @returns FlashVars query string
 * @private
 */
  var _vars = function(options) {
    var i, len, domain, domains, str = "", trustedOriginsExpanded = [];
    if (options.trustedDomains) {
      if (typeof options.trustedDomains === "string") {
        domains = [ options.trustedDomains ];
      } else if (typeof options.trustedDomains === "object" && "length" in options.trustedDomains) {
        domains = options.trustedDomains;
      }
    }
    if (domains && domains.length) {
      for (i = 0, len = domains.length; i < len; i++) {
        if (_hasOwn.call(domains, i) && domains[i] && typeof domains[i] === "string") {
          domain = _extractDomain(domains[i]);
          if (!domain) {
            continue;
          }
          if (domain === "*") {
            trustedOriginsExpanded.length = 0;
            trustedOriginsExpanded.push(domain);
            break;
          }
          trustedOriginsExpanded.push.apply(trustedOriginsExpanded, [ domain, "//" + domain, _window.location.protocol + "//" + domain ]);
        }
      }
    }
    if (trustedOriginsExpanded.length) {
      str += "trustedOrigins=" + _encodeURIComponent(trustedOriginsExpanded.join(","));
    }
    if (options.forceEnhancedClipboard === true) {
      str += (str ? "&" : "") + "forceEnhancedClipboard=true";
    }
    if (typeof options.swfObjectId === "string" && options.swfObjectId) {
      str += (str ? "&" : "") + "swfObjectId=" + _encodeURIComponent(options.swfObjectId);
    }
    return str;
  };
  /**
 * Extract the domain (e.g. "github.com") from an origin (e.g. "https://github.com") or
 * URL (e.g. "https://github.com/zeroclipboard/zeroclipboard/").
 *
 * @returns the domain
 * @private
 */
  var _extractDomain = function(originOrUrl) {
    if (originOrUrl == null || originOrUrl === "") {
      return null;
    }
    originOrUrl = originOrUrl.replace(/^\s+|\s+$/g, "");
    if (originOrUrl === "") {
      return null;
    }
    var protocolIndex = originOrUrl.indexOf("//");
    originOrUrl = protocolIndex === -1 ? originOrUrl : originOrUrl.slice(protocolIndex + 2);
    var pathIndex = originOrUrl.indexOf("/");
    originOrUrl = pathIndex === -1 ? originOrUrl : protocolIndex === -1 || pathIndex === 0 ? null : originOrUrl.slice(0, pathIndex);
    if (originOrUrl && originOrUrl.slice(-4).toLowerCase() === ".swf") {
      return null;
    }
    return originOrUrl || null;
  };
  /**
 * Set `allowScriptAccess` based on `trustedDomains` and `window.location.host` vs. `swfPath`.
 *
 * @returns The appropriate script access level.
 * @private
 */
  var _determineScriptAccess = function() {
    var _extractAllDomains = function(origins) {
      var i, len, tmp, resultsArray = [];
      if (typeof origins === "string") {
        origins = [ origins ];
      }
      if (!(typeof origins === "object" && origins && typeof origins.length === "number")) {
        return resultsArray;
      }
      for (i = 0, len = origins.length; i < len; i++) {
        if (_hasOwn.call(origins, i) && (tmp = _extractDomain(origins[i]))) {
          if (tmp === "*") {
            resultsArray.length = 0;
            resultsArray.push("*");
            break;
          }
          if (resultsArray.indexOf(tmp) === -1) {
            resultsArray.push(tmp);
          }
        }
      }
      return resultsArray;
    };
    return function(currentDomain, configOptions) {
      var swfDomain = _extractDomain(configOptions.swfPath);
      if (swfDomain === null) {
        swfDomain = currentDomain;
      }
      var trustedDomains = _extractAllDomains(configOptions.trustedDomains);
      var len = trustedDomains.length;
      if (len > 0) {
        if (len === 1 && trustedDomains[0] === "*") {
          return "always";
        }
        if (trustedDomains.indexOf(currentDomain) !== -1) {
          if (len === 1 && currentDomain === swfDomain) {
            return "sameDomain";
          }
          return "always";
        }
      }
      return "never";
    };
  }();
  /**
 * Get the currently active/focused DOM element.
 *
 * @returns the currently active/focused element, or `null`
 * @private
 */
  var _safeActiveElement = function() {
    try {
      return _document.activeElement;
    } catch (err) {
      return null;
    }
  };
  /**
 * Add a class to an element, if it doesn't already have it.
 *
 * @returns The element, with its new class added.
 * @private
 */
  var _addClass = function(element, value) {
    if (!element || element.nodeType !== 1) {
      return element;
    }
    if (element.classList) {
      if (!element.classList.contains(value)) {
        element.classList.add(value);
      }
      return element;
    }
    if (value && typeof value === "string") {
      var classNames = (value || "").split(/\s+/);
      if (element.nodeType === 1) {
        if (!element.className) {
          element.className = value;
        } else {
          var className = " " + element.className + " ", setClass = element.className;
          for (var c = 0, cl = classNames.length; c < cl; c++) {
            if (className.indexOf(" " + classNames[c] + " ") < 0) {
              setClass += " " + classNames[c];
            }
          }
          element.className = setClass.replace(/^\s+|\s+$/g, "");
        }
      }
    }
    return element;
  };
  /**
 * Remove a class from an element, if it has it.
 *
 * @returns The element, with its class removed.
 * @private
 */
  var _removeClass = function(element, value) {
    if (!element || element.nodeType !== 1) {
      return element;
    }
    if (element.classList) {
      if (element.classList.contains(value)) {
        element.classList.remove(value);
      }
      return element;
    }
    if (typeof value === "string" && value) {
      var classNames = value.split(/\s+/);
      if (element.nodeType === 1 && element.className) {
        var className = (" " + element.className + " ").replace(/[\n\t]/g, " ");
        for (var c = 0, cl = classNames.length; c < cl; c++) {
          className = className.replace(" " + classNames[c] + " ", " ");
        }
        element.className = className.replace(/^\s+|\s+$/g, "");
      }
    }
    return element;
  };
  /**
 * Attempt to interpret the element's CSS styling. If `prop` is `"cursor"`,
 * then we assume that it should be a hand ("pointer") cursor if the element
 * is an anchor element ("a" tag).
 *
 * @returns The computed style property.
 * @private
 */
  var _getStyle = function(el, prop) {
    var value = _window.getComputedStyle(el, null).getPropertyValue(prop);
    if (prop === "cursor") {
      if (!value || value === "auto") {
        if (el.nodeName === "A") {
          return "pointer";
        }
      }
    }
    return value;
  };
  /**
 * Get the zoom factor of the browser. Always returns `1.0`, except at
 * non-default zoom levels in IE<8 and some older versions of WebKit.
 *
 * @returns Floating unit percentage of the zoom factor (e.g. 150% = `1.5`).
 * @private
 */
  var _getZoomFactor = function() {
    var rect, physicalWidth, logicalWidth, zoomFactor = 1;
    if (typeof _document.body.getBoundingClientRect === "function") {
      rect = _document.body.getBoundingClientRect();
      physicalWidth = rect.right - rect.left;
      logicalWidth = _document.body.offsetWidth;
      zoomFactor = _round(physicalWidth / logicalWidth * 100) / 100;
    }
    return zoomFactor;
  };
  /**
 * Get the DOM positioning info of an element.
 *
 * @returns Object containing the element's position, width, and height.
 * @private
 */
  var _getDOMObjectPosition = function(obj) {
    var info = {
      left: 0,
      top: 0,
      width: 0,
      height: 0
    };
    if (obj.getBoundingClientRect) {
      var rect = obj.getBoundingClientRect();
      var pageXOffset, pageYOffset, zoomFactor;
      if ("pageXOffset" in _window && "pageYOffset" in _window) {
        pageXOffset = _window.pageXOffset;
        pageYOffset = _window.pageYOffset;
      } else {
        zoomFactor = _getZoomFactor();
        pageXOffset = _round(_document.documentElement.scrollLeft / zoomFactor);
        pageYOffset = _round(_document.documentElement.scrollTop / zoomFactor);
      }
      var leftBorderWidth = _document.documentElement.clientLeft || 0;
      var topBorderWidth = _document.documentElement.clientTop || 0;
      info.left = rect.left + pageXOffset - leftBorderWidth;
      info.top = rect.top + pageYOffset - topBorderWidth;
      info.width = "width" in rect ? rect.width : rect.right - rect.left;
      info.height = "height" in rect ? rect.height : rect.bottom - rect.top;
    }
    return info;
  };
  /**
 * Reposition the Flash object to cover the currently activated element.
 *
 * @returns `undefined`
 * @private
 */
  var _reposition = function() {
    var htmlBridge;
    if (_currentElement && (htmlBridge = _getHtmlBridge(_flashState.bridge))) {
      var pos = _getDOMObjectPosition(_currentElement);
      _extend(htmlBridge.style, {
        width: pos.width + "px",
        height: pos.height + "px",
        top: pos.top + "px",
        left: pos.left + "px",
        zIndex: "" + _getSafeZIndex(_globalConfig.zIndex)
      });
    }
  };
  /**
 * Sends a signal to the Flash object to display the hand cursor if `true`.
 *
 * @returns `undefined`
 * @private
 */
  var _setHandCursor = function(enabled) {
    if (_flashState.ready === true) {
      if (_flashState.bridge && typeof _flashState.bridge.setHandCursor === "function") {
        _flashState.bridge.setHandCursor(enabled);
      } else {
        _flashState.ready = false;
      }
    }
  };
  /**
 * Get a safe value for `zIndex`
 *
 * @returns an integer, or "auto"
 * @private
 */
  var _getSafeZIndex = function(val) {
    if (/^(?:auto|inherit)$/.test(val)) {
      return val;
    }
    var zIndex;
    if (typeof val === "number" && !_isNaN(val)) {
      zIndex = val;
    } else if (typeof val === "string") {
      zIndex = _getSafeZIndex(_parseInt(val, 10));
    }
    return typeof zIndex === "number" ? zIndex : "auto";
  };
  /**
 * Detect the Flash Player status, version, and plugin type.
 *
 * @see {@link https://code.google.com/p/doctype-mirror/wiki/ArticleDetectFlash#The_code}
 * @see {@link http://stackoverflow.com/questions/12866060/detecting-pepper-ppapi-flash-with-javascript}
 *
 * @returns `undefined`
 * @private
 */
  var _detectFlashSupport = function(ActiveXObject) {
    var plugin, ax, mimeType, hasFlash = false, isActiveX = false, isPPAPI = false, flashVersion = "";
    /**
   * Derived from Apple's suggested sniffer.
   * @param {String} desc e.g. "Shockwave Flash 7.0 r61"
   * @returns {String} "7.0.61"
   * @private
   */
    function parseFlashVersion(desc) {
      var matches = desc.match(/[\d]+/g);
      matches.length = 3;
      return matches.join(".");
    }
    function isPepperFlash(flashPlayerFileName) {
      return !!flashPlayerFileName && (flashPlayerFileName = flashPlayerFileName.toLowerCase()) && (/^(pepflashplayer\.dll|libpepflashplayer\.so|pepperflashplayer\.plugin)$/.test(flashPlayerFileName) || flashPlayerFileName.slice(-13) === "chrome.plugin");
    }
    function inspectPlugin(plugin) {
      if (plugin) {
        hasFlash = true;
        if (plugin.version) {
          flashVersion = parseFlashVersion(plugin.version);
        }
        if (!flashVersion && plugin.description) {
          flashVersion = parseFlashVersion(plugin.description);
        }
        if (plugin.filename) {
          isPPAPI = isPepperFlash(plugin.filename);
        }
      }
    }
    if (_navigator.plugins && _navigator.plugins.length) {
      plugin = _navigator.plugins["Shockwave Flash"];
      inspectPlugin(plugin);
      if (_navigator.plugins["Shockwave Flash 2.0"]) {
        hasFlash = true;
        flashVersion = "2.0.0.11";
      }
    } else if (_navigator.mimeTypes && _navigator.mimeTypes.length) {
      mimeType = _navigator.mimeTypes["application/x-shockwave-flash"];
      plugin = mimeType && mimeType.enabledPlugin;
      inspectPlugin(plugin);
    } else if (typeof ActiveXObject !== "undefined") {
      isActiveX = true;
      try {
        ax = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
        hasFlash = true;
        flashVersion = parseFlashVersion(ax.GetVariable("$version"));
      } catch (e1) {
        try {
          ax = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
          hasFlash = true;
          flashVersion = "6.0.21";
        } catch (e2) {
          try {
            ax = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
            hasFlash = true;
            flashVersion = parseFlashVersion(ax.GetVariable("$version"));
          } catch (e3) {
            isActiveX = false;
          }
        }
      }
    }
    _flashState.disabled = hasFlash !== true;
    _flashState.outdated = flashVersion && _parseFloat(flashVersion) < _parseFloat(_minimumFlashVersion);
    _flashState.version = flashVersion || "0.0.0";
    _flashState.pluginType = isPPAPI ? "pepper" : isActiveX ? "activex" : hasFlash ? "netscape" : "unknown";
  };
  /**
 * Invoke the Flash detection algorithms immediately upon inclusion so we're not waiting later.
 */
  _detectFlashSupport(_ActiveXObject);
  /**
 * A shell constructor for `ZeroClipboard` client instances.
 *
 * @constructor
 */
  var ZeroClipboard = function() {
    if (!(this instanceof ZeroClipboard)) {
      return new ZeroClipboard();
    }
    if (typeof ZeroClipboard._createClient === "function") {
      ZeroClipboard._createClient.apply(this, _args(arguments));
    }
  };
  /**
 * The ZeroClipboard library's version number.
 *
 * @static
 * @readonly
 * @property {string}
 */
  _defineProperty(ZeroClipboard, "version", {
    value: "2.1.6",
    writable: false,
    configurable: true,
    enumerable: true
  });
  /**
 * Update or get a copy of the ZeroClipboard global configuration.
 * Returns a copy of the current/updated configuration.
 *
 * @returns Object
 * @static
 */
  ZeroClipboard.config = function() {
    return _config.apply(this, _args(arguments));
  };
  /**
 * Diagnostic method that describes the state of the browser, Flash Player, and ZeroClipboard.
 *
 * @returns Object
 * @static
 */
  ZeroClipboard.state = function() {
    return _state.apply(this, _args(arguments));
  };
  /**
 * Check if Flash is unusable for any reason: disabled, outdated, deactivated, etc.
 *
 * @returns Boolean
 * @static
 */
  ZeroClipboard.isFlashUnusable = function() {
    return _isFlashUnusable.apply(this, _args(arguments));
  };
  /**
 * Register an event listener.
 *
 * @returns `ZeroClipboard`
 * @static
 */
  ZeroClipboard.on = function() {
    return _on.apply(this, _args(arguments));
  };
  /**
 * Unregister an event listener.
 * If no `listener` function/object is provided, it will unregister all listeners for the provided `eventType`.
 * If no `eventType` is provided, it will unregister all listeners for every event type.
 *
 * @returns `ZeroClipboard`
 * @static
 */
  ZeroClipboard.off = function() {
    return _off.apply(this, _args(arguments));
  };
  /**
 * Retrieve event listeners for an `eventType`.
 * If no `eventType` is provided, it will retrieve all listeners for every event type.
 *
 * @returns array of listeners for the `eventType`; if no `eventType`, then a map/hash object of listeners for all event types; or `null`
 */
  ZeroClipboard.handlers = function() {
    return _listeners.apply(this, _args(arguments));
  };
  /**
 * Event emission receiver from the Flash object, forwarding to any registered JavaScript event listeners.
 *
 * @returns For the "copy" event, returns the Flash-friendly "clipData" object; otherwise `undefined`.
 * @static
 */
  ZeroClipboard.emit = function() {
    return _emit.apply(this, _args(arguments));
  };
  /**
 * Create and embed the Flash object.
 *
 * @returns The Flash object
 * @static
 */
  ZeroClipboard.create = function() {
    return _create.apply(this, _args(arguments));
  };
  /**
 * Self-destruct and clean up everything, including the embedded Flash object.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.destroy = function() {
    return _destroy.apply(this, _args(arguments));
  };
  /**
 * Set the pending data for clipboard injection.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.setData = function() {
    return _setData.apply(this, _args(arguments));
  };
  /**
 * Clear the pending data for clipboard injection.
 * If no `format` is provided, all pending data formats will be cleared.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.clearData = function() {
    return _clearData.apply(this, _args(arguments));
  };
  /**
 * Get a copy of the pending data for clipboard injection.
 * If no `format` is provided, a copy of ALL pending data formats will be returned.
 *
 * @returns `String` or `Object`
 * @static
 */
  ZeroClipboard.getData = function() {
    return _getData.apply(this, _args(arguments));
  };
  /**
 * Sets the current HTML object that the Flash object should overlay. This will put the global
 * Flash object on top of the current element; depending on the setup, this may also set the
 * pending clipboard text data as well as the Flash object's wrapping element's title attribute
 * based on the underlying HTML element and ZeroClipboard configuration.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.focus = ZeroClipboard.activate = function() {
    return _focus.apply(this, _args(arguments));
  };
  /**
 * Un-overlays the Flash object. This will put the global Flash object off-screen; depending on
 * the setup, this may also unset the Flash object's wrapping element's title attribute based on
 * the underlying HTML element and ZeroClipboard configuration.
 *
 * @returns `undefined`
 * @static
 */
  ZeroClipboard.blur = ZeroClipboard.deactivate = function() {
    return _blur.apply(this, _args(arguments));
  };
  /**
 * Returns the currently focused/"activated" HTML element that the Flash object is wrapping.
 *
 * @returns `HTMLElement` or `null`
 * @static
 */
  ZeroClipboard.activeElement = function() {
    return _activeElement.apply(this, _args(arguments));
  };
  /**
 * Keep track of the ZeroClipboard client instance counter.
 */
  var _clientIdCounter = 0;
  /**
 * Keep track of the state of the client instances.
 *
 * Entry structure:
 *   _clientMeta[client.id] = {
 *     instance: client,
 *     elements: [],
 *     handlers: {}
 *   };
 */
  var _clientMeta = {};
  /**
 * Keep track of the ZeroClipboard clipped elements counter.
 */
  var _elementIdCounter = 0;
  /**
 * Keep track of the state of the clipped element relationships to clients.
 *
 * Entry structure:
 *   _elementMeta[element.zcClippingId] = [client1.id, client2.id];
 */
  var _elementMeta = {};
  /**
 * Keep track of the state of the mouse event handlers for clipped elements.
 *
 * Entry structure:
 *   _mouseHandlers[element.zcClippingId] = {
 *     mouseover:  function(event) {},
 *     mouseout:   function(event) {},
 *     mouseenter: function(event) {},
 *     mouseleave: function(event) {},
 *     mousemove:  function(event) {}
 *   };
 */
  var _mouseHandlers = {};
  /**
 * Extending the ZeroClipboard configuration defaults for the Client module.
 */
  _extend(_globalConfig, {
    autoActivate: true
  });
  /**
 * The real constructor for `ZeroClipboard` client instances.
 * @private
 */
  var _clientConstructor = function(elements) {
    var client = this;
    client.id = "" + _clientIdCounter++;
    _clientMeta[client.id] = {
      instance: client,
      elements: [],
      handlers: {}
    };
    if (elements) {
      client.clip(elements);
    }
    ZeroClipboard.on("*", function(event) {
      return client.emit(event);
    });
    ZeroClipboard.on("destroy", function() {
      client.destroy();
    });
    ZeroClipboard.create();
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.on`.
 * @private
 */
  var _clientOn = function(eventType, listener) {
    var i, len, events, added = {}, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
    if (typeof eventType === "string" && eventType) {
      events = eventType.toLowerCase().split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          this.on(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].replace(/^on/, "");
        added[eventType] = true;
        if (!handlers[eventType]) {
          handlers[eventType] = [];
        }
        handlers[eventType].push(listener);
      }
      if (added.ready && _flashState.ready) {
        this.emit({
          type: "ready",
          client: this
        });
      }
      if (added.error) {
        var errorTypes = [ "disabled", "outdated", "unavailable", "deactivated", "overdue" ];
        for (i = 0, len = errorTypes.length; i < len; i++) {
          if (_flashState[errorTypes[i]]) {
            this.emit({
              type: "error",
              name: "flash-" + errorTypes[i],
              client: this
            });
            break;
          }
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.off`.
 * @private
 */
  var _clientOff = function(eventType, listener) {
    var i, len, foundIndex, events, perEventHandlers, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
    if (arguments.length === 0) {
      events = _keys(handlers);
    } else if (typeof eventType === "string" && eventType) {
      events = eventType.split(/\s+/);
    } else if (typeof eventType === "object" && eventType && typeof listener === "undefined") {
      for (i in eventType) {
        if (_hasOwn.call(eventType, i) && typeof i === "string" && i && typeof eventType[i] === "function") {
          this.off(i, eventType[i]);
        }
      }
    }
    if (events && events.length) {
      for (i = 0, len = events.length; i < len; i++) {
        eventType = events[i].toLowerCase().replace(/^on/, "");
        perEventHandlers = handlers[eventType];
        if (perEventHandlers && perEventHandlers.length) {
          if (listener) {
            foundIndex = perEventHandlers.indexOf(listener);
            while (foundIndex !== -1) {
              perEventHandlers.splice(foundIndex, 1);
              foundIndex = perEventHandlers.indexOf(listener, foundIndex);
            }
          } else {
            perEventHandlers.length = 0;
          }
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.handlers`.
 * @private
 */
  var _clientListeners = function(eventType) {
    var copy = null, handlers = _clientMeta[this.id] && _clientMeta[this.id].handlers;
    if (handlers) {
      if (typeof eventType === "string" && eventType) {
        copy = handlers[eventType] ? handlers[eventType].slice(0) : [];
      } else {
        copy = _deepCopy(handlers);
      }
    }
    return copy;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.emit`.
 * @private
 */
  var _clientEmit = function(event) {
    if (_clientShouldEmit.call(this, event)) {
      if (typeof event === "object" && event && typeof event.type === "string" && event.type) {
        event = _extend({}, event);
      }
      var eventCopy = _extend({}, _createEvent(event), {
        client: this
      });
      _clientDispatchCallbacks.call(this, eventCopy);
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.clip`.
 * @private
 */
  var _clientClip = function(elements) {
    elements = _prepClip(elements);
    for (var i = 0; i < elements.length; i++) {
      if (_hasOwn.call(elements, i) && elements[i] && elements[i].nodeType === 1) {
        if (!elements[i].zcClippingId) {
          elements[i].zcClippingId = "zcClippingId_" + _elementIdCounter++;
          _elementMeta[elements[i].zcClippingId] = [ this.id ];
          if (_globalConfig.autoActivate === true) {
            _addMouseHandlers(elements[i]);
          }
        } else if (_elementMeta[elements[i].zcClippingId].indexOf(this.id) === -1) {
          _elementMeta[elements[i].zcClippingId].push(this.id);
        }
        var clippedElements = _clientMeta[this.id] && _clientMeta[this.id].elements;
        if (clippedElements.indexOf(elements[i]) === -1) {
          clippedElements.push(elements[i]);
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.unclip`.
 * @private
 */
  var _clientUnclip = function(elements) {
    var meta = _clientMeta[this.id];
    if (!meta) {
      return this;
    }
    var clippedElements = meta.elements;
    var arrayIndex;
    if (typeof elements === "undefined") {
      elements = clippedElements.slice(0);
    } else {
      elements = _prepClip(elements);
    }
    for (var i = elements.length; i--; ) {
      if (_hasOwn.call(elements, i) && elements[i] && elements[i].nodeType === 1) {
        arrayIndex = 0;
        while ((arrayIndex = clippedElements.indexOf(elements[i], arrayIndex)) !== -1) {
          clippedElements.splice(arrayIndex, 1);
        }
        var clientIds = _elementMeta[elements[i].zcClippingId];
        if (clientIds) {
          arrayIndex = 0;
          while ((arrayIndex = clientIds.indexOf(this.id, arrayIndex)) !== -1) {
            clientIds.splice(arrayIndex, 1);
          }
          if (clientIds.length === 0) {
            if (_globalConfig.autoActivate === true) {
              _removeMouseHandlers(elements[i]);
            }
            delete elements[i].zcClippingId;
          }
        }
      }
    }
    return this;
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.elements`.
 * @private
 */
  var _clientElements = function() {
    var meta = _clientMeta[this.id];
    return meta && meta.elements ? meta.elements.slice(0) : [];
  };
  /**
 * The underlying implementation of `ZeroClipboard.Client.prototype.destroy`.
 * @private
 */
  var _clientDestroy = function() {
    this.unclip();
    this.off();
    delete _clientMeta[this.id];
  };
  /**
 * Inspect an Event to see if the Client (`this`) should honor it for emission.
 * @private
 */
  var _clientShouldEmit = function(event) {
    if (!(event && event.type)) {
      return false;
    }
    if (event.client && event.client !== this) {
      return false;
    }
    var clippedEls = _clientMeta[this.id] && _clientMeta[this.id].elements;
    var hasClippedEls = !!clippedEls && clippedEls.length > 0;
    var goodTarget = !event.target || hasClippedEls && clippedEls.indexOf(event.target) !== -1;
    var goodRelTarget = event.relatedTarget && hasClippedEls && clippedEls.indexOf(event.relatedTarget) !== -1;
    var goodClient = event.client && event.client === this;
    if (!(goodTarget || goodRelTarget || goodClient)) {
      return false;
    }
    return true;
  };
  /**
 * Handle the actual dispatching of events to a client instance.
 *
 * @returns `this`
 * @private
 */
  var _clientDispatchCallbacks = function(event) {
    if (!(typeof event === "object" && event && event.type)) {
      return;
    }
    var async = _shouldPerformAsync(event);
    var wildcardTypeHandlers = _clientMeta[this.id] && _clientMeta[this.id].handlers["*"] || [];
    var specificTypeHandlers = _clientMeta[this.id] && _clientMeta[this.id].handlers[event.type] || [];
    var handlers = wildcardTypeHandlers.concat(specificTypeHandlers);
    if (handlers && handlers.length) {
      var i, len, func, context, eventCopy, originalContext = this;
      for (i = 0, len = handlers.length; i < len; i++) {
        func = handlers[i];
        context = originalContext;
        if (typeof func === "string" && typeof _window[func] === "function") {
          func = _window[func];
        }
        if (typeof func === "object" && func && typeof func.handleEvent === "function") {
          context = func;
          func = func.handleEvent;
        }
        if (typeof func === "function") {
          eventCopy = _extend({}, event);
          _dispatchCallback(func, context, [ eventCopy ], async);
        }
      }
    }
    return this;
  };
  /**
 * Prepares the elements for clipping/unclipping.
 *
 * @returns An Array of elements.
 * @private
 */
  var _prepClip = function(elements) {
    if (typeof elements === "string") {
      elements = [];
    }
    return typeof elements.length !== "number" ? [ elements ] : elements;
  };
  /**
 * Add a `mouseover` handler function for a clipped element.
 *
 * @returns `undefined`
 * @private
 */
  var _addMouseHandlers = function(element) {
    if (!(element && element.nodeType === 1)) {
      return;
    }
    var _suppressMouseEvents = function(event) {
      if (!(event || (event = _window.event))) {
        return;
      }
      if (event._source !== "js") {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
      delete event._source;
    };
    var _elementMouseOver = function(event) {
      if (!(event || (event = _window.event))) {
        return;
      }
      _suppressMouseEvents(event);
      ZeroClipboard.focus(element);
    };
    element.addEventListener("mouseover", _elementMouseOver, false);
    element.addEventListener("mouseout", _suppressMouseEvents, false);
    element.addEventListener("mouseenter", _suppressMouseEvents, false);
    element.addEventListener("mouseleave", _suppressMouseEvents, false);
    element.addEventListener("mousemove", _suppressMouseEvents, false);
    _mouseHandlers[element.zcClippingId] = {
      mouseover: _elementMouseOver,
      mouseout: _suppressMouseEvents,
      mouseenter: _suppressMouseEvents,
      mouseleave: _suppressMouseEvents,
      mousemove: _suppressMouseEvents
    };
  };
  /**
 * Remove a `mouseover` handler function for a clipped element.
 *
 * @returns `undefined`
 * @private
 */
  var _removeMouseHandlers = function(element) {
    if (!(element && element.nodeType === 1)) {
      return;
    }
    var mouseHandlers = _mouseHandlers[element.zcClippingId];
    if (!(typeof mouseHandlers === "object" && mouseHandlers)) {
      return;
    }
    var key, val, mouseEvents = [ "move", "leave", "enter", "out", "over" ];
    for (var i = 0, len = mouseEvents.length; i < len; i++) {
      key = "mouse" + mouseEvents[i];
      val = mouseHandlers[key];
      if (typeof val === "function") {
        element.removeEventListener(key, val, false);
      }
    }
    delete _mouseHandlers[element.zcClippingId];
  };
  /**
 * Creates a new ZeroClipboard client instance.
 * Optionally, auto-`clip` an element or collection of elements.
 *
 * @constructor
 */
  ZeroClipboard._createClient = function() {
    _clientConstructor.apply(this, _args(arguments));
  };
  /**
 * Register an event listener to the client.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.on = function() {
    return _clientOn.apply(this, _args(arguments));
  };
  /**
 * Unregister an event handler from the client.
 * If no `listener` function/object is provided, it will unregister all handlers for the provided `eventType`.
 * If no `eventType` is provided, it will unregister all handlers for every event type.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.off = function() {
    return _clientOff.apply(this, _args(arguments));
  };
  /**
 * Retrieve event listeners for an `eventType` from the client.
 * If no `eventType` is provided, it will retrieve all listeners for every event type.
 *
 * @returns array of listeners for the `eventType`; if no `eventType`, then a map/hash object of listeners for all event types; or `null`
 */
  ZeroClipboard.prototype.handlers = function() {
    return _clientListeners.apply(this, _args(arguments));
  };
  /**
 * Event emission receiver from the Flash object for this client's registered JavaScript event listeners.
 *
 * @returns For the "copy" event, returns the Flash-friendly "clipData" object; otherwise `undefined`.
 */
  ZeroClipboard.prototype.emit = function() {
    return _clientEmit.apply(this, _args(arguments));
  };
  /**
 * Register clipboard actions for new element(s) to the client.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.clip = function() {
    return _clientClip.apply(this, _args(arguments));
  };
  /**
 * Unregister the clipboard actions of previously registered element(s) on the page.
 * If no elements are provided, ALL registered elements will be unregistered.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.unclip = function() {
    return _clientUnclip.apply(this, _args(arguments));
  };
  /**
 * Get all of the elements to which this client is clipped.
 *
 * @returns array of clipped elements
 */
  ZeroClipboard.prototype.elements = function() {
    return _clientElements.apply(this, _args(arguments));
  };
  /**
 * Self-destruct and clean up everything for a single client.
 * This will NOT destroy the embedded Flash object.
 *
 * @returns `undefined`
 */
  ZeroClipboard.prototype.destroy = function() {
    return _clientDestroy.apply(this, _args(arguments));
  };
  /**
 * Stores the pending plain text to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setText = function(text) {
    ZeroClipboard.setData("text/plain", text);
    return this;
  };
  /**
 * Stores the pending HTML text to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setHtml = function(html) {
    ZeroClipboard.setData("text/html", html);
    return this;
  };
  /**
 * Stores the pending rich text (RTF) to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setRichText = function(richText) {
    ZeroClipboard.setData("application/rtf", richText);
    return this;
  };
  /**
 * Stores the pending data to inject into the clipboard.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.setData = function() {
    ZeroClipboard.setData.apply(this, _args(arguments));
    return this;
  };
  /**
 * Clears the pending data to inject into the clipboard.
 * If no `format` is provided, all pending data formats will be cleared.
 *
 * @returns `this`
 */
  ZeroClipboard.prototype.clearData = function() {
    ZeroClipboard.clearData.apply(this, _args(arguments));
    return this;
  };
  /**
 * Gets a copy of the pending data to inject into the clipboard.
 * If no `format` is provided, a copy of ALL pending data formats will be returned.
 *
 * @returns `String` or `Object`
 */
  ZeroClipboard.prototype.getData = function() {
    return ZeroClipboard.getData.apply(this, _args(arguments));
  };
  if (typeof define === "function" && define.amd) {
    define(function() {
      return ZeroClipboard;
    });
  } else if (typeof module === "object" && module && typeof module.exports === "object" && module.exports) {
    module.exports = ZeroClipboard;
  } else {
    window.ZeroClipboard = ZeroClipboard;
  }
})(function() {
  return this || window;
}());
/*! jQuery UI - v1.11.1 - 2014-10-13
* http://jqueryui.com
* Includes: core.js, widget.js, position.js, tooltip.js
* Copyright 2014 jQuery Foundation and other contributors; Licensed MIT */

(function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}(function( $ ) {
/*!
 * jQuery UI Core 1.11.1
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/category/ui-core/
 */


// $.ui might exist from components with no dependencies, e.g., $.ui.position
$.ui = $.ui || {};

$.extend( $.ui, {
	version: "1.11.1",

	keyCode: {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	}
});

// plugins
$.fn.extend({
	scrollParent: function( includeHidden ) {
		var position = this.css( "position" ),
			excludeStaticParent = position === "absolute",
			overflowRegex = includeHidden ? /(auto|scroll|hidden)/ : /(auto|scroll)/,
			scrollParent = this.parents().filter( function() {
				var parent = $( this );
				if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
					return false;
				}
				return overflowRegex.test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
			}).eq( 0 );

		return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
	},

	uniqueId: (function() {
		var uuid = 0;

		return function() {
			return this.each(function() {
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid );
				}
			});
		};
	})(),

	removeUniqueId: function() {
		return this.each(function() {
			if ( /^ui-id-\d+$/.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		});
	}
});

// selectors
function focusable( element, isTabIndexNotNaN ) {
	var map, mapName, img,
		nodeName = element.nodeName.toLowerCase();
	if ( "area" === nodeName ) {
		map = element.parentNode;
		mapName = map.name;
		if ( !element.href || !mapName || map.nodeName.toLowerCase() !== "map" ) {
			return false;
		}
		img = $( "img[usemap='#" + mapName + "']" )[ 0 ];
		return !!img && visible( img );
	}
	return ( /input|select|textarea|button|object/.test( nodeName ) ?
		!element.disabled :
		"a" === nodeName ?
			element.href || isTabIndexNotNaN :
			isTabIndexNotNaN) &&
		// the element and all of its ancestors must be visible
		visible( element );
}

function visible( element ) {
	return $.expr.filters.visible( element ) &&
		!$( element ).parents().addBack().filter(function() {
			return $.css( this, "visibility" ) === "hidden";
		}).length;
}

$.extend( $.expr[ ":" ], {
	data: $.expr.createPseudo ?
		$.expr.createPseudo(function( dataName ) {
			return function( elem ) {
				return !!$.data( elem, dataName );
			};
		}) :
		// support: jQuery <1.8
		function( elem, i, match ) {
			return !!$.data( elem, match[ 3 ] );
		},

	focusable: function( element ) {
		return focusable( element, !isNaN( $.attr( element, "tabindex" ) ) );
	},

	tabbable: function( element ) {
		var tabIndex = $.attr( element, "tabindex" ),
			isTabIndexNaN = isNaN( tabIndex );
		return ( isTabIndexNaN || tabIndex >= 0 ) && focusable( element, !isTabIndexNaN );
	}
});

// support: jQuery <1.8
if ( !$( "<a>" ).outerWidth( 1 ).jquery ) {
	$.each( [ "Width", "Height" ], function( i, name ) {
		var side = name === "Width" ? [ "Left", "Right" ] : [ "Top", "Bottom" ],
			type = name.toLowerCase(),
			orig = {
				innerWidth: $.fn.innerWidth,
				innerHeight: $.fn.innerHeight,
				outerWidth: $.fn.outerWidth,
				outerHeight: $.fn.outerHeight
			};

		function reduce( elem, size, border, margin ) {
			$.each( side, function() {
				size -= parseFloat( $.css( elem, "padding" + this ) ) || 0;
				if ( border ) {
					size -= parseFloat( $.css( elem, "border" + this + "Width" ) ) || 0;
				}
				if ( margin ) {
					size -= parseFloat( $.css( elem, "margin" + this ) ) || 0;
				}
			});
			return size;
		}

		$.fn[ "inner" + name ] = function( size ) {
			if ( size === undefined ) {
				return orig[ "inner" + name ].call( this );
			}

			return this.each(function() {
				$( this ).css( type, reduce( this, size ) + "px" );
			});
		};

		$.fn[ "outer" + name] = function( size, margin ) {
			if ( typeof size !== "number" ) {
				return orig[ "outer" + name ].call( this, size );
			}

			return this.each(function() {
				$( this).css( type, reduce( this, size, true, margin ) + "px" );
			});
		};
	});
}

// support: jQuery <1.8
if ( !$.fn.addBack ) {
	$.fn.addBack = function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter( selector )
		);
	};
}

// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
if ( $( "<a>" ).data( "a-b", "a" ).removeData( "a-b" ).data( "a-b" ) ) {
	$.fn.removeData = (function( removeData ) {
		return function( key ) {
			if ( arguments.length ) {
				return removeData.call( this, $.camelCase( key ) );
			} else {
				return removeData.call( this );
			}
		};
	})( $.fn.removeData );
}

// deprecated
$.ui.ie = !!/msie [\w.]+/.exec( navigator.userAgent.toLowerCase() );

$.fn.extend({
	focus: (function( orig ) {
		return function( delay, fn ) {
			return typeof delay === "number" ?
				this.each(function() {
					var elem = this;
					setTimeout(function() {
						$( elem ).focus();
						if ( fn ) {
							fn.call( elem );
						}
					}, delay );
				}) :
				orig.apply( this, arguments );
		};
	})( $.fn.focus ),

	disableSelection: (function() {
		var eventType = "onselectstart" in document.createElement( "div" ) ?
			"selectstart" :
			"mousedown";

		return function() {
			return this.bind( eventType + ".ui-disableSelection", function( event ) {
				event.preventDefault();
			});
		};
	})(),

	enableSelection: function() {
		return this.unbind( ".ui-disableSelection" );
	},

	zIndex: function( zIndex ) {
		if ( zIndex !== undefined ) {
			return this.css( "zIndex", zIndex );
		}

		if ( this.length ) {
			var elem = $( this[ 0 ] ), position, value;
			while ( elem.length && elem[ 0 ] !== document ) {
				// Ignore z-index if position is set to a value where z-index is ignored by the browser
				// This makes behavior of this function consistent across browsers
				// WebKit always returns auto if the element is positioned
				position = elem.css( "position" );
				if ( position === "absolute" || position === "relative" || position === "fixed" ) {
					// IE returns 0 when zIndex is not specified
					// other browsers return a string
					// we ignore the case of nested elements with an explicit value of 0
					// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
					value = parseInt( elem.css( "zIndex" ), 10 );
					if ( !isNaN( value ) && value !== 0 ) {
						return value;
					}
				}
				elem = elem.parent();
			}
		}

		return 0;
	}
});

// $.ui.plugin is deprecated. Use $.widget() extensions instead.
$.ui.plugin = {
	add: function( module, option, set ) {
		var i,
			proto = $.ui[ module ].prototype;
		for ( i in set ) {
			proto.plugins[ i ] = proto.plugins[ i ] || [];
			proto.plugins[ i ].push( [ option, set[ i ] ] );
		}
	},
	call: function( instance, name, args, allowDisconnected ) {
		var i,
			set = instance.plugins[ name ];

		if ( !set ) {
			return;
		}

		if ( !allowDisconnected && ( !instance.element[ 0 ].parentNode || instance.element[ 0 ].parentNode.nodeType === 11 ) ) {
			return;
		}

		for ( i = 0; i < set.length; i++ ) {
			if ( instance.options[ set[ i ][ 0 ] ] ) {
				set[ i ][ 1 ].apply( instance.element, args );
			}
		}
	}
};


/*!
 * jQuery UI Widget 1.11.1
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/jQuery.widget/
 */


var widget_uuid = 0,
	widget_slice = Array.prototype.slice;

$.cleanData = (function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; (elem = elems[i]) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// http://bugs.jquery.com/ticket/8235
			} catch( e ) {}
		}
		orig( elems );
	};
})( $.cleanData );

$.widget = function( name, base, prototype ) {
	var fullName, existingConstructor, constructor, basePrototype,
		// proxiedPrototype allows the provided prototype to remain unmodified
		// so that it can be used as a mixin for multiple widgets (#8876)
		proxiedPrototype = {},
		namespace = name.split( "." )[ 0 ];

	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};
	// extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,
		// copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),
		// track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	});

	basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = (function() {
			var _super = function() {
					return base.prototype[ prop ].apply( this, arguments );
				},
				_superApply = function( args ) {
					return base.prototype[ prop ].apply( this, args );
				};
			return function() {
				var __super = this._super,
					__superApply = this._superApply,
					returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		})();
	});
	constructor.prototype = $.widget.extend( basePrototype, {
		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? (basePrototype.widgetEventPrefix || name) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	});

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto );
		});
		// remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widget_slice.call( arguments, 1 ),
		inputIndex = 0,
		inputLength = input.length,
		key,
		value;
	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {
				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :
						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );
				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = widget_slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.widget.extend.apply( null, [ options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var methodValue,
					instance = $.data( this, fullName );
				if ( options === "instance" ) {
					returnValue = instance;
					return false;
				}
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue && methodValue.jquery ?
						returnValue.pushStack( methodValue.get() ) :
						methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false,

		// callbacks
		create: null
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widget_uuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;
		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			});
			this.document = $( element.style ?
				// element within the document
				element.ownerDocument :
				// element is window or document
				element.document || element );
			this.window = $( this.document[0].defaultView || this.document[0].parentWindow );
		}

		this._create();
		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},
	_getCreateOptions: $.noop,
	_getCreateEventData: $.noop,
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.unbind( this.eventNamespace )
			.removeData( this.widgetFullName )
			// support: jquery <1.6.3
			// http://bugs.jquery.com/ticket/9413
			.removeData( $.camelCase( this.widgetFullName ) );
		this.widget()
			.unbind( this.eventNamespace )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetFullName + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( this.eventNamespace );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key,
			parts,
			curOption,
			i;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {
			// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetFullName + "-disabled", !!value );

			// If the widget is becoming disabled, then nothing is interactive
			if ( value ) {
				this.hoverable.removeClass( "ui-state-hover" );
				this.focusable.removeClass( "ui-state-focus" );
			}
		}

		return this;
	},

	enable: function() {
		return this._setOptions({ disabled: false });
	},
	disable: function() {
		return this._setOptions({ disabled: true });
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement,
			instance = this;

		// no suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
							$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ ),
				eventName = match[1] + instance.eventNamespace,
				selector = match[2];
			if ( selector ) {
				delegateElement.delegate( selector, eventName, handlerProxy );
			} else {
				element.bind( eventName, handlerProxy );
			}
		});
	},

	_off: function( element, eventName ) {
		eventName = (eventName || "").split( " " ).join( this.eventNamespace + " " ) + this.eventNamespace;
		element.unbind( eventName ).undelegate( eventName );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var prop, orig,
			callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		// the original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}
		var hasOptions,
			effectName = !options ?
				method :
				options === true || typeof options === "number" ?
					defaultEffect :
					options.effect || defaultEffect;
		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}
		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;
		if ( options.delay ) {
			element.delay( options.delay );
		}
		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue(function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			});
		}
	};
});

var widget = $.widget;


/*!
 * jQuery UI Position 1.11.1
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

(function() {

$.ui = $.ui || {};

var cachedScrollbarWidth, supportsOffsetFractions,
	max = Math.max,
	abs = Math.abs,
	round = Math.round,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[0];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[0];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[0].clientWidth;
		}

		div.remove();

		return (cachedScrollbarWidth = w1 - w2);
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[0].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[0].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[0] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: withinElement.offset() || { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),

			// support: jQuery 1.6.x
			// jQuery 1.6 doesn't support .outerWidth/Height() on documents or windows
			width: isWindow || isDocument ? withinElement.width() : withinElement.outerWidth(),
			height: isWindow || isDocument ? withinElement.height() : withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[0].preventDefault ) {
		// force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;
	// clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	});

	// normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each(function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) + scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) + scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		// if the browser doesn't support fractions, then round for consistent results
		if ( !supportsOffsetFractions ) {
			position.left = round( position.left );
			position.top = round( position.top );
		}

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem: elem
				});
			}
		});

		if ( options.using ) {
			// adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	});
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// element is wider than within
			if ( data.collisionWidth > outerWidth ) {
				// element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
					position.left += overLeft - newOverRight;
				// element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;
				// element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}
			// too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;
			// too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;
			// adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// element is taller than within
			if ( data.collisionHeight > outerHeight ) {
				// element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
					position.top += overTop - newOverBottom;
				// element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;
				// element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}
			// too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;
			// too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;
			// adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
				if ( ( position.top + myOffset + atOffset + offset) > overTop && ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
				if ( ( position.top + myOffset + atOffset + offset) > overBottom && ( newOverTop > 0 || abs( newOverTop ) < overBottom ) ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

// fraction support test
(function() {
	var testElement, testElementParent, testElementStyle, offsetLeft, i,
		body = document.getElementsByTagName( "body" )[ 0 ],
		div = document.createElement( "div" );

	//Create a "fake body" for testing based on method used in jQuery.support
	testElement = document.createElement( body ? "div" : "body" );
	testElementStyle = {
		visibility: "hidden",
		width: 0,
		height: 0,
		border: 0,
		margin: 0,
		background: "none"
	};
	if ( body ) {
		$.extend( testElementStyle, {
			position: "absolute",
			left: "-1000px",
			top: "-1000px"
		});
	}
	for ( i in testElementStyle ) {
		testElement.style[ i ] = testElementStyle[ i ];
	}
	testElement.appendChild( div );
	testElementParent = body || document.documentElement;
	testElementParent.insertBefore( testElement, testElementParent.firstChild );

	div.style.cssText = "position: absolute; left: 10.7432222px;";

	offsetLeft = $( div ).offset().left;
	supportsOffsetFractions = offsetLeft > 10 && offsetLeft < 11;

	testElement.innerHTML = "";
	testElementParent.removeChild( testElement );
})();

})();

var position = $.ui.position;


/*!
 * jQuery UI Tooltip 1.11.1
 * http://jqueryui.com
 *
 * Copyright 2014 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/tooltip/
 */


var tooltip = $.widget( "ui.tooltip", {
	version: "1.11.1",
	options: {
		content: function() {
			// support: IE<9, Opera in jQuery <1.7
			// .text() can't accept undefined, so coerce to a string
			var title = $( this ).attr( "title" ) || "";
			// Escape title, since we're going from an attribute to raw HTML
			return $( "<a>" ).text( title ).html();
		},
		hide: true,
		// Disabled elements have inconsistent behavior across browsers (#8661)
		items: "[title]:not([disabled])",
		position: {
			my: "left top+15",
			at: "left bottom",
			collision: "flipfit flip"
		},
		show: true,
		tooltipClass: null,
		track: false,

		// callbacks
		close: null,
		open: null
	},

	_addDescribedBy: function( elem, id ) {
		var describedby = (elem.attr( "aria-describedby" ) || "").split( /\s+/ );
		describedby.push( id );
		elem
			.data( "ui-tooltip-id", id )
			.attr( "aria-describedby", $.trim( describedby.join( " " ) ) );
	},

	_removeDescribedBy: function( elem ) {
		var id = elem.data( "ui-tooltip-id" ),
			describedby = (elem.attr( "aria-describedby" ) || "").split( /\s+/ ),
			index = $.inArray( id, describedby );

		if ( index !== -1 ) {
			describedby.splice( index, 1 );
		}

		elem.removeData( "ui-tooltip-id" );
		describedby = $.trim( describedby.join( " " ) );
		if ( describedby ) {
			elem.attr( "aria-describedby", describedby );
		} else {
			elem.removeAttr( "aria-describedby" );
		}
	},

	_create: function() {
		this._on({
			mouseover: "open",
			focusin: "open"
		});

		// IDs of generated tooltips, needed for destroy
		this.tooltips = {};
		// IDs of parent tooltips where we removed the title attribute
		this.parents = {};

		if ( this.options.disabled ) {
			this._disable();
		}

		// Append the aria-live region so tooltips announce correctly
		this.liveRegion = $( "<div>" )
			.attr({
				role: "log",
				"aria-live": "assertive",
				"aria-relevant": "additions"
			})
			.addClass( "ui-helper-hidden-accessible" )
			.appendTo( this.document[ 0 ].body );
	},

	_setOption: function( key, value ) {
		var that = this;

		if ( key === "disabled" ) {
			this[ value ? "_disable" : "_enable" ]();
			this.options[ key ] = value;
			// disable element style changes
			return;
		}

		this._super( key, value );

		if ( key === "content" ) {
			$.each( this.tooltips, function( id, element ) {
				that._updateContent( element );
			});
		}
	},

	_disable: function() {
		var that = this;

		// close open tooltips
		$.each( this.tooltips, function( id, element ) {
			var event = $.Event( "blur" );
			event.target = event.currentTarget = element[0];
			that.close( event, true );
		});

		// remove title attributes to prevent native tooltips
		this.element.find( this.options.items ).addBack().each(function() {
			var element = $( this );
			if ( element.is( "[title]" ) ) {
				element
					.data( "ui-tooltip-title", element.attr( "title" ) )
					.removeAttr( "title" );
			}
		});
	},

	_enable: function() {
		// restore title attributes
		this.element.find( this.options.items ).addBack().each(function() {
			var element = $( this );
			if ( element.data( "ui-tooltip-title" ) ) {
				element.attr( "title", element.data( "ui-tooltip-title" ) );
			}
		});
	},

	open: function( event ) {
		var that = this,
			target = $( event ? event.target : this.element )
				// we need closest here due to mouseover bubbling,
				// but always pointing at the same event target
				.closest( this.options.items );

		// No element to show a tooltip for or the tooltip is already open
		if ( !target.length || target.data( "ui-tooltip-id" ) ) {
			return;
		}

		if ( target.attr( "title" ) ) {
			target.data( "ui-tooltip-title", target.attr( "title" ) );
		}

		target.data( "ui-tooltip-open", true );

		// kill parent tooltips, custom or native, for hover
		if ( event && event.type === "mouseover" ) {
			target.parents().each(function() {
				var parent = $( this ),
					blurEvent;
				if ( parent.data( "ui-tooltip-open" ) ) {
					blurEvent = $.Event( "blur" );
					blurEvent.target = blurEvent.currentTarget = this;
					that.close( blurEvent, true );
				}
				if ( parent.attr( "title" ) ) {
					parent.uniqueId();
					that.parents[ this.id ] = {
						element: this,
						title: parent.attr( "title" )
					};
					parent.attr( "title", "" );
				}
			});
		}

		this._updateContent( target, event );
	},

	_updateContent: function( target, event ) {
		var content,
			contentOption = this.options.content,
			that = this,
			eventType = event ? event.type : null;

		if ( typeof contentOption === "string" ) {
			return this._open( event, target, contentOption );
		}

		content = contentOption.call( target[0], function( response ) {
			// ignore async response if tooltip was closed already
			if ( !target.data( "ui-tooltip-open" ) ) {
				return;
			}
			// IE may instantly serve a cached response for ajax requests
			// delay this call to _open so the other call to _open runs first
			that._delay(function() {
				// jQuery creates a special event for focusin when it doesn't
				// exist natively. To improve performance, the native event
				// object is reused and the type is changed. Therefore, we can't
				// rely on the type being correct after the event finished
				// bubbling, so we set it back to the previous value. (#8740)
				if ( event ) {
					event.type = eventType;
				}
				this._open( event, target, response );
			});
		});
		if ( content ) {
			this._open( event, target, content );
		}
	},

	_open: function( event, target, content ) {
		var tooltip, events, delayedShow, a11yContent,
			positionOption = $.extend( {}, this.options.position );

		if ( !content ) {
			return;
		}

		// Content can be updated multiple times. If the tooltip already
		// exists, then just update the content and bail.
		tooltip = this._find( target );
		if ( tooltip.length ) {
			tooltip.find( ".ui-tooltip-content" ).html( content );
			return;
		}

		// if we have a title, clear it to prevent the native tooltip
		// we have to check first to avoid defining a title if none exists
		// (we don't want to cause an element to start matching [title])
		//
		// We use removeAttr only for key events, to allow IE to export the correct
		// accessible attributes. For mouse events, set to empty string to avoid
		// native tooltip showing up (happens only when removing inside mouseover).
		if ( target.is( "[title]" ) ) {
			if ( event && event.type === "mouseover" ) {
				target.attr( "title", "" );
			} else {
				target.removeAttr( "title" );
			}
		}

		tooltip = this._tooltip( target );
		this._addDescribedBy( target, tooltip.attr( "id" ) );
		tooltip.find( ".ui-tooltip-content" ).html( content );

		// Support: Voiceover on OS X, JAWS on IE <= 9
		// JAWS announces deletions even when aria-relevant="additions"
		// Voiceover will sometimes re-read the entire log region's contents from the beginning
		this.liveRegion.children().hide();
		if ( content.clone ) {
			a11yContent = content.clone();
			a11yContent.removeAttr( "id" ).find( "[id]" ).removeAttr( "id" );
		} else {
			a11yContent = content;
		}
		$( "<div>" ).html( a11yContent ).appendTo( this.liveRegion );

		function position( event ) {
			positionOption.of = event;
			if ( tooltip.is( ":hidden" ) ) {
				return;
			}
			tooltip.position( positionOption );
		}
		if ( this.options.track && event && /^mouse/.test( event.type ) ) {
			this._on( this.document, {
				mousemove: position
			});
			// trigger once to override element-relative positioning
			position( event );
		} else {
			tooltip.position( $.extend({
				of: target
			}, this.options.position ) );
		}

		this.hiding = false;
		this.closing = false;
		tooltip.hide();

		this._show( tooltip, this.options.show );
		// Handle tracking tooltips that are shown with a delay (#8644). As soon
		// as the tooltip is visible, position the tooltip using the most recent
		// event.
		if ( this.options.show && this.options.show.delay ) {
			delayedShow = this.delayedShow = setInterval(function() {
				if ( tooltip.is( ":visible" ) ) {
					position( positionOption.of );
					clearInterval( delayedShow );
				}
			}, $.fx.interval );
		}

		this._trigger( "open", event, { tooltip: tooltip } );

		events = {
			keyup: function( event ) {
				if ( event.keyCode === $.ui.keyCode.ESCAPE ) {
					var fakeEvent = $.Event(event);
					fakeEvent.currentTarget = target[0];
					this.close( fakeEvent, true );
				}
			}
		};

		// Only bind remove handler for delegated targets. Non-delegated
		// tooltips will handle this in destroy.
		if ( target[ 0 ] !== this.element[ 0 ] ) {
			events.remove = function() {
				this._removeTooltip( tooltip );
			};
		}

		if ( !event || event.type === "mouseover" ) {
			events.mouseleave = "close";
		}
		if ( !event || event.type === "focusin" ) {
			events.focusout = "close";
		}
		this._on( true, target, events );
	},

	close: function( event ) {
		var that = this,
			target = $( event ? event.currentTarget : this.element ),
			tooltip = this._find( target );

		// disabling closes the tooltip, so we need to track when we're closing
		// to avoid an infinite loop in case the tooltip becomes disabled on close
		if ( this.closing ) {
			return;
		}

		// Clear the interval for delayed tracking tooltips
		clearInterval( this.delayedShow );

		// only set title if we had one before (see comment in _open())
		// If the title attribute has changed since open(), don't restore
		if ( target.data( "ui-tooltip-title" ) && !target.attr( "title" ) ) {
			target.attr( "title", target.data( "ui-tooltip-title" ) );
		}

		this._removeDescribedBy( target );

		this.hiding = true;
		tooltip.stop( true );
		this._hide( tooltip, this.options.hide, function() {
			that._removeTooltip( $( this ) );
			this.hiding = false;
			this.closing = false;
		});

		target.removeData( "ui-tooltip-open" );
		this._off( target, "mouseleave focusout keyup" );

		// Remove 'remove' binding only on delegated targets
		if ( target[ 0 ] !== this.element[ 0 ] ) {
			this._off( target, "remove" );
		}
		this._off( this.document, "mousemove" );

		if ( event && event.type === "mouseleave" ) {
			$.each( this.parents, function( id, parent ) {
				$( parent.element ).attr( "title", parent.title );
				delete that.parents[ id ];
			});
		}

		this.closing = true;
		this._trigger( "close", event, { tooltip: tooltip } );
		if ( !this.hiding ) {
			this.closing = false;
		}
	},

	_tooltip: function( element ) {
		var tooltip = $( "<div>" )
				.attr( "role", "tooltip" )
				.addClass( "ui-tooltip ui-widget ui-corner-all ui-widget-content " +
					( this.options.tooltipClass || "" ) ),
			id = tooltip.uniqueId().attr( "id" );

		$( "<div>" )
			.addClass( "ui-tooltip-content" )
			.appendTo( tooltip );

		tooltip.appendTo( this.document[0].body );
		this.tooltips[ id ] = element;
		return tooltip;
	},

	_find: function( target ) {
		var id = target.data( "ui-tooltip-id" );
		return id ? $( "#" + id ) : $();
	},

	_removeTooltip: function( tooltip ) {
		tooltip.remove();
		delete this.tooltips[ tooltip.attr( "id" ) ];
	},

	_destroy: function() {
		var that = this;

		// close open tooltips
		$.each( this.tooltips, function( id, element ) {
			// Delegate to close method to handle common cleanup
			var event = $.Event( "blur" );
			event.target = event.currentTarget = element[0];
			that.close( event, true );

			// Remove immediately; destroying an open tooltip doesn't use the
			// hide animation
			$( "#" + id ).remove();

			// Restore the title
			if ( element.data( "ui-tooltip-title" ) ) {
				// If the title attribute has changed since open(), don't restore
				if ( !element.attr( "title" ) ) {
					element.attr( "title", element.data( "ui-tooltip-title" ) );
				}
				element.removeData( "ui-tooltip-title" );
			}
		});
		this.liveRegion.remove();
	}
});



}));
/*
 * jQuery Form Styler v1.5.6
 * https://github.com/Dimox/jQueryFormStyler
 *
 * Copyright 2012-2014 Dimox (http://dimox.name/)
 * Released under the MIT license.
 *
 * Date: 2014.09.08
 *
 */

(function($) {

	$.fn.styler = function(options) {

		var opt = $.extend({
			wrapper: 'form',
			idSuffix: '-styler',
			filePlaceholder: 'Файл не выбран',
			fileBrowse: 'Обзор...',
			selectPlaceholder: 'Выберите...',
			selectSearch: false,
			selectSearchLimit: 10,
			selectSearchNotFound: 'Совпадений не найдено',
			selectSearchPlaceholder: 'Поиск...',
			selectVisibleOptions: 0,
			singleSelectzIndex: '100',
			selectSmartPositioning: true,
			onSelectOpened: function() {},
			onSelectClosed: function() {},
			onFormStyled: function() {}
		}, options);

		return this.each(function() {
			var el = $(this);

			function Attributes() {
				var id = '',
						title = '',
						classes = '',
						dataList = '';
				if (el.attr('id') !== undefined && el.attr('id') !== '') id = ' id="' + el.attr('id') + opt.idSuffix + '"';
				if (el.attr('title') !== undefined && el.attr('title') !== '') title = ' title="' + el.attr('title') + '"';
				if (el.attr('class') !== undefined && el.attr('class') !== '') classes = ' ' + el.attr('class');
				var data = el.data();
				for (var i = 0; i < data.length; i++) {
					if (data[i] !== '') dataList += ' data-' + i + '="' + data[i] + '"';
				}
				id += dataList;
				this.id = id;
				this.title = title;
				this.classes = classes;
			}

			// checkbox
			if (el.is(':checkbox')) {
				el.each(function() {
					if (el.parent('div.jq-checkbox').length < 1) {

						var checkboxOutput = function() {

							var att = new Attributes();
							var checkbox = $('<div' + att.id + ' class="jq-checkbox' + att.classes + '"' + att.title + '><div class="jq-checkbox__div"></div></div>');

							// прячем оригинальный чекбокс
							el.css({
								position: 'absolute',
								zIndex: '-1',
								opacity: 0,
								margin: 0,
								padding: 0
							}).after(checkbox).prependTo(checkbox);

							checkbox.attr('unselectable', 'on').css({
								'-webkit-user-select': 'none',
								'-moz-user-select': 'none',
								'-ms-user-select': 'none',
								'-o-user-select': 'none',
								'user-select': 'none',
								display: 'inline-block',
								position: 'relative',
								overflow: 'hidden'
							});

							if (el.is(':checked')) checkbox.addClass('checked');
							if (el.is(':disabled')) checkbox.addClass('disabled');

							// клик на псевдочекбокс
							checkbox.on('click.styler', function() {
								if (!checkbox.is('.disabled')) {
									if (el.is(':checked')) {
										el.prop('checked', false);
										checkbox.removeClass('checked');
									} else {
										el.prop('checked', true);
										checkbox.addClass('checked');
									}
									el.change();
									return false;
								} else {
									return false;
								}
							});
							// клик на label
							el.closest('label').add('label[for="' + el.attr('id') + '"]').click(function(e) {
								checkbox.click();
								e.preventDefault();
							});
							// переключение по Space или Enter
							el.on('change.styler', function() {
								if (el.is(':checked')) checkbox.addClass('checked');
								else checkbox.removeClass('checked');
							})
							// чтобы переключался чекбокс, который находится в теге label
							.on('keydown.styler', function(e) {
								if (e.which == 32) checkbox.click();
							})
							.on('focus.styler', function() {
								if (!checkbox.is('.disabled')) checkbox.addClass('focused');
							})
							.on('blur.styler', function() {
								checkbox.removeClass('focused');
							});

						}; // end checkboxOutput()

						checkboxOutput();

						// обновление при динамическом изменении
						el.on('refresh', function() {
							el.off('.styler').parent().before(el).remove();
							checkboxOutput();
						});

					}
				});
			// end checkbox

			// radio
			} else if (el.is(':radio')) {
				el.each(function() {
					if (el.parent('div.jq-radio').length < 1) {

						var radioOutput = function() {

							var att = new Attributes();
							var radio = $('<div' + att.id + ' class="jq-radio' + att.classes + '"' + att.title + '><div class="jq-radio__div"></div></div>');

							// прячем оригинальную радиокнопку
							el.css({
								position: 'absolute',
								zIndex: '-1',
								opacity: 0,
								margin: 0,
								padding: 0
							}).after(radio).prependTo(radio);

							radio.attr('unselectable', 'on').css({
								'-webkit-user-select': 'none',
								'-moz-user-select': 'none',
								'-ms-user-select': 'none',
								'-o-user-select': 'none',
								'user-select': 'none',
								display: 'inline-block',
								position: 'relative'
							});

							if (el.is(':checked')) radio.addClass('checked');
							if (el.is(':disabled')) radio.addClass('disabled');

							// клик на псевдорадиокнопке
							radio.on('click.styler', function() {
								if (!radio.is('.disabled')) {
									radio.closest(opt.wrapper).find('input[name="' + el.attr('name') + '"]').prop('checked', false).parent().removeClass('checked');
									el.prop('checked', true).parent().addClass('checked');
									el.change();
									return false;
								} else {
									return false;
								}
							});
							// клик на label
							el.closest('label').add('label[for="' + el.attr('id') + '"]').click(function(e) {
								radio.click();
								e.preventDefault();
							});
							// переключение стрелками
							el.on('change.styler', function() {
								el.parent().addClass('checked');
							})
							.on('focus.styler', function() {
								if (!radio.is('.disabled')) radio.addClass('focused');
							})
							.on('blur.styler', function() {
								radio.removeClass('focused');
							});

						}; // end radioOutput()

						radioOutput();

						// обновление при динамическом изменении
						el.on('refresh', function() {
							el.off('.styler').parent().before(el).remove();
							radioOutput();
						});

					}
				});
			// end radio

			// file
			} else if (el.is(':file')) {
				// прячем оригинальное поле
				el.css({
					position: 'absolute',
					top: 0,
					right: 0,
					width: '100%',
					height: '100%',
					opacity: 0,
					margin: 0,
					padding: 0
				}).each(function() {
					if (el.parent('div.jq-file').length < 1) {

						var fileOutput = function() {

							var att = new Attributes();
							var file = $('<div' + att.id + ' class="jq-file' + att.classes + '"' + att.title + ' style="display: inline-block; position: relative; overflow: hidden"></div>');
							var name = $('<div class="jq-file__name">' + opt.filePlaceholder + '</div>').appendTo(file);
							var browse = $('<div class="jq-file__browse">' + opt.fileBrowse + '</div>').appendTo(file);
							el.after(file);
							file.append(el);
							if (el.is(':disabled')) file.addClass('disabled');
							el.on('change.styler', function() {
								var value = el.val();
								if (el.is('[multiple]')) {
									value = '';
									var files = el[0].files;
									for (var i = 0; i < files.length; i++) {
										value += ( (i > 0) ? ', ' : '' ) + files[i].name;
									}
								}
								name.text(value.replace(/.+[\\\/]/, ''));
								if (value === '') {
									name.text(opt.filePlaceholder);
									file.removeClass('changed');
								} else {
									file.addClass('changed');
								}
							})
							.on('focus.styler', function() {
								file.addClass('focused');
							})
							.on('blur.styler', function() {
								file.removeClass('focused');
							})
							.on('click.styler', function() {
								file.removeClass('focused');
							});

						}; // end fileOutput()

						fileOutput();

						// обновление при динамическом изменении
						el.on('refresh', function() {
							el.off('.styler').parent().before(el).remove();
							fileOutput();
						});

					}
				});
			// end file

			// select
			} else if (el.is('select')) {
				el.each(function() {
					if (el.parent('div.jqselect').length < 1) {

						var selectboxOutput = function() {

							// запрещаем прокрутку страницы при прокрутке селекта
							function preventScrolling(selector) {
								selector.off('mousewheel DOMMouseScroll').on('mousewheel DOMMouseScroll', function(e) {
									var scrollTo = null;
									if (e.type == 'mousewheel') { scrollTo = (e.originalEvent.wheelDelta * -1); }
									else if (e.type == 'DOMMouseScroll') { scrollTo = 40 * e.originalEvent.detail; }
									if (scrollTo) {
										e.stopPropagation();
										e.preventDefault();
										$(this).scrollTop(scrollTo + $(this).scrollTop());
									}
								});
							}

							var option = $('option', el);
							var list = '';
							// формируем список селекта
							function makeList() {
								for (var i = 0, len = option.length; i < len; i++) {
									var li = '',
											liClass = '',
											dataList = '',
											optionClass = '',
											optgroupClass = '',
											dataJqfsClass = '';
									var disabled = 'disabled';
									var selDis = 'selected sel disabled';
									if (option.eq(i).prop('selected')) liClass = 'selected sel';
									if (option.eq(i).is(':disabled')) liClass = disabled;
									if (option.eq(i).is(':selected:disabled')) liClass = selDis;
									if (option.eq(i).attr('class') !== undefined) {
										optionClass = ' ' + option.eq(i).attr('class');
										dataJqfsClass = ' data-jqfs-class="' + option.eq(i).attr('class') + '"';
									}

									var data = option.eq(i).data();
									for (var k in data) {
										if (data[k] !== '') dataList += ' data-' + k + '="' + data[k] + '"';
									}

									li = '<li' + dataJqfsClass + dataList + ' class="' + liClass + optionClass + '">'+ option.eq(i).html() +'</li>';

									// если есть optgroup
									if (option.eq(i).parent().is('optgroup')) {
										if (option.eq(i).parent().attr('class') !== undefined) optgroupClass = ' ' + option.eq(i).parent().attr('class');
										li = '<li' + dataJqfsClass + ' class="' + liClass + optionClass + ' option' + optgroupClass + '">'+ option.eq(i).html() +'</li>';
										if (option.eq(i).is(':first-child')) {
											li = '<li class="optgroup' + optgroupClass + '">' + option.eq(i).parent().attr('label') + '</li>' + li;
										}
									}

									list += li;
								}
							} // end makeList()

							// одиночный селект
							function doSelect() {
								var att = new Attributes();
								var selectbox =
									$('<div' + att.id + ' class="jq-selectbox jqselect' + att.classes + '" style="display: inline-block; position: relative; z-index:' + opt.singleSelectzIndex + '">' +
											'<div class="jq-selectbox__select"' + att.title + ' style="position: relative">' +
												'<div class="jq-selectbox__select-text"></div>' +
												'<div class="jq-selectbox__trigger"><div class="jq-selectbox__trigger-arrow"></div></div>' +
											'</div>' +
										'</div>');

								el.css({margin: 0, padding: 0}).after(selectbox).prependTo(selectbox);

								var divSelect = $('div.jq-selectbox__select', selectbox);
								var divText = $('div.jq-selectbox__select-text', selectbox);
								var optionSelected = option.filter(':selected');

								makeList();
								var searchHTML = '';
								if (opt.selectSearch) searchHTML =
									'<div class="jq-selectbox__search"><input type="search" autocomplete="off" placeholder="' + opt.selectSearchPlaceholder + '"></div>' +
									'<div class="jq-selectbox__not-found">' + opt.selectSearchNotFound + '</div>';
								var dropdown =
									$('<div class="jq-selectbox__dropdown" style="position: absolute">' +
											searchHTML +
											'<ul style="position: relative; list-style: none; overflow: auto; overflow-x: hidden">' + list + '</ul>' +
										'</div>');
								selectbox.append(dropdown);
								var ul = $('ul', dropdown);
								var li = $('li', dropdown);
								var search = $('input', dropdown);
								var notFound = $('div.jq-selectbox__not-found', dropdown).hide();
								if (li.length < opt.selectSearchLimit) search.parent().hide();

								// определяем самый широкий пункт селекта
								var liWidth1 = 0,
										liWidth2 = 0;
								li.each(function() {
									var l = $(this);
									l.css({'display': 'inline-block', 'white-space': 'nowrap'});
									if (l.innerWidth() > liWidth1) {
										liWidth1 = l.innerWidth();
										liWidth2 = l.width();
									}
									l.css({'display': 'block'});
								});

								// подстраиваем ширину псевдоселекта и выпадающего списка
								// в зависимости от самого широкого пункта
								var selClone = selectbox.clone().appendTo('body').width('auto');
								var selCloneWidth = selClone.width();
								selClone.remove();
								if (selCloneWidth == selectbox.width()) {
									divText.width(liWidth2);
									liWidth1 += selectbox.find('div.jq-selectbox__trigger').width();
								}
								if ( liWidth1 > selectbox.width() ) {
									dropdown.width(liWidth1);
								}

								// показываем опцию по умолчанию
								// если 1-я опция пустая и выбрана по умолчанию, то показываем плейсхолдер
								if (el.val() === '') {
									var placeholder = el.data('placeholder');
									if (placeholder === undefined) placeholder = opt.selectPlaceholder;
									divText.text(placeholder).addClass('placeholder');
								} else {
									divText.text(optionSelected.text());
								}
								// прячем 1-ю пустую опцию, если она есть и если атрибут data-placeholder не пустой
								// если все же нужно, чтобы первая пустая опция отображалась, то указываем у селекта: data-placeholder=""
								if (option.first().text() === '' && el.data('placeholder') !== '') {
									li.first().hide();
								}

								// прячем оригинальный селект
								el.css({
									position: 'absolute',
									left: 0,
									top: 0,
									width: '100%',
									height: '100%',
									opacity: 0
								});

								var selectHeight = selectbox.outerHeight();
								var searchHeight = search.outerHeight();
								var isMaxHeight = ul.css('max-height');
								var liSelected = li.filter('.selected');
								if (liSelected.length < 1) li.first().addClass('selected sel');
								if (li.data('li-height') === undefined) li.data('li-height', li.outerHeight());
								var position = dropdown.css('top');
								if (dropdown.css('left') == 'auto') dropdown.css({left: 0});
								if (dropdown.css('top') == 'auto') dropdown.css({top: selectHeight});
								dropdown.hide();

								// если выбран не дефолтный пункт
								if (liSelected.length) {
									// добавляем класс, показывающий изменение селекта
									if (option.first().text() != optionSelected.text()) {
										selectbox.addClass('changed');
									}
									// передаем селекту класс выбранного пункта
									selectbox.data('jqfs-class', liSelected.data('jqfs-class'));
									selectbox.addClass(liSelected.data('jqfs-class'));
								}

								// если селект неактивный
								if (el.is(':disabled')) {
									selectbox.addClass('disabled');
									return false;
								}

								// при клике на псевдоселекте
								divSelect.click(function() {

									// колбек при закрытии селекта
									if ($('div.jq-selectbox').filter('.opened').length) {
										opt.onSelectClosed.call($('div.jq-selectbox').filter('.opened'));
									}

									el.focus();

									// если iOS, то не показываем выпадающий список,
									// т.к. отображается нативный и неизвестно, как его спрятать
									var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false;
									if (iOS) return;

									// умное позиционирование
									var win = $(window);
									var liHeight = li.data('li-height');
									var topOffset = selectbox.offset().top;
									var bottomOffset = win.height() - selectHeight - (topOffset - win.scrollTop());
									var visible = opt.selectVisibleOptions;
									var	minHeight = liHeight * 5;
									var	newHeight = liHeight * visible;
									if (visible > 0 && visible < 6) minHeight = newHeight;
									if (visible === 0) newHeight = 'auto';

									var dropDown = function() {
										dropdown.height('auto').css({bottom: 'auto', top: position});
										var maxHeightBottom = function() {
											ul.css('max-height', Math.floor((bottomOffset - 20 - searchHeight) / liHeight) * liHeight);
										};
										maxHeightBottom();
										ul.css('max-height', newHeight);
										if (isMaxHeight != 'none') {
											ul.css('max-height', isMaxHeight);
										}
										if (bottomOffset < (dropdown.outerHeight() + 20)) {
											maxHeightBottom();
										}
									};

									var dropUp = function() {
										dropdown.height('auto').css({top: 'auto', bottom: position});
										var maxHeightTop = function() {
											ul.css('max-height', Math.floor((topOffset - win.scrollTop() - 20 - searchHeight) / liHeight) * liHeight);
										};
										maxHeightTop();
										ul.css('max-height', newHeight);
										if (isMaxHeight != 'none') {
											ul.css('max-height', isMaxHeight);
										}
										if ((topOffset - win.scrollTop() - 20) < (dropdown.outerHeight() + 20)) {
											maxHeightTop();
										}
									};

									if (opt.selectSmartPositioning === true) {
										// раскрытие вниз
										if (bottomOffset > (minHeight + searchHeight + 20))	{
											dropDown();
										// раскрытие вверх
										} else {
											dropUp();
										}
									} else if (opt.selectSmartPositioning === false) {
										// раскрытие вниз
										if (bottomOffset > (minHeight + searchHeight + 20))	{
											dropDown();
										}
									}
									// конец умного позиционирования

									$('div.jqselect').css({zIndex: (opt.singleSelectzIndex - 1)}).removeClass('opened');
									selectbox.css({zIndex: opt.singleSelectzIndex});
									if (dropdown.is(':hidden')) {
										$('div.jq-selectbox__dropdown:visible').hide();
										dropdown.show();
										selectbox.addClass('opened focused');
										// колбек при открытии селекта
										opt.onSelectOpened.call(selectbox);
									} else {
										dropdown.hide();
										selectbox.removeClass('opened');
										// колбек при закрытии селекта
										if ($('div.jq-selectbox').filter('.opened').length) {
											opt.onSelectClosed.call(selectbox);
										}
									}

									// поисковое поле
									if (search.length) {
										search.val('').keyup();
										notFound.hide();
										search.keyup(function() {
											var query = $(this).val();
											li.each(function() {
												if (!$(this).html().match(new RegExp('.*?' + query + '.*?', 'i'))) {
													$(this).hide();
												} else {
													$(this).show();
												}
											});
											// прячем 1-ю пустую опцию
											if (option.first().text() === '' && el.data('placeholder') !== '') {
												li.first().hide();
											}
											if (li.filter(':visible').length < 1) {
												notFound.show();
											} else {
												notFound.hide();
											}
										});
									}

									// прокручиваем до выбранного пункта при открытии списка
									if (li.filter('.selected').length) {
										// если нечетное количество видимых пунктов,
										// то высоту пункта делим пополам для последующего расчета
										if ( (ul.innerHeight() / liHeight) % 2 !== 0 ) liHeight = liHeight / 2;
										ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - ul.innerHeight() / 2 + liHeight);
									}

									preventScrolling(ul);
									return false;

								}); // end divSelect.click()

								// при наведении курсора на пункт списка
								li.hover(function() {
									$(this).siblings().removeClass('selected');
								});
								var selectedText = li.filter('.selected').text();
								var selText = li.filter('.selected').text();

								// при клике на пункт списка
								li.filter(':not(.disabled):not(.optgroup)').click(function() {

									el.focus();
									var t = $(this);
									var liText = t.text();
                                    console.log(t.is('.selected'));
									if (!t.is('.selected')) {
                                        console.log('text');
										var index = t.index();
										index -= t.prevAll('.optgroup').length;
										t.addClass('selected sel').siblings().removeClass('selected sel');
										option.prop('selected', false).eq(index).prop('selected', true);
										selectedText = liText;
										divText.text(liText);

										// передаем селекту класс выбранного пункта
										if (selectbox.data('jqfs-class')) selectbox.removeClass(selectbox.data('jqfs-class'));
										selectbox.data('jqfs-class', t.data('jqfs-class'));
										selectbox.addClass(t.data('jqfs-class'));

										el.change();
									}
									dropdown.hide();
									selectbox.removeClass('opened');
									// колбек при закрытии селекта
									opt.onSelectClosed.call(selectbox);

								});
								dropdown.mouseout(function() {
									$('li.sel', dropdown).addClass('selected');
								});

								// изменение селекта
								el.on('change.styler', function() {
									divText.text(option.filter(':selected').text()).removeClass('placeholder');
									li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');
									// добавляем класс, показывающий изменение селекта
									if (option.first().text() != li.filter('.selected').text()) {
										selectbox.addClass('changed');
									} else {
										selectbox.removeClass('changed');
									}
								})
								.on('focus.styler', function() {
									selectbox.addClass('focused');
									$('div.jqselect').not('.focused').removeClass('opened').find('div.jq-selectbox__dropdown').hide();
								})
								.on('blur.styler', function() {
									selectbox.removeClass('focused');
								})
								// изменение селекта с клавиатуры
								.on('keydown.styler keyup.styler', function(e) {
									var liHeight = li.data('li-height');
									divText.text(option.filter(':selected').text());
									li.removeClass('selected sel').not('.optgroup').eq(el[0].selectedIndex).addClass('selected sel');
									// вверх, влево, Page Up, Home
									if (e.which == 38 || e.which == 37 || e.which == 33 || e.which == 36) {
										ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top);
									}
									// вниз, вправо, Page Down, End
									if (e.which == 40 || e.which == 39 || e.which == 34 || e.which == 35) {
										ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - ul.innerHeight() + liHeight);
									}
									// закрываем выпадающий список при нажатии Enter
									if (e.which == 13) {
										e.preventDefault();
										dropdown.hide();
										selectbox.removeClass('opened');
										// колбек при закрытии селекта
										opt.onSelectClosed.call(selectbox);
									}
								}).on('keydown.styler', function(e) {
									// открываем выпадающий список при нажатии Space
									if (e.which == 32) {
										e.preventDefault();
										divSelect.click();
									}
								});

								// прячем выпадающий список при клике за пределами селекта
								$(document).on('click', function(e) {
									// e.target.nodeName != 'OPTION' - добавлено для обхода бага в Opera на движке Presto
									// (при изменении селекта с клавиатуры срабатывает событие onclick)
									if (!$(e.target).parents().hasClass('jq-selectbox') && e.target.nodeName != 'OPTION') {

										// колбек при закрытии селекта
										if ($('div.jq-selectbox').filter('.opened').length) {
											opt.onSelectClosed.call($('div.jq-selectbox').filter('.opened'));
										}

										if (search.length) search.val('').keyup();
										dropdown.hide().find('li.sel').addClass('selected');
										selectbox.removeClass('focused opened');

									}
								});

							} // end doSelect()

							// мультиселект
							function doMultipleSelect() {
								var att = new Attributes();
								var selectbox = $('<div' + att.id + ' class="jq-select-multiple jqselect' + att.classes + '"' + att.title + ' style="display: inline-block; position: relative"></div>');

								el.css({margin: 0, padding: 0}).after(selectbox);

								makeList();
								selectbox.append('<ul>' + list + '</ul>');
								var ul = $('ul', selectbox).css({
									'position': 'relative',
									'overflow-x': 'hidden',
									'-webkit-overflow-scrolling': 'touch'
								});
								var li = $('li', selectbox).attr('unselectable', 'on').css({'-webkit-user-select': 'none', '-moz-user-select': 'none', '-ms-user-select': 'none', '-o-user-select': 'none', 'user-select': 'none', 'white-space': 'nowrap'});
								var size = el.attr('size');
								var ulHeight = ul.outerHeight();
								var liHeight = li.outerHeight();
								if (size !== undefined && size > 0) {
									ul.css({'height': liHeight * size});
								} else {
									ul.css({'height': liHeight * 4});
								}
								if (ulHeight > selectbox.height()) {
									ul.css('overflowY', 'scroll');
									preventScrolling(ul);
									// прокручиваем до выбранного пункта
									if (li.filter('.selected').length) {
										ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top);
									}
								}

								// прячем оригинальный селект
								el.prependTo(selectbox).css({
									position: 'absolute',
									left: 0,
									top: 0,
									width: '100%',
									height: '100%',
									opacity: 0
								});

								// если селект неактивный
								if (el.is(':disabled')) {
									selectbox.addClass('disabled');
									option.each(function() {
										if ($(this).is(':selected')) li.eq($(this).index()).addClass('selected');
									});

								// если селект активный
								} else {

									// при клике на пункт списка
									li.filter(':not(.disabled):not(.optgroup)').click(function(e) {
										el.focus();
										var clkd = $(this);
										if(!e.ctrlKey && !e.metaKey) clkd.addClass('selected');
										if(!e.shiftKey) clkd.addClass('first');
										if(!e.ctrlKey && !e.metaKey && !e.shiftKey) clkd.siblings().removeClass('selected first');

										// выделение пунктов при зажатом Ctrl
										if(e.ctrlKey || e.metaKey) {
											if (clkd.is('.selected')) clkd.removeClass('selected first');
												else clkd.addClass('selected first');
											clkd.siblings().removeClass('first');
										}

										// выделение пунктов при зажатом Shift
										if(e.shiftKey) {
											var prev = false,
													next = false;
											clkd.siblings().removeClass('selected').siblings('.first').addClass('selected');
											clkd.prevAll().each(function() {
												if ($(this).is('.first')) prev = true;
											});
											clkd.nextAll().each(function() {
												if ($(this).is('.first')) next = true;
											});
											if (prev) {
												clkd.prevAll().each(function() {
													if ($(this).is('.selected')) return false;
														else $(this).not('.disabled, .optgroup').addClass('selected');
												});
											}
											if (next) {
												clkd.nextAll().each(function() {
													if ($(this).is('.selected')) return false;
														else $(this).not('.disabled, .optgroup').addClass('selected');
												});
											}
											if (li.filter('.selected').length == 1) clkd.addClass('first');
										}

										// отмечаем выбранные мышью
										option.prop('selected', false);
										li.filter('.selected').each(function() {
											var t = $(this);
											var index = t.index();
											if (t.is('.option')) index -= t.prevAll('.optgroup').length;
											option.eq(index).prop('selected', true);
										});
										el.change();

									});

									// отмечаем выбранные с клавиатуры
									option.each(function(i) {
										$(this).data('optionIndex', i);
									});
									el.on('change.styler', function() {
										li.removeClass('selected');
										var arrIndexes = [];
										option.filter(':selected').each(function() {
											arrIndexes.push($(this).data('optionIndex'));
										});
										li.not('.optgroup').filter(function(i) {
											return $.inArray(i, arrIndexes) > -1;
										}).addClass('selected');
									})
									.on('focus.styler', function() {
										selectbox.addClass('focused');
									})
									.on('blur.styler', function() {
										selectbox.removeClass('focused');
									});

									// прокручиваем с клавиатуры
									if (ulHeight > selectbox.height()) {
										el.on('keydown.styler', function(e) {
											// вверх, влево, PageUp
											if (e.which == 38 || e.which == 37 || e.which == 33) {
												ul.scrollTop(ul.scrollTop() + li.filter('.selected').position().top - liHeight);
											}
											// вниз, вправо, PageDown
											if (e.which == 40 || e.which == 39 || e.which == 34) {
												ul.scrollTop(ul.scrollTop() + li.filter('.selected:last').position().top - ul.innerHeight() + liHeight * 2);
											}
										});
									}

								}
							} // end doMultipleSelect()

							if (el.is('[multiple]')) {

								// если Android или iOS, то мультиселект не стилизуем
								// причина для Android - в стилизованном селекте нет возможности выбрать несколько пунктов
								// причина для iOS - в стилизованном селекте неправильно отображаются выбранные пункты
								var Android = navigator.userAgent.match(/Android/i) ? true : false;
								var iOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false;
								if (Android || iOS) return;

								doMultipleSelect();
							} else {
								doSelect();
							}

						}; // end selectboxOutput()

						selectboxOutput();

						// обновление при динамическом изменении
						el.on('refresh', function() {
							el.off('.styler').parent().before(el).remove();
							selectboxOutput();
						});

					}
				});
			// end select

			// reset
			} else if (el.is(':reset')) {
				el.on('click', function() {
					setTimeout(function() {
						el.closest(opt.wrapper).find('input, select').trigger('refresh');
					}, 1);
				});
			}
			// end reset

		})

		// колбек после выполнения плагина
		.promise()
		.done(function() {
			opt.onFormStyled.call();
		});

	};
})(jQuery);
/*! JsRender v1.0.0-beta: http://github.com/BorisMoore/jsrender and http://jsviews.com/jsviews
 informal pre V1.0 commit counter: 56 */
/*
 * Optimized version of jQuery Templates, for rendering to string.
 * Does not require jQuery, or HTML DOM
 * Integrates with JsViews (http://jsviews.com/jsviews)
 *
 * Copyright 2014, Boris Moore
 * Released under the MIT License.
 */

(function(global, jQuery, undefined) {
    // global is the this object, which is window when running in the usual browser environment.
    "use strict";

    if (jQuery && jQuery.render || global.jsviews) { return; } // JsRender is already loaded

    //========================== Top-level vars ==========================

    var versionNumber = "v1.0.0-beta",

        $, jsvStoreName, rTag, rTmplString, indexStr, // nodeJsModule,

//TODO	tmplFnsCache = {},
        delimOpenChar0 = "{", delimOpenChar1 = "{", delimCloseChar0 = "}", delimCloseChar1 = "}", linkChar = "^",

        rPath = /^(!*?)(?:null|true|false|\d[\d.]*|([\w$]+|\.|~([\w$]+)|#(view|([\w$]+))?)([\w$.^]*?)(?:[.[^]([\w$]+)\]?)?)$/g,
    //                                     none   object     helper    view  viewProperty pathTokens      leafToken

        rParams = /(\()(?=\s*\()|(?:([([])\s*)?(?:(\^?)(!*?[#~]?[\w$.^]+)?\s*((\+\+|--)|\+|-|&&|\|\||===|!==|==|!=|<=|>=|[<>%*:?\/]|(=))\s*|(!*?[#~]?[\w$.^]+)([([])?)|(,\s*)|(\(?)\\?(?:(')|("))|(?:\s*(([)\]])(?=\s*\.|\s*\^|\s*$)|[)\]])([([]?))|(\s+)/g,
    //          lftPrn0        lftPrn        bound            path    operator err                                                eq             path2       prn    comma   lftPrn2   apos quot      rtPrn rtPrnDot                        prn2  space
    // (left paren? followed by (path? followed by operator) or (path followed by left paren?)) or comma or apos or quot or right paren or space

        rNewLine = /[ \t]*(\r\n|\n|\r)/g,
        rUnescapeQuotes = /\\(['"])/g,
        rEscapeQuotes = /['"\\]/g, // Escape quotes and \ character
        rBuildHash = /(?:\x08|^)(onerror:)?(?:(~?)(([\w$]+):)?([^\x08]+))\x08(,)?([^\x08]+)/gi,
        rTestElseIf = /^if\s/,
        rFirstElem = /<(\w+)[>\s]/,
        rAttrEncode = /[\x00`><"'&]/g, // Includes > encoding since rConvertMarkers in JsViews does not skip > characters in attribute strings
        rIsHtml = /[\x00`><\"'&]/,
        rHasHandlers = /^on[A-Z]|^convert(Back)?$/,
        rHtmlEncode = rAttrEncode,
        autoTmplName = 0,
        viewId = 0,
        charEntities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\x00": "&#0;",
            "'": "&#39;",
            '"': "&#34;",
            "`": "&#96;"
        },
        htmlStr = "html",
        tmplAttr = "data-jsv-tmpl",
        $render = {},
        jsvStores = {
            template: {
                compile: compileTmpl
            },
            tag: {
                compile: compileTag
            },
            helper: {},
            converter: {}
        },

    // jsviews object ($.views if jQuery is loaded)
        $views = {
            jsviews: versionNumber,
            settings: function(settings) {
                $extend($viewsSettings, settings);
                dbgMode($viewsSettings._dbgMode);
                if ($viewsSettings.jsv) {
                    $viewsSettings.jsv();
                }
            },
            sub: {
                // subscription, e.g. JsViews integration
                View: View,
                Err: JsViewsError,
                tmplFn: tmplFn,
                cvt: convertArgs,
                parse: parseParams,
                extend: $extend,
                syntaxErr: syntaxError,
                onStore: {},
                _lnk: retVal
            },
//			map: $views.dataMap || dataMap, // If jsObservable loaded first, use that definition of dataMap
            map: dataMap, // If jsObservable loaded first, use that definition of dataMap
            _cnvt: convertVal,
            _tag: renderTag,
            _err: error
        };

    function retVal(val) {
        return val;
    }

    function dbgBreak(val) {
        debugger;
        return val;
    }

    function dbgMode(debugMode) {
        $viewsSettings._dbgMode = debugMode;
        indexStr = debugMode ? "Unavailable (nested view): use #getIndex()" : ""; // If in debug mode set #index to a warning when in nested contexts
        $tags("dbg", $helpers.dbg = $converters.dbg = debugMode ? dbgBreak : retVal); // If in debug mode, register {{dbg/}}, {{dbg:...}} and ~dbg() to insert break points for debugging.
    }

    function JsViewsError(message) {
        // Error exception type for JsViews/JsRender
        // Override of $.views.sub.Error is possible
        this.name = ($.link ? "JsViews" : "JsRender") + " Error";
        this.message = message || this.name;
    }

    function $extend(target, source) {
        var name;
        for (name in source) {
            target[name] = source[name];
        }
        return target;
    }

    function $isFunction(ob) {
        return typeof ob === "function";
    }

    (JsViewsError.prototype = new Error()).constructor = JsViewsError;

    //========================== Top-level functions ==========================

    //===================
    // jsviews.delimiters
    //===================
    function $viewsDelimiters(openChars, closeChars, link) {
        // Set the tag opening and closing delimiters and 'link' character. Default is "{{", "}}" and "^"
        // openChars, closeChars: opening and closing strings, each with two characters

        if (!$sub.rTag || openChars) {
            delimOpenChar0 = openChars ? openChars.charAt(0) : delimOpenChar0; // Escape the characters - since they could be regex special characters
            delimOpenChar1 = openChars ? openChars.charAt(1) : delimOpenChar1;
            delimCloseChar0 = closeChars ? closeChars.charAt(0) : delimCloseChar0;
            delimCloseChar1 = closeChars ? closeChars.charAt(1) : delimCloseChar1;
            linkChar = link || linkChar;
            openChars = "\\" + delimOpenChar0 + "(\\" + linkChar + ")?\\" + delimOpenChar1;  // Default is "{^{"
            closeChars = "\\" + delimCloseChar0 + "\\" + delimCloseChar1;                   // Default is "}}"
            // Build regex with new delimiters
            //          tag    (followed by / space or })   or cvtr+colon or html or code
            rTag = "(?:(?:(\\w+(?=[\\/\\s\\" + delimCloseChar0 + "]))|(?:(\\w+)?(:)|(>)|!--((?:[^-]|-(?!-))*)--|(\\*)))"
                + "\\s*((?:[^\\" + delimCloseChar0 + "]|\\" + delimCloseChar0 + "(?!\\" + delimCloseChar1 + "))*?)";

            // make rTag available to JsViews (or other components) for parsing binding expressions
            $sub.rTag = rTag + ")";

            rTag = new RegExp(openChars + rTag + "(\\/)?|(?:\\/(\\w+)))" + closeChars, "g");

            // Default:    bind           tag       converter colon html     comment            code      params            slash   closeBlock
            //           /{(\^)?{(?:(?:(\w+(?=[\/\s}]))|(?:(\w+)?(:)|(>)|!--((?:[^-]|-(?!-))*)--|(\*)))\s*((?:[^}]|}(?!}))*?)(\/)?|(?:\/(\w+)))}}/g

            rTmplString = new RegExp("<.*>|([^\\\\]|^)[{}]|" + openChars + ".*" + closeChars);
            // rTmplString looks for html tags or { or } char not preceded by \\, or JsRender tags {{xxx}}. Each of these strings are considered
            // NOT to be jQuery selectors
        }
        return [delimOpenChar0, delimOpenChar1, delimCloseChar0, delimCloseChar1, linkChar];
    }

    //=========
    // View.get
    //=========

    function getView(inner, type) { //view.get(inner, type)
        if (!type) {
            // view.get(type)
            type = inner;
            inner = undefined;
        }

        var views, i, l, found,
            view = this,
            root = !type || type === "root";
        // If type is undefined, returns root view (view under top view).

        if (inner) {
            // Go through views - this one, and all nested ones, depth-first - and return first one with given type.
            found = view.type === type ? view : undefined;
            if (!found) {
                views = view.views;
                if (view._.useKey) {
                    for (i in views) {
                        if (found = views[i].get(inner, type)) {
                            break;
                        }
                    }
                } else {
                    for (i = 0, l = views.length; !found && i < l; i++) {
                        found = views[i].get(inner, type);
                    }
                }
            }
        } else if (root) {
            // Find root view. (view whose parent is top view)
            while (view.parent.parent) {
                found = view = view.parent;
            }
        } else {
            while (view && !found) {
                // Go through views - this one, and all parent ones - and return first one with given type.
                found = view.type === type ? view : undefined;
                view = view.parent;
            }
        }
        return found;
    }

    function getNestedIndex() {
        var view = this.get("item");
        return view ? view.index : undefined;
    }

    getNestedIndex.depends = function() {
        return [this.get("item"), "index"];
    };

    function getIndex() {
        return this.index;
    }

    getIndex.depends = function() {
        return ["index"];
    };

    //==========
    // View.hlp
    //==========

    function getHelper(helper) {
        // Helper method called as view.hlp(key) from compiled template, for helper functions or template parameters ~foo
        var wrapped,
            view = this,
            ctx = view.linkCtx,
            res = (view.ctx || {})[helper];

        if (res === undefined && ctx && ctx.ctx) {
            res = ctx.ctx[helper];
        }
        if (res === undefined) {
            res = $helpers[helper];
        }

        if (res) {
            if ($isFunction(res) && !res._wrp) {
                wrapped = function() {
                    // If it is of type function, and not already wrapped, we will wrap it, so if called with no this pointer it will be called with the
                    // view as 'this' context. If the helper ~foo() was in a data-link expression, the view will have a 'temporary' linkCtx property too.
                    // Note that helper functions on deeper paths will have specific this pointers, from the preceding path.
                    // For example, ~util.foo() will have the ~util object as 'this' pointer
                    return res.apply((!this || this === global) ? view : this, arguments);
                };
                wrapped._wrp = 1;
                $extend(wrapped, res); // Attach same expandos (if any) to the wrapped function
            }
        }
        return wrapped || res;
    }

    //==============
    // jsviews._cnvt
    //==============

    function convertVal(converter, view, tagCtx) {
        // self is template object or linkCtx object
        var tag, value, prop,
            boundTagCtx = +tagCtx === tagCtx && tagCtx, // if tagCtx is an integer, then it is the key for the boundTagCtx (compiled function to return the tagCtx)
            linkCtx = view.linkCtx; // For data-link="{cvt:...}"...

        if (boundTagCtx) {
            // This is a bound tag: {^{xx:yyy}}. Call compiled function which returns the tagCtxs for current data
            tagCtx = (boundTagCtx = view.tmpl.bnds[boundTagCtx-1])(view.data, view, $views);
        }

        value = tagCtx.args[0];
        if (converter || boundTagCtx) {
            tag = linkCtx && linkCtx.tag;
            if (!tag) {
                tag = {
                    _: {
                        inline: !linkCtx,
                        bnd: boundTagCtx
                    },
                    tagName: ":",
                    cvt: converter,
                    flow: true,
                    tagCtx: tagCtx,
                    _is: "tag"
                };
                if (linkCtx) {
                    linkCtx.tag = tag;
                    tag.linkCtx = linkCtx;
                    tagCtx.ctx = extendCtx(tagCtx.ctx, linkCtx.view.ctx);
                }
                $sub._lnk(tag);
            }
            for (prop in tagCtx.props) {
                if (rHasHandlers.test(prop)) {
                    tag[prop] = tagCtx.props[prop]; // Copy over the onFoo props from tagCtx.props to tag (overrides values in tagDef).
                    // Note: unsupported scenario: if handlers are dynamically added ^onFoo=expression this will work, but dynamically removing will not work.
                }
            }

            tagCtx.view = view;

            tag.ctx = tagCtx.ctx || {};
            delete tagCtx.ctx;
            // Provide this tag on view, for addBindingMarkers on bound tags to add the tag to view._.bnds, associated with the tag id,
            view._.tag = tag;

            value = convertArgs(tag, tag.convert || converter !== "true" && converter)[0]; // If there is a convertBack but no convert, converter will be "true"

            // Call onRender (used by JsViews if present, to add binding annotations around rendered content)
            value = boundTagCtx && view._.onRender
                ? view._.onRender(value, view, boundTagCtx)
                : value;
            view._.tag = undefined;
        }
        return value != undefined ? value : "";
    }

    function convertArgs(tag, converter) {
        var tagCtx = tag.tagCtx,
            view = tagCtx.view,
            args = tagCtx.args;

        converter = converter && ("" + converter === converter
            ? (view.getRsc("converters", converter) || error("Unknown converter: '"+ converter + "'"))
            : converter);

        args = !args.length && !tagCtx.index // On the opening tag with no args, bind the the current data context
            ? [view.data]
            : converter
            ? args.slice() // If there is a converter, use a copy of the tagCtx.args array for rendering, and replace the args[0] in
            // the copied array with the converted value. But we do not modify the value of tag.tagCtx.args[0] (the original args array)
            : args; // If no converter, render with the original tagCtx.args

        if (converter) {
            if (converter.depends) {
                tag.depends = $sub.getDeps(tag.depends, tag, converter.depends, converter);
            }
            args[0] = converter.apply(tag, args);
        }
        return args;
    }

    //=============
    // jsviews._tag
    //=============

    function getResource(resourceType, itemName) {
        var res, store,
            view = this;
        while ((res === undefined) && view) {
            store = view.tmpl[resourceType];
            res = store && store[itemName];
            view = view.parent;
        }
        return res || $views[resourceType][itemName];
    }

    function renderTag(tagName, parentView, tmpl, tagCtxs, isUpdate) {
        // Called from within compiled template function, to render a template tag
        // Returns the rendered tag

        var render, tag, tags, attr, parentTag, i, l, itemRet, tagCtx, tagCtxCtx, content, boundTagFn, tagDef,
            callInit, mapDef, thisMap, args, prop, props, initialTmpl,
            ret = "",
            boundTagKey = +tagCtxs === tagCtxs && tagCtxs, // if tagCtxs is an integer, then it is the boundTagKey
            linkCtx = parentView.linkCtx || 0,
            ctx = parentView.ctx,
            parentTmpl = tmpl || parentView.tmpl;

        if (tagName._is === "tag") {
            tag = tagName;
            tagName = tag.tagName;
            tagCtxs = tag.tagCtxs;
        }
        tag = tag || linkCtx.tag;

        // Provide tagCtx, linkCtx and ctx access from tag
        if (boundTagKey) {
            // if tagCtxs is an integer, we are data binding
            // Call compiled function which returns the tagCtxs for current data
            tagCtxs = (boundTagFn = parentTmpl.bnds[boundTagKey-1])(parentView.data, parentView, $views);
        }

        l = tagCtxs.length;
        for (i = 0; i < l; i++) {
            if (!i && (!tmpl || !tag)) {
                tagDef = parentView.getRsc("tags", tagName) || error("Unknown tag: {{"+ tagName + "}}");
            }
            tagCtx = tagCtxs[i];
            if (!linkCtx.tag) {
                // We are initializing tag, so for block tags, tagCtx.tmpl is an integer > 0
                content = tagCtx.tmpl;
                content = tagCtx.content = content && parentTmpl.tmpls[content - 1];

                $extend(tagCtx, {
                    tmpl: (tag ? tag : tagDef).template || content, // Set the tmpl property to the content of the block tag
                    render: renderContent,
                    // Possible future feature:
                    //var updatedValueOfArg0 = this.tagCtx.get(0);
                    //var test3 = this.tagCtx.get(0);
                    //var updatedValueOfPropFoo = this.tagCtx.get("foo");
                    //var updatedValueOfCtxPropFoo = this.tagCtx.get("~foo");
                    //_fns: {},
                    //get: function(key) {
                    //	return (this._fns[key] = this._fns[key] || new Function("data,view,j,u",
                    //		"return " + $.views.sub.parse(this.params[+key === key ? "args" : (key.charAt(0) === "~" ? (key = key.slice(1), "ctx") : "props")][key]) + ";")
                    //	)(this.view.data, this.view, $views);
                    //},
                    index: i,
                    view: parentView,
                    ctx: extendCtx(tagCtx.ctx, ctx) // Extend parentView.ctx
                }); // Extend parentView.ctx
            }
            if (tmpl = tagCtx.props.tmpl) {
                // If the tmpl property is overridden, set the value (when initializing, or, in case of binding: ^tmpl=..., when updating)
                tmpl = "" + tmpl === tmpl // if a string
                    ? parentView.getRsc("templates", tmpl) || $templates(tmpl)
                    : tmpl;

                tagCtx.tmpl = tmpl;
            }

            if (!tag) {
                // This will only be hit for initial tagCtx (not for {{else}}) - if the tag instance does not exist yet
                // Instantiate tag if it does not yet exist
                if (tagDef._ctr) {
                    // If the tag has not already been instantiated, we will create a new instance.
                    // ~tag will access the tag, even within the rendering of the template content of this tag.
                    // From child/descendant tags, can access using ~tag.parent, or ~parentTags.tagName
                    tag = new tagDef._ctr();
                    callInit = !!tag.init;

                    // Set attr on linkCtx to ensure outputting to the correct target attribute.
                    tag.attr = tag.attr || tagDef.attr || undefined;
                    // Setting either linkCtx.attr or this.attr in the init() allows per-instance choice of target attrib.
                } else {
                    // This is a simple tag declared as a function, or with init set to false. We won't instantiate a specific tag constructor - just a standard instance object.
                    $sub._lnk(tag = {
                        // tag instance object if no init constructor
                        render: tagDef.render
                    });
                }
                tag._ = {
                    inline: !linkCtx
                };
                if (linkCtx) {
                    // Set attr on linkCtx to ensure outputting to the correct target attribute.
                    linkCtx.attr = tag.attr = linkCtx.attr || tag.attr;
                    linkCtx.tag = tag;
                    tag.linkCtx = linkCtx;
                }
                if (tag._.bnd = boundTagFn || linkCtx.fn) {
                    // Bound if {^{tag...}} or data-link="{tag...}"
                    tag._.arrVws = {};
                } else if (tag.dataBoundOnly) {
                    error("{^{" + tagName + "}} tag must be data-bound");
                }
                tag.tagName = tagName;
                tag.parent = parentTag = ctx && ctx.tag;
                tag._is = "tag";
                tag._def = tagDef;
                tag.tagCtxs = tagCtxs;

                //TODO better perf for childTags() - keep child tag.tags array, (and remove child, when disposed)
                // tag.tags = [];
                // Provide this tag on view, for addBindingMarkers on bound tags to add the tag to view._.bnds, associated with the tag id,
            }
            if (!i) {
                for (prop in props = tagCtx.props) {
                    if (rHasHandlers.test(prop)) {
                        tag[prop] = props[prop]; // Copy over the onFoo or convert or convertBack props from tagCtx.props to tag (overrides values in tagDef).
                    }
                }
            }
            tagCtx.tag = tag;
            if (tag.dataMap && tag.tagCtxs) {
                tagCtx.map = tag.tagCtxs[i].map; // Copy over the compiled map instance from the previous tagCtxs to the refreshed ones
            }
            if (!tag.flow) {
                tagCtxCtx = tagCtx.ctx = tagCtx.ctx || {};

                // tags hash: tag.ctx.tags, merged with parentView.ctx.tags,
                tags = tag.parents = tagCtxCtx.parentTags = ctx && extendCtx(tagCtxCtx.parentTags, ctx.parentTags) || {};
                if (parentTag) {
                    tags[parentTag.tagName] = parentTag;
                    //TODO better perf for childTags: parentTag.tags.push(tag);
                }
                tagCtxCtx.tag = tag;
            }
        }
        parentView._.tag = tag;
        tag.rendering = {}; // Provide object for state during render calls to tag and elses. (Used by {{if}} and {{for}}...)
        for (i = 0; i < l; i++) {
            tagCtx = tag.tagCtx = tag.tagCtxs[i];
            props = tagCtx.props;
            args = convertArgs(tag, tag.convert);

            if (mapDef = props.dataMap || tag.dataMap) {
                if (args.length || props.dataMap) {
                    thisMap = tagCtx.map;
                    if (!thisMap || thisMap.src !== args[0] || isUpdate) {
                        if (thisMap && thisMap.src) {
                            thisMap.unmap(); // only called if observable map - not when only used in JsRender, e.g. by {{props}}
                        }
                        thisMap = tagCtx.map = mapDef.map(args[0], props);
                    }
                    args = [thisMap.tgt];
                }
            }
            tag.ctx = tagCtx.ctx;

            if (!i && callInit) {
                initialTmpl = tag.template;
                tag.init(tagCtx, linkCtx, tag.ctx);
                callInit = undefined;
                if (tag.template !== initialTmpl) {
                    tag._.tmpl = tag.template; // This will override the tag.template and also tagCtx.props.tmpl for all tagCtxs
                }
            }

            itemRet = undefined;
            render = tag.render;
            if (render = tag.render) {
                itemRet = render.apply(tag, args);
            }
            args = args.length ? args : [parentView]; // no arguments - get data context from view.
            itemRet = itemRet !== undefined
                ? itemRet // Return result of render function unless it is undefined, in which case return rendered template
                : tagCtx.render(args[0], true) || (isUpdate ? undefined : "");
            // No return value from render, and no template/content tagCtx.render(...), so return undefined
            ret = ret ? ret + (itemRet || "") : itemRet; // If no rendered content, this will be undefined
        }

        delete tag.rendering;

        tag.tagCtx = tag.tagCtxs[0];
        tag.ctx= tag.tagCtx.ctx;

        if (tag._.inline && (attr = tag.attr) && attr !== htmlStr) {
            // inline tag with attr set to "text" will insert HTML-encoded content - as if it was element-based innerText
            ret = attr === "text"
                ? $converters.html(ret)
                : "";
        }
        return boundTagKey && parentView._.onRender
            // Call onRender (used by JsViews if present, to add binding annotations around rendered content)
            ? parentView._.onRender(ret, parentView, boundTagKey)
            : ret;
    }

    //=================
    // View constructor
    //=================

    function View(context, type, parentView, data, template, key, contentTmpl, onRender) {
        // Constructor for view object in view hierarchy. (Augmented by JsViews if JsViews is loaded)
        var views, parentView_, tag,
            self = this,
            isArray = type === "array",
            self_ = {
                key: 0,
                useKey: isArray ? 0 : 1,
                id: "" + viewId++,
                onRender: onRender,
                bnds: {}
            };

        self.data = data;
        self.tmpl = template,
            self.content = contentTmpl;
        self.views = isArray ? [] : {};
        self.parent = parentView;
        self.type = type;
        // If the data is an array, this is an 'array view' with a views array for each child 'item view'
        // If the data is not an array, this is an 'item view' with a views 'hash' object for any child nested views
        // ._.useKey is non zero if is not an 'array view' (owning a data array). Use this as next key for adding to child views hash
        self._ = self_;
        self.linked = !!onRender;
        if (parentView) {
            views = parentView.views;
            parentView_ = parentView._;
            if (parentView_.useKey) {
                // Parent is an 'item view'. Add this view to its views object
                // self._key = is the key in the parent view hash
                views[self_.key = "_" + parentView_.useKey++] = self;
                self.index = indexStr;
                self.getIndex = getNestedIndex;
                tag = parentView_.tag;
                self_.bnd = isArray && (!tag || !!tag._.bnd && tag); // For array views that are data bound for collection change events, set the
                // view._.bnd property to true for top-level link() or data-link="{for}", or to the tag instance for a data-bound tag, e.g. {^{for ...}}
            } else {
                // Parent is an 'array view'. Add this view to its views array
                views.splice(
                    // self._.key = self.index - the index in the parent view array
                    self_.key = self.index = key,
                    0, self);
            }
            // If no context was passed in, use parent context
            // If context was passed in, it should have been merged already with parent context
            self.ctx = context || parentView.ctx;
        } else {
            self.ctx = context;
        }
    }

    View.prototype = {
        get: getView,
        getIndex: getIndex,
        getRsc: getResource,
        hlp: getHelper,
        _is: "view"
    };

    //=============
    // Registration
    //=============

    function compileChildResources(parentTmpl) {
        var storeName, resources, resourceName, resource, settings, compile, onStore;
        for (storeName in jsvStores) {
            settings = jsvStores[storeName];
            if ((compile = settings.compile) && (resources = parentTmpl[storeName + "s"])) {
                for (resourceName in resources) {
                    // compile child resource declarations (templates, tags, tags["for"] or helpers)
                    resource = resources[resourceName] = compile(resourceName, resources[resourceName], parentTmpl);
                    if (resource && (onStore = $sub.onStore[storeName])) {
                        // e.g. JsViews integration
                        onStore(resourceName, resource, compile);
                    }
                }
            }
        }
    }

    function compileTag(name, tagDef, parentTmpl) {
        var init, tmpl;
        if ($isFunction(tagDef)) {
            // Simple tag declared as function. No presenter instantation.
            tagDef = {
                depends: tagDef.depends,
                render: tagDef
            };
        } else {
            if (tagDef.baseTag) {
                tagDef.flow = !!tagDef.flow; // default to false even if baseTag has flow=true
                tagDef = $extend($extend({}, tagDef.baseTag), tagDef);
            }
            // Tag declared as object, used as the prototype for tag instantiation (control/presenter)
            if ((tmpl = tagDef.template) !== undefined) {
                tagDef.template = "" + tmpl === tmpl ? ($templates[tmpl] || $templates(tmpl)) : tmpl;
            }
            if (tagDef.init !== false) {
                // Set int: false on tagDef if you want to provide just a render method, or render and template, but no constuctor or prototype.
                // so equivalent to setting tag to render function, except you can also provide a template.
                init = tagDef._ctr = function() {};
                (init.prototype = tagDef).constructor = init;
            }
        }
        if (parentTmpl) {
            tagDef._parentTmpl = parentTmpl;
        }
        return tagDef;
    }

    function compileTmpl(name, tmpl, parentTmpl, options) {
        // tmpl is either a template object, a selector for a template script block, the name of a compiled template, or a template object

        //==== nested functions ====
        function tmplOrMarkupFromStr(value) {
            // If value is of type string - treat as selector, or name of compiled template
            // Return the template object, if already compiled, or the markup string

            if (("" + value === value) || value.nodeType > 0) {
                try {
                    elem = value.nodeType > 0
                        ? value
                        : !rTmplString.test(value)
                        // If value is a string and does not contain HTML or tag content, then test as selector
                        && jQuery && jQuery(global.document).find(value)[0]; // TODO address case where DOM is not available
                    // If selector is valid and returns at least one element, get first element
                    // If invalid, jQuery will throw. We will stay with the original string.
                } catch (e) {}

                if (elem) {
                    // Generally this is a script element.
                    // However we allow it to be any element, so you can for example take the content of a div,
                    // use it as a template, and replace it by the same content rendered against data.
                    // e.g. for linking the content of a div to a container, and using the initial content as template:
                    // $.link("#content", model, {tmpl: "#content"});

                    value = $templates[name = name || elem.getAttribute(tmplAttr)];
                    if (!value) {
                        // Not already compiled and cached, so compile and cache the name
                        // Create a name for compiled template if none provided
                        name = name || "_" + autoTmplName++;
                        elem.setAttribute(tmplAttr, name);
                        // Use tmpl as options
                        value = $templates[name] = compileTmpl(name, elem.innerHTML, parentTmpl, options);
                    }
                    elem = undefined;
                }
                return value;
            }
            // If value is not a string, return undefined
        }

        var tmplOrMarkup, elem;

        //==== Compile the template ====
        tmpl = tmpl || "";
        tmplOrMarkup = tmplOrMarkupFromStr(tmpl);

        // If options, then this was already compiled from a (script) element template declaration.
        // If not, then if tmpl is a template object, use it for options
        options = options || (tmpl.markup ? tmpl : {});
        options.tmplName = name;
        if (parentTmpl) {
            options._parentTmpl = parentTmpl;
        }
        // If tmpl is not a markup string or a selector string, then it must be a template object
        // In that case, get it from the markup property of the object
        if (!tmplOrMarkup && tmpl.markup && (tmplOrMarkup = tmplOrMarkupFromStr(tmpl.markup))) {
            if (tmplOrMarkup.fn && (tmplOrMarkup.debug !== tmpl.debug || tmplOrMarkup.allowCode !== tmpl.allowCode)) {
                // if the string references a compiled template object, but the debug or allowCode props are different, need to recompile
                tmplOrMarkup = tmplOrMarkup.markup;
            }
        }
        if (tmplOrMarkup !== undefined) {
            if (name && !parentTmpl) {
                $render[name] = function() {
                    return tmpl.render.apply(tmpl, arguments);
                };
            }
            if (tmplOrMarkup.fn || tmpl.fn) {
                // tmpl is already compiled, so use it, or if different name is provided, clone it
                if (tmplOrMarkup.fn) {
                    if (name && name !== tmplOrMarkup.tmplName) {
                        tmpl = extendCtx(options, tmplOrMarkup);
                    } else {
                        tmpl = tmplOrMarkup;
                    }
                }
            } else {
                // tmplOrMarkup is a markup string, not a compiled template
                // Create template object
                tmpl = TmplObject(tmplOrMarkup, options);
                // Compile to AST and then to compiled function
                tmplFn(tmplOrMarkup.replace(rEscapeQuotes, "\\$&"), tmpl);
            }
            compileChildResources(options);
            return tmpl;
        }
    }

    function dataMap(mapDef) {
        function newMap(source, options) {
            this.tgt = mapDef.getTgt(source, options);
        }

        if ($isFunction(mapDef)) {
            // Simple map declared as function
            mapDef = {
                getTgt: mapDef,
            };
        }

        if (mapDef.baseMap) {
            mapDef = $extend($extend({}, mapDef.baseMap), mapDef);
        }

        mapDef.map = function(source, options) {
            return new newMap(source, options);
        };
        return mapDef;
    }

    //==== /end of function compile ====

    function TmplObject(markup, options) {
        // Template object constructor
        var htmlTag,
            wrapMap = $viewsSettings.wrapMap || {},
            tmpl = $extend(
                {
                    markup: markup,
                    tmpls: [],
                    links: {}, // Compiled functions for link expressions
                    tags: {}, // Compiled functions for bound tag expressions
                    bnds: [],
                    _is: "template",
                    render: fastRender
                },
                options
            );

        if (!options.htmlTag) {
            // Set tmpl.tag to the top-level HTML tag used in the template, if any...
            htmlTag = rFirstElem.exec(markup);
            tmpl.htmlTag = htmlTag ? htmlTag[1].toLowerCase() : "";
        }
        htmlTag = wrapMap[tmpl.htmlTag];
        if (htmlTag && htmlTag !== wrapMap.div) {
            // When using JsViews, we trim templates which are inserted into HTML contexts where text nodes are not rendered (i.e. not 'Phrasing Content').
            // Currently not trimmed for <li> tag. (Not worth adding perf cost)
            tmpl.markup = $.trim(tmpl.markup);
        }

        return tmpl;
    }

    function registerStore(storeName, storeSettings) {

        function theStore(name, item, parentTmpl) {
            // The store is also the function used to add items to the store. e.g. $.templates, or $.views.tags

            // For store of name 'thing', Call as:
            //    $.views.things(items[, parentTmpl]),
            // or $.views.things(name, item[, parentTmpl])

            var onStore, compile, itemName, thisStore;

            if (name && typeof name === "object" && !name.nodeType && !name.markup && !name.getTgt) {
                // Call to $.views.things(items[, parentTmpl]),

                // Adding items to the store
                // If name is a hash, then item is parentTmpl. Iterate over hash and call store for key.
                for (itemName in name) {
                    theStore(itemName, name[itemName], item);
                }
                return $views;
            }
            // Adding a single unnamed item to the store
            if (item === undefined) {
                item = name;
                name = undefined;
            }
            if (name && "" + name !== name) { // name must be a string
                parentTmpl = item;
                item = name;
                name = undefined;
            }
            thisStore = parentTmpl ? parentTmpl[storeNames] = parentTmpl[storeNames] || {} : theStore;
            compile = storeSettings.compile;
            if (item === null) {
                // If item is null, delete this entry
                name && delete thisStore[name];
            } else {
                item = compile ? (item = compile(name, item, parentTmpl)) : item;
                name && (thisStore[name] = item);
            }
            if (compile && item) {
                item._is = storeName; // Only do this for compiled objects (tags, templates...)
            }
            if (item && (onStore = $sub.onStore[storeName])) {
                // e.g. JsViews integration
                onStore(name, item, compile);
            }
            return item;
        }

        var storeNames = storeName + "s";

        $views[storeNames] = theStore;
        jsvStores[storeName] = storeSettings;
    }

    //==============
    // renderContent
    //==============

    function $fastRender(data, context) {
        var tmplElem = this.jquery && (this[0] || error('Unknown template: "' + this.selector + '"')),
            tmpl = tmplElem.getAttribute(tmplAttr);

        return fastRender.call(tmpl ? $templates[tmpl] : $templates(tmplElem), data, context);
    }

    function tryFn(tmpl, data, view) {
        if ($viewsSettings._dbgMode) {
            try {
                return tmpl.fn(data, view, $views);
            }
            catch (e) {
                return error(e, view);
            }
        }
        return tmpl.fn(data, view, $views);
    }

    function fastRender(data, context, noIteration, parentView, key, onRender) {
        var self = this;
        if (!parentView && self.fn._nvw && !$.isArray(data)) {
            return tryFn(self, data, {tmpl: self});
        }
        return renderContent.call(self, data, context, noIteration, parentView, key, onRender);
    }

    function renderContent(data, context, noIteration, parentView, key, onRender) {
        // Render template against data as a tree of subviews (nested rendered template instances), or as a string (top-level template).
        // If the data is the parent view, treat as noIteration, re-render with the same data context.
        var i, l, dataItem, newView, childView, itemResult, swapContent, tagCtx, contentTmpl, tag_, outerOnRender, tmplName, tmpl, noViews,
            self = this,
            result = "";

        if (!!context === context) {
            noIteration = context; // passing boolean as second param - noIteration
            context = undefined;
        }

        if (key === true) {
            swapContent = true;
            key = 0;
        }

        if (self.tag) {
            // This is a call from renderTag or tagCtx.render(...)
            tagCtx = self;
            self = self.tag;
            tag_ = self._;
            tmplName = self.tagName;
            tmpl = tag_.tmpl || tagCtx.tmpl;
            noViews = self.attr && self.attr !== htmlStr,
                context = extendCtx(context, self.ctx);
            contentTmpl = tagCtx.content; // The wrapped content - to be added to views, below
            if (tagCtx.props.link === false) {
                // link=false setting on block tag
                // We will override inherited value of link by the explicit setting link=false taken from props
                // The child views of an unlinked view are also unlinked. So setting child back to true will not have any effect.
                context = context || {};
                context.link = false;
            }
            parentView = parentView || tagCtx.view;
            data = arguments.length ? data : parentView;
        } else {
            tmpl = self;
        }

        if (tmpl) {
            if (!parentView && data && data._is === "view") {
                parentView = data; // When passing in a view to render or link (and not passing in a parent view) use the passed in view as parentView
            }
            if (parentView) {
                contentTmpl = contentTmpl || parentView.content; // The wrapped content - to be added as #content property on views, below
                onRender = onRender || parentView._.onRender;
                if (data === parentView) {
                    // Inherit the data from the parent view.
                    // This may be the contents of an {{if}} block
                    data = parentView.data;
                }
                context = extendCtx(context, parentView.ctx);
            }
            if (!parentView || parentView.data === undefined) {
                (context = context || {}).root = data; // Provide ~root as shortcut to top-level data.
            }

            // Set additional context on views created here, (as modified context inherited from the parent, and to be inherited by child views)
            // Note: If no jQuery, $extend does not support chained copies - so limit extend() to two parameters

            if (!tmpl.fn) {
                tmpl = $templates[tmpl] || $templates(tmpl);
            }

            if (tmpl) {
                onRender = (context && context.link) !== false && !noViews && onRender;
                // If link===false, do not call onRender, so no data-linking marker nodes
                outerOnRender = onRender;
                if (onRender === true) {
                    // Used by view.refresh(). Don't create a new wrapper view.
                    outerOnRender = undefined;
                    onRender = parentView._.onRender;
                }
                context = tmpl.helpers
                    ? extendCtx(tmpl.helpers, context)
                    : context;
                if ($.isArray(data) && !noIteration) {
                    // Create a view for the array, whose child views correspond to each data item. (Note: if key and parentView are passed in
                    // along with parent view, treat as insert -e.g. from view.addViews - so parentView is already the view item for array)
                    newView = swapContent
                        ? parentView :
                        (key !== undefined && parentView) || new View(context, "array", parentView, data, tmpl, key, contentTmpl, onRender);
                    for (i = 0, l = data.length; i < l; i++) {
                        // Create a view for each data item.
                        dataItem = data[i];
                        childView = new View(context, "item", newView, dataItem, tmpl, (key || 0) + i, contentTmpl, onRender);
                        itemResult = tryFn(tmpl, dataItem, childView);
                        result += newView._.onRender ? newView._.onRender(itemResult, childView) : itemResult;
                    }
                } else {
                    // Create a view for singleton data object. The type of the view will be the tag name, e.g. "if" or "myTag" except for
                    // "item", "array" and "data" views. A "data" view is from programmatic render(object) against a 'singleton'.
                    if (parentView || !tmpl.fn._nvw) {
                        newView = swapContent ? parentView : new View(context, tmplName || "data", parentView, data, tmpl, key, contentTmpl, onRender);
                        if (tag_ && !self.flow) {
                            newView.tag = self;
                        }
                    }
                    result += tryFn(tmpl, data, newView);
                }
                return outerOnRender ? outerOnRender(result, newView) : result;
            }
        }
        return "";
    }

    //===========================
    // Build and compile template
    //===========================

    // Generate a reusable function that will serve to render a template against data
    // (Compile AST then build template function)

    function error(e, view, fallback) {
        var message = $viewsSettings.onError(e, view, fallback);
        if ("" + e === e) { // if e is a string, not an Exception, then throw new Exception
            throw new $sub.Err(message);
        }
        return !view.linkCtx && view.linked ? $converters.html(message) : message;
    }

    function syntaxError(message) {
        error("Syntax error\n" + message);
    }

    function tmplFn(markup, tmpl, isLinkExpr, convertBack) {
        // Compile markup to AST (abtract syntax tree) then build the template function code from the AST nodes
        // Used for compiling templates, and also by JsViews to build functions for data link expressions

        //==== nested functions ====
        function pushprecedingContent(shift) {
            shift -= loc;
            if (shift) {
                content.push(markup.substr(loc, shift).replace(rNewLine, "\\n"));
            }
        }

        function blockTagCheck(tagName) {
            tagName && syntaxError('Unmatched or missing tag: "{{/' + tagName + '}}" in template:\n' + markup);
        }

        function parseTag(all, bind, tagName, converter, colon, html, comment, codeTag, params, slash, closeBlock, index) {

            //    bind         tag        converter colon html     comment            code      params            slash   closeBlock
            // /{(\^)?{(?:(?:(\w+(?=[\/\s}]))|(?:(\w+)?(:)|(>)|!--((?:[^-]|-(?!-))*)--|(\*)))\s*((?:[^}]|}(?!}))*?)(\/)?|(?:\/(\w+)))}}/g
            // Build abstract syntax tree (AST): [tagName, converter, params, content, hash, bindings, contentMarkup]
            if (html) {
                colon = ":";
                converter = htmlStr;
            }
            slash = slash || isLinkExpr;
            var pathBindings = (bind || isLinkExpr) && [],
                props = "",
                args = "",
                ctxProps = "",
                paramsArgs = "",
                paramsProps = "",
                paramsCtxProps = "",
                onError = "",
                useTrigger = "",
            // Block tag if not self-closing and not {{:}} or {{>}} (special case) and not a data-link expression
                block = !slash && !colon && !comment;

            //==== nested helper function ====
            tagName = tagName || (params = params || "#data", colon); // {{:}} is equivalent to {{:#data}}
            pushprecedingContent(index);
            loc = index + all.length; // location marker - parsed up to here
            if (codeTag) {
                if (allowCode) {
                    content.push(["*", "\n" + params.replace(rUnescapeQuotes, "$1") + "\n"]);
                }
            } else if (tagName) {
                if (tagName === "else") {
                    if (rTestElseIf.test(params)) {
                        syntaxError('for "{{else if expr}}" use "{{else expr}}"');
                    }
                    pathBindings = current[7];
                    current[8] = markup.substring(current[8], index); // contentMarkup for block tag
                    current = stack.pop();
                    content = current[2];
                    block = true;
                }
                if (params) {
                    // remove newlines from the params string, to avoid compiled code errors for unterminated strings
                    parseParams(params.replace(rNewLine, " "), pathBindings, tmpl)
                        .replace(rBuildHash, function(all, onerror, isCtx, key, keyToken, keyValue, arg, param) {
                            if (arg) {
                                args += keyValue + ",";
                                paramsArgs += "'" + param + "',";
                            } else if (isCtx) {
                                ctxProps += key + keyValue + ",";
                                paramsCtxProps += key + "'" + param + "',";
                            } else if (onerror) {
                                onError += keyValue;
                            } else {
                                if (keyToken === "trigger") {
                                    useTrigger += keyValue;
                                }
                                props += key + keyValue + ",";
                                paramsProps += key + "'" + param + "',";
                                hasHandlers = hasHandlers || rHasHandlers.test(keyToken);
                            }
                            return "";
                        }).slice(0, -1);
                }

                newNode = [
                    tagName,
                        converter || !!convertBack || hasHandlers || "",
                        block && [],
                    parsedParam(paramsArgs, paramsProps, paramsCtxProps),
                    parsedParam(args, props, ctxProps),
                    onError,
                    useTrigger,
                        pathBindings || 0
                ];
                content.push(newNode);
                if (block) {
                    stack.push(current);
                    current = newNode;
                    current[8] = loc; // Store current location of open tag, to be able to add contentMarkup when we reach closing tag
                }
            } else if (closeBlock) {
                blockTagCheck(closeBlock !== current[0] && current[0] !== "else" && closeBlock);
                current[8] = markup.substring(current[8], index); // contentMarkup for block tag
                current = stack.pop();
            }
            blockTagCheck(!current && closeBlock);
            content = current[2];
        }
        //==== /end of nested functions ====

        var result, newNode, hasHandlers,
            allowCode = tmpl && tmpl.allowCode,
            astTop = [],
            loc = 0,
            stack = [],
            content = astTop,
            current = [,,astTop];

//TODO	result = tmplFnsCache[markup]; // Only cache if template is not named and markup length < ...,
//and there are no bindings or subtemplates?? Consider standard optimization for data-link="a.b.c"
//		if (result) {
//			tmpl.fn = result;
//		} else {

//		result = markup;
        if (isLinkExpr) {
            markup = delimOpenChar0 + markup + delimCloseChar1;
        }

        blockTagCheck(stack[0] && stack[0][2].pop()[0]);
        // Build the AST (abstract syntax tree) under astTop
        markup.replace(rTag, parseTag);

        pushprecedingContent(markup.length);

        if (loc = astTop[astTop.length - 1]) {
            blockTagCheck("" + loc !== loc && (+loc[8] === loc[8]) && loc[0]);
        }
//			result = tmplFnsCache[markup] = buildCode(astTop, tmpl);
//		}

        if (isLinkExpr) {
            result = buildCode(astTop, markup, isLinkExpr);
            result.paths = astTop[0][7]; // With data-link expressions, pathBindings array is astTop[0][7]
        } else {
            result = buildCode(astTop, tmpl);
        }
        if (result._nvw) {
            result._nvw = !/[~#]/.test(markup);
        }
        return result;
    }

    function parsedParam(args, props, ctx) {
        return [args.slice(0, -1), props.slice(0, -1), ctx.slice(0, -1)];
    }

    function paramStructure(parts, type) {
        return '\n\t' + (type ? type + ':{' : '') + 'args:[' + parts[0] + ']' + (parts[1] || !type ? ',\n\tprops:{' + parts[1] + '}' : "") + (parts[2] ? ',\n\tctx:{' + parts[2] + '}' : "");
    }

    function parseParams(params, bindings, tmpl) {

        function parseTokens(all, lftPrn0, lftPrn, bound, path, operator, err, eq, path2, prn, comma, lftPrn2, apos, quot, rtPrn, rtPrnDot, prn2, space, index, full) {
            //rParams = /(\()(?=\s*\()|(?:([([])\s*)?(?:(\^?)(!*?[#~]?[\w$.^]+)?\s*((\+\+|--)|\+|-|&&|\|\||===|!==|==|!=|<=|>=|[<>%*:?\/]|(=))\s*|(!*?[#~]?[\w$.^]+)([([])?)|(,\s*)|(\(?)\\?(?:(')|("))|(?:\s*(([)\]])(?=\s*\.|\s*\^)|[)\]])([([]?))|(\s+)/g,
            //          lftPrn0        lftPrn        bound            path    operator err                                                eq             path2       prn    comma   lftPrn2   apos quot      rtPrn rtPrnDot                    prn2   space
            // (left paren? followed by (path? followed by operator) or (path followed by paren?)) or comma or apos or quot or right paren or space
            operator = operator || "";
            lftPrn = lftPrn || lftPrn0 || lftPrn2;
            path = path || path2;
            prn = prn || prn2 || "";

            var expr, isFn, exprFn;

            function parsePath(allPath, not, object, helper, view, viewProperty, pathTokens, leafToken) {
                // rPath = /^(?:null|true|false|\d[\d.]*|(!*?)([\w$]+|\.|~([\w$]+)|#(view|([\w$]+))?)([\w$.^]*?)(?:[.[^]([\w$]+)\]?)?)$/g,
                //                                        none   object     helper    view  viewProperty pathTokens      leafToken
                if (object) {
                    if (bindings) {
                        if (named === "linkTo") {
                            bindto = bindings._jsvto = bindings._jsvto || [];
                            bindto.push(path);
                        }
                        if (!named || boundName) {
                            bindings.push(path.slice(not.length)); // Add path binding for paths on props and args,
                        }
                    }
                    if (object !== ".") {
                        var ret = (helper
                            ? 'view.hlp("' + helper + '")'
                            : view
                            ? "view"
                            : "data")
                            + (leafToken
                                ? (viewProperty
                                ? "." + viewProperty
                                : helper
                                ? ""
                                : (view ? "" : "." + object)
                                ) + (pathTokens || "")
                                : (leafToken = helper ? "" : view ? viewProperty || "" : object, ""));

                        ret = ret + (leafToken ? "." + leafToken : "");

                        return not + (ret.slice(0, 9) === "view.data"
                            ? ret.slice(5) // convert #view.data... to data...
                            : ret);
                    }
                }
                return allPath;
            }

            if (err && !aposed && !quoted) {
                syntaxError(params);
            } else {
                if (bindings && rtPrnDot && !aposed && !quoted) {
                    // This is a binding to a path in which an object is returned by a helper/data function/expression, e.g. foo()^x.y or (a?b:c)^x.y
                    // We create a compiled function to get the object instance (which will be called when the dependent data of the subexpression changes, to return the new object, and trigger re-binding of the subsequent path)
                    if (!named || boundName || bindto) {
                        expr = pathStart[parenDepth];
                        if (full.length - 1 > index - expr) { // We need to compile a subexpression
                            expr = full.slice(expr, index + 1);
                            rtPrnDot = delimOpenChar1 + ":" + expr + delimCloseChar0; // The parameter or function subexpression
                            exprFn = tmplLinks[rtPrnDot];
                            if (!exprFn) {
                                tmplLinks[rtPrnDot] = 1; // Flag that this exprFn (for rtPrnDot) is being compiled
                                tmplLinks[rtPrnDot] = exprFn = tmplFn(rtPrnDot, tmpl || bindings, true); // Compile the expression (or use cached copy already in tmpl.links)
                                exprFn.paths.push({_jsvOb: exprFn}); //list.push({_jsvOb: rtPrnDot});
                            }
                            if (exprFn !== 1) { // If not reentrant call during compilation
                                (bindto || bindings).push({_jsvOb: exprFn}); // Insert special object for in path bindings, to be used for binding the compiled sub expression ()
                            }
                        }
                    }
                }
                return (aposed
                    // within single-quoted string
                    ? (aposed = !apos, (aposed ? all : '"'))
                    : quoted
                    // within double-quoted string
                    ? (quoted = !quot, (quoted ? all : '"'))
                    :
                    (
                        (lftPrn
                            ? (parenDepth++, pathStart[parenDepth] = index++, lftPrn)
                            : "")
                        + (space
                        ? (parenDepth
                        ? ""
                        : (paramIndex = full.slice(paramIndex, index), named
                        ? (named = boundName = bindto = false, "\b")
                        : "\b,") + paramIndex + (paramIndex = index + all.length, "\b")
                        )
                        : eq
                        // named param
                        // Insert backspace \b (\x08) as separator for named params, used subsequently by rBuildHash
                        ? (parenDepth && syntaxError(params), named = path, boundName = bound, paramIndex = index + all.length, /*pushBindings(),*/ path + ':')
                        : path
                        // path
                        ? (path.split("^").join(".").replace(rPath, parsePath)
                        + (prn
                            ? (fnCall[++parenDepth] = true, path.charAt(0) !== "." && (pathStart[parenDepth] = index), isFn ? "" : prn)
                            : operator)
                        )
                        : operator
                        ? operator
                        : rtPrn
                        // function
                        ? ((fnCall[parenDepth--] = false, rtPrn)
                        + (prn
                            ? (fnCall[++parenDepth] = true, prn)
                            : "")
                        )
                        : comma
                        ? (fnCall[parenDepth] || syntaxError(params), ",") // We don't allow top-level literal arrays or objects
                        : lftPrn0
                        ? ""
                        : (aposed = apos, quoted = quot, '"')
                        ))
                    );
            }
        }
        var named, bindto, boundName,
            quoted, // boolean for string content in double quotes
            aposed, // or in single quotes
            paramIndex = 0, // list,
            tmplLinks = tmpl ? tmpl.links : bindings && (bindings.links = bindings.links || {}),
            fnCall = {},
            pathStart = {0:-1},
            parenDepth = 0;

        //pushBindings();
        return (params + (tmpl ? " " : ""))
            .replace(/\)\^/g, ").") // Treat "...foo()^bar..." as equivalent to "...foo().bar..."
            //since preceding computed observables in the path will always be updated if their dependencies change
            .replace(rParams, parseTokens);
    }

    function buildCode(ast, tmpl, isLinkExpr) {
        // Build the template function code from the AST nodes, and set as property on the passed-in template object
        // Used for compiling templates, and also by JsViews to build functions for data link expressions
        var i, node, tagName, converter, tagCtx, hasTag, hasEncoder, getsVal, hasCnvt, needView, useCnvt, tmplBindings, pathBindings, params,
            nestedTmpls, tmplName, nestedTmpl, tagAndElses, content, markup, nextIsElse, oldCode, isElse, isGetVal, tagCtxFn, onError, tagStart, trigger,
            tmplBindingKey = 0,
            code = "",
            tmplOptions = {},
            l = ast.length;

        if ("" + tmpl === tmpl) {
            tmplName = isLinkExpr ? 'data-link="' + tmpl.replace(rNewLine, " ").slice(1, -1) + '"' : tmpl;
            tmpl = 0;
        } else {
            tmplName = tmpl.tmplName || "unnamed";
            if (tmpl.allowCode) {
                tmplOptions.allowCode = true;
            }
            if (tmpl.debug) {
                tmplOptions.debug = true;
            }
            tmplBindings = tmpl.bnds;
            nestedTmpls = tmpl.tmpls;
        }
        for (i = 0; i < l; i++) {
            // AST nodes: [tagName, converter, content, params, code, onError, pathBindings, contentMarkup, link]
            node = ast[i];

            // Add newline for each callout to t() c() etc. and each markup string
            if ("" + node === node) {
                // a markup string to be inserted
                code += '\n+"' + node + '"';
            } else {
                // a compiled tag expression to be inserted
                tagName = node[0];
                if (tagName === "*") {
                    // Code tag: {{* }}
                    code += ";\n" + node[1] + "\nret=ret";
                } else {
                    converter = node[1];
                    content = node[2];
                    tagCtx = paramStructure(node[3], 'params') + '},' + paramStructure(params = node[4]);
                    onError = node[5];
                    trigger = node[6];
                    markup = node[8];
                    if (!(isElse = tagName === "else")) {
                        tmplBindingKey = 0;
                        if (tmplBindings && (pathBindings = node[7])) { // Array of paths, or false if not data-bound
                            tmplBindingKey = tmplBindings.push(pathBindings);
                        }
                    }
                    if (isGetVal = tagName === ":") {
                        if (converter) {
                            tagName = converter === htmlStr ? ">" : converter + tagName;
                        }
                    } else {
                        if (content) {
                            // Create template object for nested template
                            nestedTmpl = TmplObject(markup, tmplOptions);
                            nestedTmpl.tmplName = tmplName + "/" + tagName;
                            // Compile to AST and then to compiled function
                            buildCode(content, nestedTmpl);
                            nestedTmpls.push(nestedTmpl);
                        }

                        if (!isElse) {
                            // This is not an else tag.
                            tagAndElses = tagName;
                            // Switch to a new code string for this bound tag (and its elses, if it has any) - for returning the tagCtxs array
                            oldCode = code;
                            code = "";
                        }
                        nextIsElse = ast[i + 1];
                        nextIsElse = nextIsElse && nextIsElse[0] === "else";
                    }
                    tagStart = (onError ? ";\ntry{\nret+=" : "\n+");

                    if (isGetVal && (pathBindings || trigger || converter && converter !== htmlStr)) {
                        // For convertVal we need a compiled function to return the new tagCtx(s)
                        tagCtxFn = "return {" + tagCtx + "};";
                        if (onError) {
                            tagCtxFn = "try {\n" + tagCtxFn + '\n}catch(e){return {error: j._err(e,view,' + onError + ')}}\n';
                        }
                        tagCtxFn = new Function("data,view,j,u", " // " + tmplName + " " + tmplBindingKey + " " + tagName
                            + "\n" + tagCtxFn);

                        tagCtxFn.paths = pathBindings;
                        tagCtxFn._tag = tagName;
                        if (isLinkExpr) {
                            return tagCtxFn;
                        }
                        useCnvt = 1;
                    }
                    code += (isGetVal
                        ? (isLinkExpr ? (onError ? "\ntry{\n" : "") + "return " : tagStart) + (useCnvt // Call _cnvt if there is a converter: {{cnvt: ... }} or {^{cnvt: ... }}
                        ? (useCnvt = 0, needView = hasCnvt = true, 'c("' + converter + '",view,' + (pathBindings
                        ? ((tmplBindings[tmplBindingKey - 1] = tagCtxFn), tmplBindingKey) // Store the compiled tagCtxFn in tmpl.bnds, and pass the key to convertVal()
                        : "{" + tagCtx + "}") + ")")
                        : tagName === ">"
                        ? (hasEncoder = true, "h(" + params[0] + ')')
                        : (getsVal = true, "((v=" + params[0] + ')!=null?v:"")') // Strict equality just for data-link="title{:expr}" so expr=null will remove title attribute
                        )
                        : (needView = hasTag = true, "\n{view:view,tmpl:" // Add this tagCtx to the compiled code for the tagCtxs to be passed to renderTag()
                        + (content ? nestedTmpls.length : "0") + "," // For block tags, pass in the key (nestedTmpls.length) to the nested content template
                        + tagCtx + "},"));

                    if (tagAndElses && !nextIsElse) {
                        code = "[" + code.slice(0, -1) + "]"; // This is a data-link expression or the last {{else}} of an inline bound tag. We complete the code for returning the tagCtxs array
                        if (isLinkExpr || pathBindings) {
                            // This is a bound tag (data-link expression or inline bound tag {^{tag ...}}) so we store a compiled tagCtxs function in tmp.bnds
                            code = new Function("data,view,j,u", " // " + tmplName + " " + tmplBindingKey + " " + tagAndElses + "\nreturn " + code + ";");
                            if (pathBindings) {
                                (tmplBindings[tmplBindingKey - 1] = code).paths = pathBindings;
                            }
                            code._tag = tagName;
                            if (isLinkExpr) {
                                return code; // For a data-link expression we return the compiled tagCtxs function
                            }
                        }

                        // This is the last {{else}} for an inline tag.
                        // For a bound tag, pass the tagCtxs fn lookup key to renderTag.
                        // For an unbound tag, include the code directly for evaluating tagCtxs array
                        code = oldCode + tagStart + 't("' + tagAndElses + '",view,this,' + (tmplBindingKey || code) + ")";
                        pathBindings = 0;
                        tagAndElses = 0;
                    }
                    if (onError) {
                        needView = true;
                        code += ';\n}catch(e){ret' + (isLinkExpr ? "urn " : "+=") + 'j._err(e,view,' + onError + ');}\n' + (isLinkExpr ? "" : 'ret=ret');
                    }
                }
            }
        }
        // Include only the var references that are needed in the code
        code = "// " + tmplName

            + "\nj=j||" + (jQuery ? "jQuery." : "jsviews.") + "views;var v"
            + (hasTag ? ",t=j._tag" : "")                // has tag
            + (hasCnvt ? ",c=j._cnvt" : "")              // converter
            + (hasEncoder ? ",h=j.converters.html":"") // html converter
            + (isLinkExpr ? ";\n" : ',ret=""\n')
            + (tmplOptions.debug ? "debugger;" : "")
            + code
            + (isLinkExpr ? "\n" : ";\nreturn ret;");
        try {
            code = new Function("data,view,j,u", code);
        } catch (e) {
            syntaxError("Compiled template code:\n\n" + code + '\n: "' + e.message + '"');
        }
        if (tmpl) {
            tmpl.fn = code;
        }
        if (!needView) {
            code._nvw = true;
        }
        return code;
    }

    //==========
    // Utilities
    //==========

    // Merge objects, in particular contexts which inherit from parent contexts
    function extendCtx(context, parentContext) {
        // Return copy of parentContext, unless context is defined and is different, in which case return a new merged context
        // If neither context nor parentContext are defined, return undefined
        return context && context !== parentContext
            ? (parentContext
            ? $extend($extend({}, parentContext), context)
            : context)
            : parentContext && $extend({}, parentContext);
    }

    // Get character entity for HTML and Attribute encoding
    function getCharEntity(ch) {
        return charEntities[ch] || (charEntities[ch] = "&#" + ch.charCodeAt(0) + ";");
    }

    //========================== Initialize ==========================

    for (jsvStoreName in jsvStores) {
        registerStore(jsvStoreName, jsvStores[jsvStoreName]);
    }

    var $templates = $views.templates,
        $converters = $views.converters,
        $helpers = $views.helpers,
        $tags = $views.tags,
        $sub = $views.sub,
        $viewsSettings = $views.settings;

    if (jQuery) {
        ////////////////////////////////////////////////////////////////////////////////////////////////
        // jQuery is loaded, so make $ the jQuery object
        $ = jQuery;
        $.fn.render = $fastRender;
        if ($.observable) {
            $extend($sub, $.views.sub); // jquery.observable.js was loaded before jsrender.js
            $views.map = $.views.map;
        }
    } else {
        ////////////////////////////////////////////////////////////////////////////////////////////////
        // jQuery is not loaded.

        $ = global.jsviews = {};

        $.isArray = Array && Array.isArray || function(obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        };

        //	//========================== Future Node.js support ==========================
        //	if ((nodeJsModule = global.module) && nodeJsModule.exports) {
        //		nodeJsModule.exports = $;
        //	}
    }

    $.render = $render;
    $.views = $views;
    $.templates = $templates = $views.templates;

    $viewsSettings({
        debugMode: dbgMode,
        delimiters: $viewsDelimiters,
        onError: function(e, view, fallback) {
            // Can override using $.views.settings({onError: function(...) {...}});
            if (view) {
                // For render errors, e is an exception thrown in compiled template, and view is the current view. For other errors, e is an error string.
                e = fallback === undefined
                    ? "{Error: " + e + "}"
                    : $isFunction(fallback)
                    ? fallback(e, view) : fallback;
            }
            return e == undefined ? "" : e;
        },
        _dbgMode: true
    });

    //========================== Register tags ==========================

    $tags({
        "else": function() {}, // Does nothing but ensures {{else}} tags are recognized as valid
        "if": {
            render: function(val) {
                // This function is called once for {{if}} and once for each {{else}}.
                // We will use the tag.rendering object for carrying rendering state across the calls.
                // If not done (a previous block has not been rendered), look at expression for this block and render the block if expression is truthy
                // Otherwise return ""
                var self = this,
                    ret = (self.rendering.done || !val && (arguments.length || !self.tagCtx.index))
                        ? ""
                        : (self.rendering.done = true, self.selected = self.tagCtx.index,
                        // Test is satisfied, so render content on current context. We call tagCtx.render() rather than return undefined
                        // (which would also render the tmpl/content on the current context but would iterate if it is an array)
                        self.tagCtx.render(self.tagCtx.view, true)); // no arg, so renders against parentView.data
                return ret;
            },
            onUpdate: function(ev, eventArgs, tagCtxs) {
                var tci, prevArg, different;
                for (tci = 0; (prevArg = this.tagCtxs[tci]) && prevArg.args.length; tci++) {
                    prevArg = prevArg.args[0];
                    different = !prevArg !== !tagCtxs[tci].args[0];
                    if ((!this.convert && !!prevArg) || different) {
                        return different;
                        // If there is no converter, and newArg and prevArg are both truthy, return false to cancel update. (Even if values on later elses are different, we still don't want to update, since rendered output would be unchanged)
                        // If newArg and prevArg are different, return true, to update
                        // If newArg and prevArg are both falsey, move to the next {{else ...}}
                    }
                }
                // Boolean value of all args are unchanged (falsey), so return false to cancel update
                return false;
            },
            flow: true
        },
        "for": {
            render: function(val) {
                // This function is called once for {{for}} and once for each {{else}}.
                // We will use the tag.rendering object for carrying rendering state across the calls.
                var finalElse,
                    self = this,
                    tagCtx = self.tagCtx,
                    result = "",
                    done = 0;

                if (!self.rendering.done) {
                    if (finalElse = !arguments.length) {
                        val = tagCtx.view.data; // For the final else, defaults to current data without iteration.
                    }
                    if (val !== undefined) {
                        result += tagCtx.render(val, finalElse); // Iterates except on final else, if data is an array. (Use {{include}} to compose templates without array iteration)
                        done += $.isArray(val) ? val.length : 1;
                    }
                    if (self.rendering.done = done) {
                        self.selected = tagCtx.index;
                    }
                    // If nothing was rendered we will look at the next {{else}}. Otherwise, we are done.
                }
                return result;
            },
            flow: true
        },
        include: {
            flow: true
        },
        "*": {
            // {{* code... }} - Ignored if template.allowCode is false. Otherwise include code in compiled template
            render: retVal,
            flow: true
        }
    });

    function getTargetProps(source) {
        // this pointer is theMap - which has tagCtx.props too
        // arguments: tagCtx.args.
        var key, prop,
            props = [];

        if (typeof source === "object") {
            for (key in source) {
                prop = source[key];
                if (!prop || !prop.toJSON || prop.toJSON()) {
                    if (!$isFunction(prop)) {
                        props.push({ key: key, prop: prop });
                    }
                }
            }
        }
        return props;
    }

    $tags("props", {
        baseTag: $tags["for"],
        dataMap: dataMap(getTargetProps)
    });

    //========================== Register converters ==========================

    function htmlEncode(text) {
        // HTML encode: Replace < > & ' and " by corresponding entities.
        return text != null ? rIsHtml.test(text) && ("" + text).replace(rHtmlEncode, getCharEntity) || text : "";
    }

    $converters({
        html: htmlEncode,
        attr: htmlEncode, // Includes > encoding since rConvertMarkers in JsViews does not skip > characters in attribute strings
        url: function(text) {
            // URL encoding helper.
            return text != undefined ? encodeURI("" + text) : text === null ? text : ""; // null returns null, e.g. to remove attribute. undefined returns ""
        }
    });

    //========================== Define default delimiters ==========================
    $viewsDelimiters();

})(this, this.jQuery);
Share = {
    //https://vk.com/dev/share_details
    vkontakte: function(purl, ptitle, pimg, text) {
        url  = 'http://vkontakte.ru/share.php?';
        url += 'url='          + encodeURIComponent(purl);
        url += '&title='       + encodeURIComponent(ptitle);
        url += '&description=' + encodeURIComponent(text);
        url += '&image='       + encodeURIComponent(pimg);
        url += '&noparse=true';
        Share.popup(url);
    },
    odnoklassniki: function(purl, text) {
        url  = 'http://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1';
        url += '&st.comments=' + encodeURIComponent(text);
        url += '&st._surl='    + encodeURIComponent(purl);
        Share.popup(url);
    },
    facebook: function(purl) {
        url  = 'https://www.facebook.com/sharer/sharer.php?';
        url += 'u='       + encodeURIComponent(purl);
        Share.popup(url);
    },
    mailru: function(purl, ptitle, pimg, text) {
        url  = 'http://connect.mail.ru/share?';
        url += 'url='          + encodeURIComponent(purl);
        url += '&title='       + encodeURIComponent(ptitle);
        url += '&description=' + encodeURIComponent(text);
        url += '&image_url='    + encodeURIComponent(pimg);
        Share.popup(url)
    },
    gplus: function(purl) {
        url  = 'https://plus.google.com/share?';
        url += 'url='          + encodeURIComponent(purl);
        Share.popup(url)
    },
    popup: function(url) {
        window.open(url,'','toolbar=0,status=0,width=626,height=436');
    }
};

(function($) {
    $(document).ready(function(){

        $('.b-spoiler__link').click(function(event) {
            event.preventDefault();

            var parent = $(this).closest('.b-spoiler');

            if(parent.hasClass('open')) {
                $('.b-spoiler__content', parent).stop().slideUp('fast', function(){
                    parent.removeClass('open');
                });
            } else {
                $('.b-spoiler__content', parent).stop().slideDown('fast', function(){
                    parent.addClass('open');
                });
            }
        });

        $('.b-post__gif').click(function(){
            if($(this).hasClass('preload')){
                var $img = $(this).children('img'),
                    src = $img.attr('src');
                    $parent = $(this).closest('.b-post__content'),
                    $item = $parent.children('.b-post__expand'),
                    $cut = $('.b-post__cut', $parent);
                    $parent.css({'maxHeight': 'none', 'height': 'auto'});
                    if($cut.length){
                        $cut.slideDown('fast', function(){
                            $item.hide('fast');
                        });
                    } else {
                        $item.hide('fast');
                    }
                $img.attr('src', $img.data('img')).data('img', src);
                $(this).removeClass('preload');
            } else {
                var $img = $(this).children('img'),
                    src = $img.attr('src');
                $img.attr('src', $img.data('img')).data('img', src);
                $(this).addClass('preload');
            }
            return false;
        });

        $('.js-sidebar-control').click(function(){
            var sidebar = $('.b-sidebar');

            if($(this).hasClass('close')){
                sidebar.removeClass('close');
                $(this).removeClass('close');
                if(!sidebar.hasClass('minimize')){
                    $('.container').removeClass('maximized');
                }
            } else {
                sidebar.addClass('close');
                $(this).addClass('close');

                $('.container').addClass('maximized');
            }

            return false;
        });

        $('.js-minimize-sidebar').click(function(){
            var sidebar = $('.b-sidebar');

            if(sidebar.hasClass('minimize')){
                sidebar.removeClass('minimize');
                $(this).removeClass('minimized').html('Свернуть');
                $('.container').removeClass('maximized');
            } else {
                sidebar.addClass('minimize');
                $(this).addClass('minimized').html('Развернуть');
                $('.container').addClass('maximized');
            }

            return false;
        });

        $('.b-sidebar__menu-l').hover(function(){
            if($('.b-sidebar').hasClass('minimize')){
                var html = $(this).html(),
                    parent = $(this).parent();
                parent.append('<span class="b-sidebar__menu-t">'+html+'</span>');
            }

        }, function(){
            var parent = $(this).parent();
            parent.children('.b-sidebar__menu-t').remove();
        });



        $('body').on('click', '.b-post__expand', function(){
            var $parent = $(this).parent(),
                $item = $(this),
                $cut = $('.b-post__cut', $parent);
            $parent.css({'maxHeight': 'none', 'height': 'auto'});
            if($cut.length){
                $('.b-post__cut', $parent).slideDown('fast', function(){
                    $item.hide('fast');
                });
            } else {
                $item.hide('fast');
            }

        });

        $('.js-file').styler({
            filePlaceholder: '',
            fileBrowse: 'Добавить изображение'
        });

        $('.anim-scroll').click(function(){
            $('.anim-scroll').removeClass('current');
            $(this).addClass('current');
            scrollto_c($(this).prop("hash"));
            return false;
        });

        ZeroClipboard.config( { swfPath: "swf/ZeroClipboard.swf" } );

        var client = new ZeroClipboard($(".pr-copy"));

        client.on( "copy", function (event) {
            var clipboard = event.clipboardData;
        });

        $('.pr-tooltip').tooltip({
            position: { my: "center bottom-10", at: "center top" }
        });

        $('.pr-scroll-top').click(function(){
            $('html, body').animate({
                scrollTop: 0
            }, 500);
        });
        var $scroolTopBtn = $('.pr-scroll-top'),
            scrollTopBtnStatus = false;
        $(window).scroll(function(){
            if($(this).scrollTop() > 500){
                if(!scrollTopBtnStatus) {
                    $scroolTopBtn.stop().animate({
                        opacity: 1
                    }, 200);
                }
                scrollTopBtnStatus = true;
            } else {
                if(scrollTopBtnStatus) {
                    $scroolTopBtn.stop().animate({
                        opacity: 0
                    }, 200);
                }
                scrollTopBtnStatus = false;
            }
        });

        var replyTemplate = $('#template_reply');
        $('.js-reply').click(function(){
            $('.js-reply__block').remove();
            $('.b-comments__bottom').show('fast');
            var $parent = $(this).closest('.b-comments__content');
            $parent.append(replyTemplate.render());
            $parent.children('.b-comments__bottom').hide('fast');
            $('.js-file').styler({
                filePlaceholder: '',
                fileBrowse: 'Добавить изображение'
            });
        });

        $('.b-comments__show-nrati').on('touchstart click', function(){
            var $parent = $(this).closest('.b-comments__item'),
                $content = $parent.find('.b-comments__text'),
                $item = $parent.find('.b-comments__nrati');

            $content.show('fast');

            $item.hide('fast').remove();

            return false;
        });
    });

    $(window).load(function() {
        $('.b-post__content').not('.b-post__content_full').each(function(){
            if($(this).height() > 500){
                $(this).height(500).append('<div class="b-post__expand">показать все</div>');
            }
        });

        if(location.hash){
            setTimeout(function(){
                scrollto_c(location.hash);
            },1);

        }
    });
}(jQuery));

/*
 *  Кнопка Редактировать комментарий.
 *
 *  @param {object} - объект кнопки
 *  @param {int} - доступное время для редактирования
 * */
function editButtonCount(button, time) {
    if (typeof button == "undefined" || button == "") return false;
    if (typeof time == "undefined" || time == "") time = 60;

    var interval = setInterval(function() {
        button.html('Редактировать '+--time+' сек');

        if (time <= 0) {
            button.remove();
            clearInterval(interval);
        }
    }, 1000);
}

/*
 * Плавная прокрутка
 *
 * param {string} Id объекта к которому нужно скролить
 * */
function scrollto_c(elem){
    console.log(elem);
    $('html, body').animate({
        scrollTop: $(elem).offset().top - 150
    }, 500);
}