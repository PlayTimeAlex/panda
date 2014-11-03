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
/*
 * @fileOverview TouchSwipe - jQuery Plugin
 * @version 1.6.6
 *
 * @author Matt Bryson http://www.github.com/mattbryson
 * @see https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
 * @see http://labs.skinkers.com/touchSwipe/
 * @see http://plugins.jquery.com/project/touchSwipe
 *
 * Copyright (c) 2010 Matt Bryson
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */

/*
 *
 * Changelog
 * $Date: 2010-12-12 (Wed, 12 Dec 2010) $
 * $version: 1.0.0
 * $version: 1.0.1 - removed multibyte comments
 *
 * $Date: 2011-21-02 (Mon, 21 Feb 2011) $
 * $version: 1.1.0 	- added allowPageScroll property to allow swiping and scrolling of page
 *					- changed handler signatures so one handler can be used for multiple events
 * $Date: 2011-23-02 (Wed, 23 Feb 2011) $
 * $version: 1.2.0 	- added click handler. This is fired if the user simply clicks and does not swipe. The event object and click target are passed to handler.
 *					- If you use the http://code.google.com/p/jquery-ui-for-ipad-and-iphone/ plugin, you can also assign jQuery mouse events to children of a touchSwipe object.
 * $version: 1.2.1 	- removed console log!
 *
 * $version: 1.2.2 	- Fixed bug where scope was not preserved in callback methods.
 *
 * $Date: 2011-28-04 (Thurs, 28 April 2011) $
 * $version: 1.2.4 	- Changed licence terms to be MIT or GPL inline with jQuery. Added check for support of touch events to stop non compatible browsers erroring.
 *
 * $Date: 2011-27-09 (Tues, 27 September 2011) $
 * $version: 1.2.5 	- Added support for testing swipes with mouse on desktop browser (thanks to https://github.com/joelhy)
 *
 * $Date: 2012-14-05 (Mon, 14 May 2012) $
 * $version: 1.2.6 	- Added timeThreshold between start and end touch, so user can ignore slow swipes (thanks to Mark Chase). Default is null, all swipes are detected
 *
 * $Date: 2012-05-06 (Tues, 05 June 2012) $
 * $version: 1.2.7 	- Changed time threshold to have null default for backwards compatibility. Added duration param passed back in events, and refactored how time is handled.
 *
 * $Date: 2012-05-06 (Tues, 05 June 2012) $
 * $version: 1.2.8 	- Added the possibility to return a value like null or false in the trigger callback. In that way we can control when the touch start/move should take effect or not (simply by returning in some cases return null; or return false;) This effects the ontouchstart/ontouchmove event.
 *
 * $Date: 2012-06-06 (Wed, 06 June 2012) $
 * $version: 1.3.0 	- Refactored whole plugin to allow for methods to be executed, as well as exposed defaults for user override. Added 'enable', 'disable', and 'destroy' methods
 *
 * $Date: 2012-05-06 (Fri, 05 June 2012) $
 * $version: 1.3.1 	- Bug fixes  - bind() with false as last argument is no longer supported in jQuery 1.6, also, if you just click, the duration is now returned correctly.
 *
 * $Date: 2012-29-07 (Sun, 29 July 2012) $
 * $version: 1.3.2	- Added fallbackToMouseEvents option to NOT capture mouse events on non touch devices.
 * 			- Added "all" fingers value to the fingers property, so any combination of fingers triggers the swipe, allowing event handlers to check the finger count
 *
 * $Date: 2012-09-08 (Thurs, 9 Aug 2012) $
 * $version: 1.3.3	- Code tidy prep for minefied version
 *
 * $Date: 2012-04-10 (wed, 4 Oct 2012) $
 * $version: 1.4.0	- Added pinch support, pinchIn and pinchOut
 *
 * $Date: 2012-11-10 (Thurs, 11 Oct 2012) $
 * $version: 1.5.0	- Added excludedElements, a jquery selector that specifies child elements that do NOT trigger swipes. By default, this is one select that removes all form, input select, button and anchor elements.
 *
 * $Date: 2012-22-10 (Mon, 22 Oct 2012) $
 * $version: 1.5.1	- Fixed bug with jQuery 1.8 and trailing comma in excludedElements
 *					- Fixed bug with IE and eventPreventDefault()
 * $Date: 2013-01-12 (Fri, 12 Jan 2013) $
 * $version: 1.6.0	- Fixed bugs with pinching, mainly when both pinch and swipe enabled, as well as adding time threshold for multifinger gestures, so releasing one finger beofre the other doesnt trigger as single finger gesture.
 *					- made the demo site all static local HTML pages so they can be run locally by a developer
 *					- added jsDoc comments and added documentation for the plugin
 *					- code tidy
 *					- added triggerOnTouchLeave property that will end the event when the user swipes off the element.
 * $Date: 2013-03-23 (Sat, 23 Mar 2013) $
 * $version: 1.6.1	- Added support for ie8 touch events
 * $version: 1.6.2	- Added support for events binding with on / off / bind in jQ for all callback names.
 *                   - Deprecated the 'click' handler in favour of tap.
 *                   - added cancelThreshold property
 *                   - added option method to update init options at runtime
 * $version 1.6.3    - added doubletap, longtap events and longTapThreshold, doubleTapThreshold property
 *
 * $Date: 2013-04-04 (Thurs, 04 April 2013) $
 * $version 1.6.4    - Fixed bug with cancelThreshold introduced in 1.6.3, where swipe status no longer fired start event, and stopped once swiping back.
 *
 * $Date: 2013-08-24 (Sat, 24 Aug 2013) $
 * $version 1.6.5    - Merged a few pull requests fixing various bugs, added AMD support.
 *
 * $Date: 2014-06-04 (Wed, 04 June 2014) $
 * $version 1.6.6 	- Merge of pull requests.
 *    				- IE10 touch support
 *    				- Only prevent default event handling on valid swipe
 *    				- Separate license/changelog comment
 *    				- Detect if the swipe is valid at the end of the touch event.
 *    				- Pass fingerdata to event handlers.
 *    				- Add 'hold' gesture
 *    				- Be more tolerant about the tap distance
 *    				- Typos and minor fixes
 */

/**
 * See (http://jquery.com/).
 * @name $
 * @class
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */

/**
 * See (http://jquery.com/)
 * @name fn
 * @class
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 * @memberOf $
 */



(function (factory) {
    if (typeof define === 'function' && define.amd && define.amd.jQuery) {
        // AMD. Register as anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals.
        factory(jQuery);
    }
}(function ($) {
    "use strict";

    //Constants
    var LEFT = "left",
        RIGHT = "right",
        UP = "up",
        DOWN = "down",
        IN = "in",
        OUT = "out",

        NONE = "none",
        AUTO = "auto",

        SWIPE = "swipe",
        PINCH = "pinch",
        TAP = "tap",
        DOUBLE_TAP = "doubletap",
        LONG_TAP = "longtap",
        HOLD = "hold",

        HORIZONTAL = "horizontal",
        VERTICAL = "vertical",

        ALL_FINGERS = "all",

        DOUBLE_TAP_THRESHOLD = 10,

        PHASE_START = "start",
        PHASE_MOVE = "move",
        PHASE_END = "end",
        PHASE_CANCEL = "cancel",

        SUPPORTS_TOUCH = 'ontouchstart' in window,

        SUPPORTS_POINTER_IE10 = window.navigator.msPointerEnabled && !window.navigator.pointerEnabled,

        SUPPORTS_POINTER = window.navigator.pointerEnabled || window.navigator.msPointerEnabled,

        PLUGIN_NS = 'TouchSwipe';



    /**
     * The default configuration, and available options to configure touch swipe with.
     * You can set the default values by updating any of the properties prior to instantiation.
     * @name $.fn.swipe.defaults
     * @namespace
     * @property {int} [fingers=1] The number of fingers to detect in a swipe. Any swipes that do not meet this requirement will NOT trigger swipe handlers.
     * @property {int} [threshold=75] The number of pixels that the user must move their finger by before it is considered a swipe.
     * @property {int} [cancelThreshold=null] The number of pixels that the user must move their finger back from the original swipe direction to cancel the gesture.
     * @property {int} [pinchThreshold=20] The number of pixels that the user must pinch their finger by before it is considered a pinch.
     * @property {int} [maxTimeThreshold=null] Time, in milliseconds, between touchStart and touchEnd must NOT exceed in order to be considered a swipe.
     * @property {int} [fingerReleaseThreshold=250] Time in milliseconds between releasing multiple fingers.  If 2 fingers are down, and are released one after the other, if they are within this threshold, it counts as a simultaneous release.
     * @property {int} [longTapThreshold=500] Time in milliseconds between tap and release for a long tap
     * @property {int} [doubleTapThreshold=200] Time in milliseconds between 2 taps to count as a double tap
     * @property {function} [swipe=null] A handler to catch all swipes. See {@link $.fn.swipe#event:swipe}
     * @property {function} [swipeLeft=null] A handler that is triggered for "left" swipes. See {@link $.fn.swipe#event:swipeLeft}
     * @property {function} [swipeRight=null] A handler that is triggered for "right" swipes. See {@link $.fn.swipe#event:swipeRight}
     * @property {function} [swipeUp=null] A handler that is triggered for "up" swipes. See {@link $.fn.swipe#event:swipeUp}
     * @property {function} [swipeDown=null] A handler that is triggered for "down" swipes. See {@link $.fn.swipe#event:swipeDown}
     * @property {function} [swipeStatus=null] A handler triggered for every phase of the swipe. See {@link $.fn.swipe#event:swipeStatus}
     * @property {function} [pinchIn=null] A handler triggered for pinch in events. See {@link $.fn.swipe#event:pinchIn}
     * @property {function} [pinchOut=null] A handler triggered for pinch out events. See {@link $.fn.swipe#event:pinchOut}
     * @property {function} [pinchStatus=null] A handler triggered for every phase of a pinch. See {@link $.fn.swipe#event:pinchStatus}
     * @property {function} [tap=null] A handler triggered when a user just taps on the item, rather than swipes it. If they do not move, tap is triggered, if they do move, it is not.
     * @property {function} [doubleTap=null] A handler triggered when a user double taps on the item. The delay between taps can be set with the doubleTapThreshold property. See {@link $.fn.swipe.defaults#doubleTapThreshold}
     * @property {function} [longTap=null] A handler triggered when a user long taps on the item. The delay between start and end can be set with the longTapThreshold property. See {@link $.fn.swipe.defaults#longTapThreshold}
     * @property (function) [hold=null] A handler triggered when a user reaches longTapThreshold on the item. See {@link $.fn.swipe.defaults#longTapThreshold}
     * @property {boolean} [triggerOnTouchEnd=true] If true, the swipe events are triggered when the touch end event is received (user releases finger).  If false, it will be triggered on reaching the threshold, and then cancel the touch event automatically.
     * @property {boolean} [triggerOnTouchLeave=false] If true, then when the user leaves the swipe object, the swipe will end and trigger appropriate handlers.
     * @property {string|undefined} [allowPageScroll='auto'] How the browser handles page scrolls when the user is swiping on a touchSwipe object. See {@link $.fn.swipe.pageScroll}.  <br/><br/>
     <code>"auto"</code> : all undefined swipes will cause the page to scroll in that direction. <br/>
     <code>"none"</code> : the page will not scroll when user swipes. <br/>
     <code>"horizontal"</code> : will force page to scroll on horizontal swipes. <br/>
     <code>"vertical"</code> : will force page to scroll on vertical swipes. <br/>
     * @property {boolean} [fallbackToMouseEvents=true] If true mouse events are used when run on a non touch device, false will stop swipes being triggered by mouse events on non tocuh devices.
     * @property {string} [excludedElements="button, input, select, textarea, a, .noSwipe"] A jquery selector that specifies child elements that do NOT trigger swipes. By default this excludes all form, input, select, button, anchor and .noSwipe elements.

     */
    var defaults = {
        fingers: 1,
        threshold: 75,
        cancelThreshold:null,
        pinchThreshold:20,
        maxTimeThreshold: null,
        fingerReleaseThreshold:250,
        longTapThreshold:500,
        doubleTapThreshold:200,
        swipe: null,
        swipeLeft: null,
        swipeRight: null,
        swipeUp: null,
        swipeDown: null,
        swipeStatus: null,
        pinchIn:null,
        pinchOut:null,
        pinchStatus:null,
        click:null, //Deprecated since 1.6.2
        tap:null,
        doubleTap:null,
        longTap:null,
        hold:null,
        triggerOnTouchEnd: true,
        triggerOnTouchLeave:false,
        allowPageScroll: "auto",
        fallbackToMouseEvents: true,
        excludedElements:"label, button, input, select, textarea, a, .noSwipe"
    };



    /**
     * Applies TouchSwipe behaviour to one or more jQuery objects.
     * The TouchSwipe plugin can be instantiated via this method, or methods within
     * TouchSwipe can be executed via this method as per jQuery plugin architecture.
     * @see TouchSwipe
     * @class
     * @param {Mixed} method If the current DOMNode is a TouchSwipe object, and <code>method</code> is a TouchSwipe method, then
     * the <code>method</code> is executed, and any following arguments are passed to the TouchSwipe method.
     * If <code>method</code> is an object, then the TouchSwipe class is instantiated on the current DOMNode, passing the
     * configuration properties defined in the object. See TouchSwipe
     *
     */
    $.fn.swipe = function (method) {
        var $this = $(this),
            plugin = $this.data(PLUGIN_NS);

        //Check if we are already instantiated and trying to execute a method
        if (plugin && typeof method === 'string') {
            if (plugin[method]) {
                return plugin[method].apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.swipe');
            }
        }
        //Else not instantiated and trying to pass init object (or nothing)
        else if (!plugin && (typeof method === 'object' || !method)) {
            return init.apply(this, arguments);
        }

        return $this;
    };

    //Expose our defaults so a user could override the plugin defaults
    $.fn.swipe.defaults = defaults;

    /**
     * The phases that a touch event goes through.  The <code>phase</code> is passed to the event handlers.
     * These properties are read only, attempting to change them will not alter the values passed to the event handlers.
     * @namespace
     * @readonly
     * @property {string} PHASE_START Constant indicating the start phase of the touch event. Value is <code>"start"</code>.
     * @property {string} PHASE_MOVE Constant indicating the move phase of the touch event. Value is <code>"move"</code>.
     * @property {string} PHASE_END Constant indicating the end phase of the touch event. Value is <code>"end"</code>.
     * @property {string} PHASE_CANCEL Constant indicating the cancel phase of the touch event. Value is <code>"cancel"</code>.
     */
    $.fn.swipe.phases = {
        PHASE_START: PHASE_START,
        PHASE_MOVE: PHASE_MOVE,
        PHASE_END: PHASE_END,
        PHASE_CANCEL: PHASE_CANCEL
    };

    /**
     * The direction constants that are passed to the event handlers.
     * These properties are read only, attempting to change them will not alter the values passed to the event handlers.
     * @namespace
     * @readonly
     * @property {string} LEFT Constant indicating the left direction. Value is <code>"left"</code>.
     * @property {string} RIGHT Constant indicating the right direction. Value is <code>"right"</code>.
     * @property {string} UP Constant indicating the up direction. Value is <code>"up"</code>.
     * @property {string} DOWN Constant indicating the down direction. Value is <code>"cancel"</code>.
     * @property {string} IN Constant indicating the in direction. Value is <code>"in"</code>.
     * @property {string} OUT Constant indicating the out direction. Value is <code>"out"</code>.
     */
    $.fn.swipe.directions = {
        LEFT: LEFT,
        RIGHT: RIGHT,
        UP: UP,
        DOWN: DOWN,
        IN : IN,
        OUT: OUT
    };

    /**
     * The page scroll constants that can be used to set the value of <code>allowPageScroll</code> option
     * These properties are read only
     * @namespace
     * @readonly
     * @see $.fn.swipe.defaults#allowPageScroll
     * @property {string} NONE Constant indicating no page scrolling is allowed. Value is <code>"none"</code>.
     * @property {string} HORIZONTAL Constant indicating horizontal page scrolling is allowed. Value is <code>"horizontal"</code>.
     * @property {string} VERTICAL Constant indicating vertical page scrolling is allowed. Value is <code>"vertical"</code>.
     * @property {string} AUTO Constant indicating either horizontal or vertical will be allowed, depending on the swipe handlers registered. Value is <code>"auto"</code>.
     */
    $.fn.swipe.pageScroll = {
        NONE: NONE,
        HORIZONTAL: HORIZONTAL,
        VERTICAL: VERTICAL,
        AUTO: AUTO
    };

    /**
     * Constants representing the number of fingers used in a swipe.  These are used to set both the value of <code>fingers</code> in the
     * options object, as well as the value of the <code>fingers</code> event property.
     * These properties are read only, attempting to change them will not alter the values passed to the event handlers.
     * @namespace
     * @readonly
     * @see $.fn.swipe.defaults#fingers
     * @property {string} ONE Constant indicating 1 finger is to be detected / was detected. Value is <code>1</code>.
     * @property {string} TWO Constant indicating 2 fingers are to be detected / were detected. Value is <code>1</code>.
     * @property {string} THREE Constant indicating 3 finger are to be detected / were detected. Value is <code>1</code>.
     * @property {string} ALL Constant indicating any combination of finger are to be detected.  Value is <code>"all"</code>.
     */
    $.fn.swipe.fingers = {
        ONE: 1,
        TWO: 2,
        THREE: 3,
        ALL: ALL_FINGERS
    };

    /**
     * Initialise the plugin for each DOM element matched
     * This creates a new instance of the main TouchSwipe class for each DOM element, and then
     * saves a reference to that instance in the elements data property.
     * @internal
     */
    function init(options) {
        //Prep and extend the options
        if (options && (options.allowPageScroll === undefined && (options.swipe !== undefined || options.swipeStatus !== undefined))) {
            options.allowPageScroll = NONE;
        }

        //Check for deprecated options
        //Ensure that any old click handlers are assigned to the new tap, unless we have a tap
        if(options.click!==undefined && options.tap===undefined) {
            options.tap = options.click;
        }

        if (!options) {
            options = {};
        }

        //pass empty object so we dont modify the defaults
        options = $.extend({}, $.fn.swipe.defaults, options);

        //For each element instantiate the plugin
        return this.each(function () {
            var $this = $(this);

            //Check we havent already initialised the plugin
            var plugin = $this.data(PLUGIN_NS);

            if (!plugin) {
                plugin = new TouchSwipe(this, options);
                $this.data(PLUGIN_NS, plugin);
            }
        });
    }

    /**
     * Main TouchSwipe Plugin Class.
     * Do not use this to construct your TouchSwipe object, use the jQuery plugin method $.fn.swipe(); {@link $.fn.swipe}
     * @private
     * @name TouchSwipe
     * @param {DOMNode} element The HTML DOM object to apply to plugin to
     * @param {Object} options The options to configure the plugin with.  @link {$.fn.swipe.defaults}
     * @see $.fh.swipe.defaults
     * @see $.fh.swipe
     * @class
     */
    function TouchSwipe(element, options) {
        var useTouchEvents = (SUPPORTS_TOUCH || SUPPORTS_POINTER || !options.fallbackToMouseEvents),
            START_EV = useTouchEvents ? (SUPPORTS_POINTER ? (SUPPORTS_POINTER_IE10 ? 'MSPointerDown' : 'pointerdown') : 'touchstart') : 'mousedown',
            MOVE_EV = useTouchEvents ? (SUPPORTS_POINTER ? (SUPPORTS_POINTER_IE10 ? 'MSPointerMove' : 'pointermove') : 'touchmove') : 'mousemove',
            END_EV = useTouchEvents ? (SUPPORTS_POINTER ? (SUPPORTS_POINTER_IE10 ? 'MSPointerUp' : 'pointerup') : 'touchend') : 'mouseup',
            LEAVE_EV = useTouchEvents ? null : 'mouseleave', //we manually detect leave on touch devices, so null event here
            CANCEL_EV = (SUPPORTS_POINTER ? (SUPPORTS_POINTER_IE10 ? 'MSPointerCancel' : 'pointercancel') : 'touchcancel');



        //touch properties
        var distance = 0,
            direction = null,
            duration = 0,
            startTouchesDistance = 0,
            endTouchesDistance = 0,
            pinchZoom = 1,
            pinchDistance = 0,
            pinchDirection = 0,
            maximumsMap=null;



        //jQuery wrapped element for this instance
        var $element = $(element);

        //Current phase of th touch cycle
        var phase = "start";

        // the current number of fingers being used.
        var fingerCount = 0;

        //track mouse points / delta
        var fingerData=null;

        //track times
        var startTime = 0,
            endTime = 0,
            previousTouchEndTime=0,
            previousTouchFingerCount=0,
            doubleTapStartTime=0;

        //Timeouts
        var singleTapTimeout=null,
            holdTimeout=null;

        // Add gestures to all swipable areas if supported
        try {
            $element.bind(START_EV, touchStart);
            $element.bind(CANCEL_EV, touchCancel);
        }
        catch (e) {
            $.error('events not supported ' + START_EV + ',' + CANCEL_EV + ' on jQuery.swipe');
        }

        //
        //Public methods
        //

        /**
         * re-enables the swipe plugin with the previous configuration
         * @function
         * @name $.fn.swipe#enable
         * @return {DOMNode} The Dom element that was registered with TouchSwipe
         * @example $("#element").swipe("enable");
         */
        this.enable = function () {
            $element.bind(START_EV, touchStart);
            $element.bind(CANCEL_EV, touchCancel);
            return $element;
        };

        /**
         * disables the swipe plugin
         * @function
         * @name $.fn.swipe#disable
         * @return {DOMNode} The Dom element that is now registered with TouchSwipe
         * @example $("#element").swipe("disable");
         */
        this.disable = function () {
            removeListeners();
            return $element;
        };

        /**
         * Destroy the swipe plugin completely. To use any swipe methods, you must re initialise the plugin.
         * @function
         * @name $.fn.swipe#destroy
         * @return {DOMNode} The Dom element that was registered with TouchSwipe
         * @example $("#element").swipe("destroy");
         */
        this.destroy = function () {
            removeListeners();
            $element.data(PLUGIN_NS, null);
            return $element;
        };


        /**
         * Allows run time updating of the swipe configuration options.
         * @function
         * @name $.fn.swipe#option
         * @param {String} property The option property to get or set
         * @param {Object} [value] The value to set the property to
         * @return {Object} If only a property name is passed, then that property value is returned.
         * @example $("#element").swipe("option", "threshold"); // return the threshold
         * @example $("#element").swipe("option", "threshold", 100); // set the threshold after init
         * @see $.fn.swipe.defaults
         *
         */
        this.option = function (property, value) {
            if(options[property]!==undefined) {
                if(value===undefined) {
                    return options[property];
                } else {
                    options[property] = value;
                }
            } else {
                $.error('Option ' + property + ' does not exist on jQuery.swipe.options');
            }

            return null;
        }

        //
        // Private methods
        //

        //
        // EVENTS
        //
        /**
         * Event handler for a touch start event.
         * Stops the default click event from triggering and stores where we touched
         * @inner
         * @param {object} jqEvent The normalised jQuery event object.
         */
        function touchStart(jqEvent) {
            //If we already in a touch event (a finger already in use) then ignore subsequent ones..
            if( getTouchInProgress() )
                return;

            //Check if this element matches any in the excluded elements selectors,  or its parent is excluded, if so, DON'T swipe
            if( $(jqEvent.target).closest( options.excludedElements, $element ).length>0 )
                return;

            //As we use Jquery bind for events, we need to target the original event object
            //If these events are being programmatically triggered, we don't have an original event object, so use the Jq one.
            var event = jqEvent.originalEvent ? jqEvent.originalEvent : jqEvent;

            var ret,
                evt = SUPPORTS_TOUCH ? event.touches[0] : event;

            phase = PHASE_START;

            //If we support touches, get the finger count
            if (SUPPORTS_TOUCH) {
                // get the total number of fingers touching the screen
                fingerCount = event.touches.length;
            }
            //Else this is the desktop, so stop the browser from dragging the image
            else {
                jqEvent.preventDefault(); //call this on jq event so we are cross browser
            }

            //clear vars..
            distance = 0;
            direction = null;
            pinchDirection=null;
            duration = 0;
            startTouchesDistance=0;
            endTouchesDistance=0;
            pinchZoom = 1;
            pinchDistance = 0;
            fingerData=createAllFingerData();
            maximumsMap=createMaximumsData();
            cancelMultiFingerRelease();


            // check the number of fingers is what we are looking for, or we are capturing pinches
            if (!SUPPORTS_TOUCH || (fingerCount === options.fingers || options.fingers === ALL_FINGERS) || hasPinches()) {
                // get the coordinates of the touch
                createFingerData( 0, evt );
                startTime = getTimeStamp();

                if(fingerCount==2) {
                    //Keep track of the initial pinch distance, so we can calculate the diff later
                    //Store second finger data as start
                    createFingerData( 1, event.touches[1] );
                    startTouchesDistance = endTouchesDistance = calculateTouchesDistance(fingerData[0].start, fingerData[1].start);
                }

                if (options.swipeStatus || options.pinchStatus) {
                    ret = triggerHandler(event, phase);
                }
            }
            else {
                //A touch with more or less than the fingers we are looking for, so cancel
                ret = false;
            }

            //If we have a return value from the users handler, then return and cancel
            if (ret === false) {
                phase = PHASE_CANCEL;
                triggerHandler(event, phase);
                return ret;
            }
            else {
                if (options.hold) {
                    holdTimeout = setTimeout($.proxy(function() {
                        //Trigger the event
                        $element.trigger('hold', [event.target]);
                        //Fire the callback
                        if(options.hold) {
                            ret = options.hold.call($element, event, event.target);
                        }
                    }, this), options.longTapThreshold );
                }

                setTouchInProgress(true);
            }

            return null;
        };



        /**
         * Event handler for a touch move event.
         * If we change fingers during move, then cancel the event
         * @inner
         * @param {object} jqEvent The normalised jQuery event object.
         */
        function touchMove(jqEvent) {

            //As we use Jquery bind for events, we need to target the original event object
            //If these events are being programmatically triggered, we don't have an original event object, so use the Jq one.
            var event = jqEvent.originalEvent ? jqEvent.originalEvent : jqEvent;

            //If we are ending, cancelling, or within the threshold of 2 fingers being released, don't track anything..
            if (phase === PHASE_END || phase === PHASE_CANCEL || inMultiFingerRelease())
                return;

            var ret,
                evt = SUPPORTS_TOUCH ? event.touches[0] : event;


            //Update the  finger data
            var currentFinger = updateFingerData(evt);
            endTime = getTimeStamp();

            if (SUPPORTS_TOUCH) {
                fingerCount = event.touches.length;
            }

            if (options.hold)
                clearTimeout(holdTimeout);

            phase = PHASE_MOVE;

            //If we have 2 fingers get Touches distance as well
            if(fingerCount==2) {

                //Keep track of the initial pinch distance, so we can calculate the diff later
                //We do this here as well as the start event, in case they start with 1 finger, and the press 2 fingers
                if(startTouchesDistance==0) {
                    //Create second finger if this is the first time...
                    createFingerData( 1, event.touches[1] );

                    startTouchesDistance = endTouchesDistance = calculateTouchesDistance(fingerData[0].start, fingerData[1].start);
                } else {
                    //Else just update the second finger
                    updateFingerData(event.touches[1]);

                    endTouchesDistance = calculateTouchesDistance(fingerData[0].end, fingerData[1].end);
                    pinchDirection = calculatePinchDirection(fingerData[0].end, fingerData[1].end);
                }


                pinchZoom = calculatePinchZoom(startTouchesDistance, endTouchesDistance);
                pinchDistance = Math.abs(startTouchesDistance - endTouchesDistance);
            }


            if ( (fingerCount === options.fingers || options.fingers === ALL_FINGERS) || !SUPPORTS_TOUCH || hasPinches() ) {

                direction = calculateDirection(currentFinger.start, currentFinger.end);

                //Check if we need to prevent default event (page scroll / pinch zoom) or not
                validateDefaultEvent(jqEvent, direction);

                //Distance and duration are all off the main finger
                distance = calculateDistance(currentFinger.start, currentFinger.end);
                duration = calculateDuration();

                //Cache the maximum distance we made in this direction
                setMaxDistance(direction, distance);


                if (options.swipeStatus || options.pinchStatus) {
                    ret = triggerHandler(event, phase);
                }


                //If we trigger end events when threshold are met, or trigger events when touch leaves element
                if(!options.triggerOnTouchEnd || options.triggerOnTouchLeave) {

                    var inBounds = true;

                    //If checking if we leave the element, run the bounds check (we can use touchleave as its not supported on webkit)
                    if(options.triggerOnTouchLeave) {
                        var bounds = getbounds( this );
                        inBounds = isInBounds( currentFinger.end, bounds );
                    }

                    //Trigger end handles as we swipe if thresholds met or if we have left the element if the user has asked to check these..
                    if(!options.triggerOnTouchEnd && inBounds) {
                        phase = getNextPhase( PHASE_MOVE );
                    }
                    //We end if out of bounds here, so set current phase to END, and check if its modified
                    else if(options.triggerOnTouchLeave && !inBounds ) {
                        phase = getNextPhase( PHASE_END );
                    }

                    if(phase==PHASE_CANCEL || phase==PHASE_END)	{
                        triggerHandler(event, phase);
                    }
                }
            }
            else {
                phase = PHASE_CANCEL;
                triggerHandler(event, phase);
            }

            if (ret === false) {
                phase = PHASE_CANCEL;
                triggerHandler(event, phase);
            }
        }



        /**
         * Event handler for a touch end event.
         * Calculate the direction and trigger events
         * @inner
         * @param {object} jqEvent The normalised jQuery event object.
         */
        function touchEnd(jqEvent) {
            //As we use Jquery bind for events, we need to target the original event object
            var event = jqEvent.originalEvent;


            //If we are still in a touch with another finger return
            //This allows us to wait a fraction and see if the other finger comes up, if it does within the threshold, then we treat it as a multi release, not a single release.
            if (SUPPORTS_TOUCH) {
                if(event.touches.length>0) {
                    startMultiFingerRelease();
                    return true;
                }
            }

            //If a previous finger has been released, check how long ago, if within the threshold, then assume it was a multifinger release.
            //This is used to allow 2 fingers to release fractionally after each other, whilst maintainig the event as containg 2 fingers, not 1
            if(inMultiFingerRelease()) {
                fingerCount=previousTouchFingerCount;
            }

            //Set end of swipe
            endTime = getTimeStamp();

            //Get duration incase move was never fired
            duration = calculateDuration();

            //If we trigger handlers at end of swipe OR, we trigger during, but they didnt trigger and we are still in the move phase
            if(didSwipeBackToCancel() || !validateSwipeDistance()) {
                phase = PHASE_CANCEL;
                triggerHandler(event, phase);
            } else if (options.triggerOnTouchEnd || (options.triggerOnTouchEnd == false && phase === PHASE_MOVE)) {
                //call this on jq event so we are cross browser
                jqEvent.preventDefault();
                phase = PHASE_END;
                triggerHandler(event, phase);
            }
            //Special cases - A tap should always fire on touch end regardless,
            //So here we manually trigger the tap end handler by itself
            //We dont run trigger handler as it will re-trigger events that may have fired already
            else if (!options.triggerOnTouchEnd && hasTap()) {
                //Trigger the pinch events...
                phase = PHASE_END;
                triggerHandlerForGesture(event, phase, TAP);
            }
            else if (phase === PHASE_MOVE) {
                phase = PHASE_CANCEL;
                triggerHandler(event, phase);
            }

            setTouchInProgress(false);

            return null;
        }



        /**
         * Event handler for a touch cancel event.
         * Clears current vars
         * @inner
         */
        function touchCancel() {
            // reset the variables back to default values
            fingerCount = 0;
            endTime = 0;
            startTime = 0;
            startTouchesDistance=0;
            endTouchesDistance=0;
            pinchZoom=1;

            //If we were in progress of tracking a possible multi touch end, then re set it.
            cancelMultiFingerRelease();

            setTouchInProgress(false);
        }


        /**
         * Event handler for a touch leave event.
         * This is only triggered on desktops, in touch we work this out manually
         * as the touchleave event is not supported in webkit
         * @inner
         */
        function touchLeave(jqEvent) {
            var event = jqEvent.originalEvent;

            //If we have the trigger on leave property set....
            if(options.triggerOnTouchLeave) {
                phase = getNextPhase( PHASE_END );
                triggerHandler(event, phase);
            }
        }

        /**
         * Removes all listeners that were associated with the plugin
         * @inner
         */
        function removeListeners() {
            $element.unbind(START_EV, touchStart);
            $element.unbind(CANCEL_EV, touchCancel);
            $element.unbind(MOVE_EV, touchMove);
            $element.unbind(END_EV, touchEnd);

            //we only have leave events on desktop, we manually calculate leave on touch as its not supported in webkit
            if(LEAVE_EV) {
                $element.unbind(LEAVE_EV, touchLeave);
            }

            setTouchInProgress(false);
        }


        /**
         * Checks if the time and distance thresholds have been met, and if so then the appropriate handlers are fired.
         */
        function getNextPhase(currentPhase) {

            var nextPhase = currentPhase;

            // Ensure we have valid swipe (under time and over distance  and check if we are out of bound...)
            var validTime = validateSwipeTime();
            var validDistance = validateSwipeDistance();
            var didCancel = didSwipeBackToCancel();

            //If we have exceeded our time, then cancel
            if(!validTime || didCancel) {
                nextPhase = PHASE_CANCEL;
            }
            //Else if we are moving, and have reached distance then end
            else if (validDistance && currentPhase == PHASE_MOVE && (!options.triggerOnTouchEnd || options.triggerOnTouchLeave) ) {
                nextPhase = PHASE_END;
            }
            //Else if we have ended by leaving and didn't reach distance, then cancel
            else if (!validDistance && currentPhase==PHASE_END && options.triggerOnTouchLeave) {
                nextPhase = PHASE_CANCEL;
            }

            return nextPhase;
        }


        /**
         * Trigger the relevant event handler
         * The handlers are passed the original event, the element that was swiped, and in the case of the catch all handler, the direction that was swiped, "left", "right", "up", or "down"
         * @param {object} event the original event object
         * @param {string} phase the phase of the swipe (start, end cancel etc) {@link $.fn.swipe.phases}
         * @inner
         */
        function triggerHandler(event, phase) {

            var ret = undefined;

            // SWIPE GESTURES
            if(didSwipe() || hasSwipes()) { //hasSwipes as status needs to fire even if swipe is invalid
                //Trigger the swipe events...
                ret = triggerHandlerForGesture(event, phase, SWIPE);
            }

            // PINCH GESTURES (if the above didn't cancel)
            else if((didPinch() || hasPinches()) && ret!==false) {
                //Trigger the pinch events...
                ret = triggerHandlerForGesture(event, phase, PINCH);
            }

            // CLICK / TAP (if the above didn't cancel)
            if(didDoubleTap() && ret!==false) {
                //Trigger the tap events...
                ret = triggerHandlerForGesture(event, phase, DOUBLE_TAP);
            }

            // CLICK / TAP (if the above didn't cancel)
            else if(didLongTap() && ret!==false) {
                //Trigger the tap events...
                ret = triggerHandlerForGesture(event, phase, LONG_TAP);
            }

            // CLICK / TAP (if the above didn't cancel)
            else if(didTap() && ret!==false) {
                //Trigger the tap event..
                ret = triggerHandlerForGesture(event, phase, TAP);
            }



            // If we are cancelling the gesture, then manually trigger the reset handler
            if (phase === PHASE_CANCEL) {
                touchCancel(event);
            }

            // If we are ending the gesture, then manually trigger the reset handler IF all fingers are off
            if(phase === PHASE_END) {
                //If we support touch, then check that all fingers are off before we cancel
                if (SUPPORTS_TOUCH) {
                    if(event.touches.length==0) {
                        touchCancel(event);
                    }
                }
                else {
                    touchCancel(event);
                }
            }

            return ret;
        }



        /**
         * Trigger the relevant event handler
         * The handlers are passed the original event, the element that was swiped, and in the case of the catch all handler, the direction that was swiped, "left", "right", "up", or "down"
         * @param {object} event the original event object
         * @param {string} phase the phase of the swipe (start, end cancel etc) {@link $.fn.swipe.phases}
         * @param {string} gesture the gesture to trigger a handler for : PINCH or SWIPE {@link $.fn.swipe.gestures}
         * @return Boolean False, to indicate that the event should stop propagation, or void.
         * @inner
         */
        function triggerHandlerForGesture(event, phase, gesture) {

            var ret=undefined;

            //SWIPES....
            if(gesture==SWIPE) {
                //Trigger status every time..

                //Trigger the event...
                $element.trigger('swipeStatus', [phase, direction || null, distance || 0, duration || 0, fingerCount, fingerData]);

                //Fire the callback
                if (options.swipeStatus) {
                    ret = options.swipeStatus.call($element, event, phase, direction || null, distance || 0, duration || 0, fingerCount, fingerData);
                    //If the status cancels, then dont run the subsequent event handlers..
                    if(ret===false) return false;
                }




                if (phase == PHASE_END && validateSwipe()) {
                    //Fire the catch all event
                    $element.trigger('swipe', [direction, distance, duration, fingerCount, fingerData]);

                    //Fire catch all callback
                    if (options.swipe) {
                        ret = options.swipe.call($element, event, direction, distance, duration, fingerCount, fingerData);
                        //If the status cancels, then dont run the subsequent event handlers..
                        if(ret===false) return false;
                    }

                    //trigger direction specific event handlers
                    switch (direction) {
                        case LEFT:
                            //Trigger the event
                            $element.trigger('swipeLeft', [direction, distance, duration, fingerCount, fingerData]);

                            //Fire the callback
                            if (options.swipeLeft) {
                                ret = options.swipeLeft.call($element, event, direction, distance, duration, fingerCount, fingerData);
                            }
                            break;

                        case RIGHT:
                            //Trigger the event
                            $element.trigger('swipeRight', [direction, distance, duration, fingerCount, fingerData]);

                            //Fire the callback
                            if (options.swipeRight) {
                                ret = options.swipeRight.call($element, event, direction, distance, duration, fingerCount, fingerData);
                            }
                            break;

                        case UP:
                            //Trigger the event
                            $element.trigger('swipeUp', [direction, distance, duration, fingerCount, fingerData]);

                            //Fire the callback
                            if (options.swipeUp) {
                                ret = options.swipeUp.call($element, event, direction, distance, duration, fingerCount, fingerData);
                            }
                            break;

                        case DOWN:
                            //Trigger the event
                            $element.trigger('swipeDown', [direction, distance, duration, fingerCount, fingerData]);

                            //Fire the callback
                            if (options.swipeDown) {
                                ret = options.swipeDown.call($element, event, direction, distance, duration, fingerCount, fingerData);
                            }
                            break;
                    }
                }
            }


            //PINCHES....
            if(gesture==PINCH) {
                //Trigger the event
                $element.trigger('pinchStatus', [phase, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData]);

                //Fire the callback
                if (options.pinchStatus) {
                    ret = options.pinchStatus.call($element, event, phase, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData);
                    //If the status cancels, then dont run the subsequent event handlers..
                    if(ret===false) return false;
                }

                if(phase==PHASE_END && validatePinch()) {

                    switch (pinchDirection) {
                        case IN:
                            //Trigger the event
                            $element.trigger('pinchIn', [pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData]);

                            //Fire the callback
                            if (options.pinchIn) {
                                ret = options.pinchIn.call($element, event, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData);
                            }
                            break;

                        case OUT:
                            //Trigger the event
                            $element.trigger('pinchOut', [pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData]);

                            //Fire the callback
                            if (options.pinchOut) {
                                ret = options.pinchOut.call($element, event, pinchDirection || null, pinchDistance || 0, duration || 0, fingerCount, pinchZoom, fingerData);
                            }
                            break;
                    }
                }
            }





            if(gesture==TAP) {
                if(phase === PHASE_CANCEL || phase === PHASE_END) {


                    //Cancel any existing double tap
                    clearTimeout(singleTapTimeout);
                    //Cancel hold timeout
                    clearTimeout(holdTimeout);

                    //If we are also looking for doubelTaps, wait incase this is one...
                    if(hasDoubleTap() && !inDoubleTap()) {
                        //Cache the time of this tap
                        doubleTapStartTime = getTimeStamp();

                        //Now wait for the double tap timeout, and trigger this single tap
                        //if its not cancelled by a double tap
                        singleTapTimeout = setTimeout($.proxy(function() {
                            doubleTapStartTime=null;
                            //Trigger the event
                            $element.trigger('tap', [event.target]);


                            //Fire the callback
                            if(options.tap) {
                                ret = options.tap.call($element, event, event.target);
                            }
                        }, this), options.doubleTapThreshold );

                    } else {
                        doubleTapStartTime=null;

                        //Trigger the event
                        $element.trigger('tap', [event.target]);


                        //Fire the callback
                        if(options.tap) {
                            ret = options.tap.call($element, event, event.target);
                        }
                    }
                }
            }

            else if (gesture==DOUBLE_TAP) {
                if(phase === PHASE_CANCEL || phase === PHASE_END) {
                    //Cancel any pending singletap
                    clearTimeout(singleTapTimeout);
                    doubleTapStartTime=null;

                    //Trigger the event
                    $element.trigger('doubletap', [event.target]);

                    //Fire the callback
                    if(options.doubleTap) {
                        ret = options.doubleTap.call($element, event, event.target);
                    }
                }
            }

            else if (gesture==LONG_TAP) {
                if(phase === PHASE_CANCEL || phase === PHASE_END) {
                    //Cancel any pending singletap (shouldnt be one)
                    clearTimeout(singleTapTimeout);
                    doubleTapStartTime=null;

                    //Trigger the event
                    $element.trigger('longtap', [event.target]);

                    //Fire the callback
                    if(options.longTap) {
                        ret = options.longTap.call($element, event, event.target);
                    }
                }
            }

            return ret;
        }




        //
        // GESTURE VALIDATION
        //

        /**
         * Checks the user has swipe far enough
         * @return Boolean if <code>threshold</code> has been set, return true if the threshold was met, else false.
         * If no threshold was set, then we return true.
         * @inner
         */
        function validateSwipeDistance() {
            var valid = true;
            //If we made it past the min swipe distance..
            if (options.threshold !== null) {
                valid = distance >= options.threshold;
            }

            return valid;
        }

        /**
         * Checks the user has swiped back to cancel.
         * @return Boolean if <code>cancelThreshold</code> has been set, return true if the cancelThreshold was met, else false.
         * If no cancelThreshold was set, then we return true.
         * @inner
         */
        function didSwipeBackToCancel() {
            var cancelled = false;
            if(options.cancelThreshold !== null && direction !==null)  {
                cancelled =  (getMaxDistance( direction ) - distance) >= options.cancelThreshold;
            }

            return cancelled;
        }

        /**
         * Checks the user has pinched far enough
         * @return Boolean if <code>pinchThreshold</code> has been set, return true if the threshold was met, else false.
         * If no threshold was set, then we return true.
         * @inner
         */
        function validatePinchDistance() {
            if (options.pinchThreshold !== null) {
                return pinchDistance >= options.pinchThreshold;
            }
            return true;
        }

        /**
         * Checks that the time taken to swipe meets the minimum / maximum requirements
         * @return Boolean
         * @inner
         */
        function validateSwipeTime() {
            var result;
            //If no time set, then return true

            if (options.maxTimeThreshold) {
                if (duration >= options.maxTimeThreshold) {
                    result = false;
                } else {
                    result = true;
                }
            }
            else {
                result = true;
            }

            return result;
        }


        /**
         * Checks direction of the swipe and the value allowPageScroll to see if we should allow or prevent the default behaviour from occurring.
         * This will essentially allow page scrolling or not when the user is swiping on a touchSwipe object.
         * @param {object} jqEvent The normalised jQuery representation of the event object.
         * @param {string} direction The direction of the event. See {@link $.fn.swipe.directions}
         * @see $.fn.swipe.directions
         * @inner
         */
        function validateDefaultEvent(jqEvent, direction) {
            if (options.allowPageScroll === NONE || hasPinches()) {
                jqEvent.preventDefault();
            } else {
                var auto = options.allowPageScroll === AUTO;

                switch (direction) {
                    case LEFT:
                        if ((options.swipeLeft && auto) || (!auto && options.allowPageScroll != HORIZONTAL)) {
                            jqEvent.preventDefault();
                        }
                        break;

                    case RIGHT:
                        if ((options.swipeRight && auto) || (!auto && options.allowPageScroll != HORIZONTAL)) {
                            jqEvent.preventDefault();
                        }
                        break;

                    case UP:
                        if ((options.swipeUp && auto) || (!auto && options.allowPageScroll != VERTICAL)) {
                            jqEvent.preventDefault();
                        }
                        break;

                    case DOWN:
                        if ((options.swipeDown && auto) || (!auto && options.allowPageScroll != VERTICAL)) {
                            jqEvent.preventDefault();
                        }
                        break;
                }
            }

        }


        // PINCHES
        /**
         * Returns true of the current pinch meets the thresholds
         * @return Boolean
         * @inner
         */
        function validatePinch() {
            var hasCorrectFingerCount = validateFingers();
            var hasEndPoint = validateEndPoint();
            var hasCorrectDistance = validatePinchDistance();
            return hasCorrectFingerCount && hasEndPoint && hasCorrectDistance;

        }

        /**
         * Returns true if any Pinch events have been registered
         * @return Boolean
         * @inner
         */
        function hasPinches() {
            //Enure we dont return 0 or null for false values
            return !!(options.pinchStatus || options.pinchIn || options.pinchOut);
        }

        /**
         * Returns true if we are detecting pinches, and have one
         * @return Boolean
         * @inner
         */
        function didPinch() {
            //Enure we dont return 0 or null for false values
            return !!(validatePinch() && hasPinches());
        }




        // SWIPES
        /**
         * Returns true if the current swipe meets the thresholds
         * @return Boolean
         * @inner
         */
        function validateSwipe() {
            //Check validity of swipe
            var hasValidTime = validateSwipeTime();
            var hasValidDistance = validateSwipeDistance();
            var hasCorrectFingerCount = validateFingers();
            var hasEndPoint = validateEndPoint();
            var didCancel = didSwipeBackToCancel();

            // if the user swiped more than the minimum length, perform the appropriate action
            // hasValidDistance is null when no distance is set
            var valid =  !didCancel && hasEndPoint && hasCorrectFingerCount && hasValidDistance && hasValidTime;

            return valid;
        }

        /**
         * Returns true if any Swipe events have been registered
         * @return Boolean
         * @inner
         */
        function hasSwipes() {
            //Enure we dont return 0 or null for false values
            return !!(options.swipe || options.swipeStatus || options.swipeLeft || options.swipeRight || options.swipeUp || options.swipeDown);
        }


        /**
         * Returns true if we are detecting swipes and have one
         * @return Boolean
         * @inner
         */
        function didSwipe() {
            //Enure we dont return 0 or null for false values
            return !!(validateSwipe() && hasSwipes());
        }

        /**
         * Returns true if we have matched the number of fingers we are looking for
         * @return Boolean
         * @inner
         */
        function validateFingers() {
            //The number of fingers we want were matched, or on desktop we ignore
            return ((fingerCount === options.fingers || options.fingers === ALL_FINGERS) || !SUPPORTS_TOUCH);
        }

        /**
         * Returns true if we have an end point for the swipe
         * @return Boolean
         * @inner
         */
        function validateEndPoint() {
            //We have an end value for the finger
            return fingerData[0].end.x !== 0;
        }

        // TAP / CLICK
        /**
         * Returns true if a click / tap events have been registered
         * @return Boolean
         * @inner
         */
        function hasTap() {
            //Enure we dont return 0 or null for false values
            return !!(options.tap) ;
        }

        /**
         * Returns true if a double tap events have been registered
         * @return Boolean
         * @inner
         */
        function hasDoubleTap() {
            //Enure we dont return 0 or null for false values
            return !!(options.doubleTap) ;
        }

        /**
         * Returns true if any long tap events have been registered
         * @return Boolean
         * @inner
         */
        function hasLongTap() {
            //Enure we dont return 0 or null for false values
            return !!(options.longTap) ;
        }

        /**
         * Returns true if we could be in the process of a double tap (one tap has occurred, we are listening for double taps, and the threshold hasn't past.
         * @return Boolean
         * @inner
         */
        function validateDoubleTap() {
            if(doubleTapStartTime==null){
                return false;
            }
            var now = getTimeStamp();
            return (hasDoubleTap() && ((now-doubleTapStartTime) <= options.doubleTapThreshold));
        }

        /**
         * Returns true if we could be in the process of a double tap (one tap has occurred, we are listening for double taps, and the threshold hasn't past.
         * @return Boolean
         * @inner
         */
        function inDoubleTap() {
            return validateDoubleTap();
        }


        /**
         * Returns true if we have a valid tap
         * @return Boolean
         * @inner
         */
        function validateTap() {
            return ((fingerCount === 1 || !SUPPORTS_TOUCH) && (isNaN(distance) || distance < options.threshold));
        }

        /**
         * Returns true if we have a valid long tap
         * @return Boolean
         * @inner
         */
        function validateLongTap() {
            //slight threshold on moving finger
            return ((duration > options.longTapThreshold) && (distance < DOUBLE_TAP_THRESHOLD));
        }

        /**
         * Returns true if we are detecting taps and have one
         * @return Boolean
         * @inner
         */
        function didTap() {
            //Enure we dont return 0 or null for false values
            return !!(validateTap() && hasTap());
        }


        /**
         * Returns true if we are detecting double taps and have one
         * @return Boolean
         * @inner
         */
        function didDoubleTap() {
            //Enure we dont return 0 or null for false values
            return !!(validateDoubleTap() && hasDoubleTap());
        }

        /**
         * Returns true if we are detecting long taps and have one
         * @return Boolean
         * @inner
         */
        function didLongTap() {
            //Enure we dont return 0 or null for false values
            return !!(validateLongTap() && hasLongTap());
        }




        // MULTI FINGER TOUCH
        /**
         * Starts tracking the time between 2 finger releases, and keeps track of how many fingers we initially had up
         * @inner
         */
        function startMultiFingerRelease() {
            previousTouchEndTime = getTimeStamp();
            previousTouchFingerCount = event.touches.length+1;
        }

        /**
         * Cancels the tracking of time between 2 finger releases, and resets counters
         * @inner
         */
        function cancelMultiFingerRelease() {
            previousTouchEndTime = 0;
            previousTouchFingerCount = 0;
        }

        /**
         * Checks if we are in the threshold between 2 fingers being released
         * @return Boolean
         * @inner
         */
        function inMultiFingerRelease() {

            var withinThreshold = false;

            if(previousTouchEndTime) {
                var diff = getTimeStamp() - previousTouchEndTime
                if( diff<=options.fingerReleaseThreshold ) {
                    withinThreshold = true;
                }
            }

            return withinThreshold;
        }


        /**
         * gets a data flag to indicate that a touch is in progress
         * @return Boolean
         * @inner
         */
        function getTouchInProgress() {
            //strict equality to ensure only true and false are returned
            return !!($element.data(PLUGIN_NS+'_intouch') === true);
        }

        /**
         * Sets a data flag to indicate that a touch is in progress
         * @param {boolean} val The value to set the property to
         * @inner
         */
        function setTouchInProgress(val) {

            //Add or remove event listeners depending on touch status
            if(val===true) {
                $element.bind(MOVE_EV, touchMove);
                $element.bind(END_EV, touchEnd);

                //we only have leave events on desktop, we manually calcuate leave on touch as its not supported in webkit
                if(LEAVE_EV) {
                    $element.bind(LEAVE_EV, touchLeave);
                }
            } else {
                $element.unbind(MOVE_EV, touchMove, false);
                $element.unbind(END_EV, touchEnd, false);

                //we only have leave events on desktop, we manually calcuate leave on touch as its not supported in webkit
                if(LEAVE_EV) {
                    $element.unbind(LEAVE_EV, touchLeave, false);
                }
            }


            //strict equality to ensure only true and false can update the value
            $element.data(PLUGIN_NS+'_intouch', val === true);
        }


        /**
         * Creates the finger data for the touch/finger in the event object.
         * @param {int} index The index in the array to store the finger data (usually the order the fingers were pressed)
         * @param {object} evt The event object containing finger data
         * @return finger data object
         * @inner
         */
        function createFingerData( index, evt ) {
            var id = evt.identifier!==undefined ? evt.identifier : 0;

            fingerData[index].identifier = id;
            fingerData[index].start.x = fingerData[index].end.x = evt.pageX||evt.clientX;
            fingerData[index].start.y = fingerData[index].end.y = evt.pageY||evt.clientY;

            return fingerData[index];
        }

        /**
         * Updates the finger data for a particular event object
         * @param {object} evt The event object containing the touch/finger data to upadte
         * @return a finger data object.
         * @inner
         */
        function updateFingerData(evt) {

            var id = evt.identifier!==undefined ? evt.identifier : 0;
            var f = getFingerData( id );

            f.end.x = evt.pageX||evt.clientX;
            f.end.y = evt.pageY||evt.clientY;

            return f;
        }

        /**
         * Returns a finger data object by its event ID.
         * Each touch event has an identifier property, which is used
         * to track repeat touches
         * @param {int} id The unique id of the finger in the sequence of touch events.
         * @return a finger data object.
         * @inner
         */
        function getFingerData( id ) {
            for(var i=0; i<fingerData.length; i++) {
                if(fingerData[i].identifier == id) {
                    return fingerData[i];
                }
            }
        }

        /**
         * Creats all the finger onjects and returns an array of finger data
         * @return Array of finger objects
         * @inner
         */
        function createAllFingerData() {
            var fingerData=[];
            for (var i=0; i<=5; i++) {
                fingerData.push({
                    start:{ x: 0, y: 0 },
                    end:{ x: 0, y: 0 },
                    identifier:0
                });
            }

            return fingerData;
        }

        /**
         * Sets the maximum distance swiped in the given direction.
         * If the new value is lower than the current value, the max value is not changed.
         * @param {string}  direction The direction of the swipe
         * @param {int}  distance The distance of the swipe
         * @inner
         */
        function setMaxDistance(direction, distance) {
            distance = Math.max(distance, getMaxDistance(direction) );
            maximumsMap[direction].distance = distance;
        }

        /**
         * gets the maximum distance swiped in the given direction.
         * @param {string}  direction The direction of the swipe
         * @return int  The distance of the swipe
         * @inner
         */
        function getMaxDistance(direction) {
            if (maximumsMap[direction]) return maximumsMap[direction].distance;
            return undefined;
        }

        /**
         * Creats a map of directions to maximum swiped values.
         * @return Object A dictionary of maximum values, indexed by direction.
         * @inner
         */
        function createMaximumsData() {
            var maxData={};
            maxData[LEFT]=createMaximumVO(LEFT);
            maxData[RIGHT]=createMaximumVO(RIGHT);
            maxData[UP]=createMaximumVO(UP);
            maxData[DOWN]=createMaximumVO(DOWN);

            return maxData;
        }

        /**
         * Creates a map maximum swiped values for a given swipe direction
         * @param {string} The direction that these values will be associated with
         * @return Object Maximum values
         * @inner
         */
        function createMaximumVO(dir) {
            return {
                direction:dir,
                distance:0
            }
        }


        //
        // MATHS / UTILS
        //

        /**
         * Calculate the duration of the swipe
         * @return int
         * @inner
         */
        function calculateDuration() {
            return endTime - startTime;
        }

        /**
         * Calculate the distance between 2 touches (pinch)
         * @param {point} startPoint A point object containing x and y co-ordinates
         * @param {point} endPoint A point object containing x and y co-ordinates
         * @return int;
         * @inner
         */
        function calculateTouchesDistance(startPoint, endPoint) {
            var diffX = Math.abs(startPoint.x - endPoint.x);
            var diffY = Math.abs(startPoint.y - endPoint.y);

            return Math.round(Math.sqrt(diffX*diffX+diffY*diffY));
        }

        /**
         * Calculate the zoom factor between the start and end distances
         * @param {int} startDistance Distance (between 2 fingers) the user started pinching at
         * @param {int} endDistance Distance (between 2 fingers) the user ended pinching at
         * @return float The zoom value from 0 to 1.
         * @inner
         */
        function calculatePinchZoom(startDistance, endDistance) {
            var percent = (endDistance/startDistance) * 1;
            return percent.toFixed(2);
        }


        /**
         * Returns the pinch direction, either IN or OUT for the given points
         * @return string Either {@link $.fn.swipe.directions.IN} or {@link $.fn.swipe.directions.OUT}
         * @see $.fn.swipe.directions
         * @inner
         */
        function calculatePinchDirection() {
            if(pinchZoom<1) {
                return OUT;
            }
            else {
                return IN;
            }
        }


        /**
         * Calculate the length / distance of the swipe
         * @param {point} startPoint A point object containing x and y co-ordinates
         * @param {point} endPoint A point object containing x and y co-ordinates
         * @return int
         * @inner
         */
        function calculateDistance(startPoint, endPoint) {
            return Math.round(Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2)));
        }

        /**
         * Calculate the angle of the swipe
         * @param {point} startPoint A point object containing x and y co-ordinates
         * @param {point} endPoint A point object containing x and y co-ordinates
         * @return int
         * @inner
         */
        function calculateAngle(startPoint, endPoint) {
            var x = startPoint.x - endPoint.x;
            var y = endPoint.y - startPoint.y;
            var r = Math.atan2(y, x); //radians
            var angle = Math.round(r * 180 / Math.PI); //degrees

            //ensure value is positive
            if (angle < 0) {
                angle = 360 - Math.abs(angle);
            }

            return angle;
        }

        /**
         * Calculate the direction of the swipe
         * This will also call calculateAngle to get the latest angle of swipe
         * @param {point} startPoint A point object containing x and y co-ordinates
         * @param {point} endPoint A point object containing x and y co-ordinates
         * @return string Either {@link $.fn.swipe.directions.LEFT} / {@link $.fn.swipe.directions.RIGHT} / {@link $.fn.swipe.directions.DOWN} / {@link $.fn.swipe.directions.UP}
         * @see $.fn.swipe.directions
         * @inner
         */
        function calculateDirection(startPoint, endPoint ) {
            var angle = calculateAngle(startPoint, endPoint);

            if ((angle <= 45) && (angle >= 0)) {
                return LEFT;
            } else if ((angle <= 360) && (angle >= 315)) {
                return LEFT;
            } else if ((angle >= 135) && (angle <= 225)) {
                return RIGHT;
            } else if ((angle > 45) && (angle < 135)) {
                return DOWN;
            } else {
                return UP;
            }
        }


        /**
         * Returns a MS time stamp of the current time
         * @return int
         * @inner
         */
        function getTimeStamp() {
            var now = new Date();
            return now.getTime();
        }



        /**
         * Returns a bounds object with left, right, top and bottom properties for the element specified.
         * @param {DomNode} The DOM node to get the bounds for.
         */
        function getbounds( el ) {
            el = $(el);
            var offset = el.offset();

            var bounds = {
                left:offset.left,
                right:offset.left+el.outerWidth(),
                top:offset.top,
                bottom:offset.top+el.outerHeight()
            }

            return bounds;
        }


        /**
         * Checks if the point object is in the bounds object.
         * @param {object} point A point object.
         * @param {int} point.x The x value of the point.
         * @param {int} point.y The x value of the point.
         * @param {object} bounds The bounds object to test
         * @param {int} bounds.left The leftmost value
         * @param {int} bounds.right The righttmost value
         * @param {int} bounds.top The topmost value
         * @param {int} bounds.bottom The bottommost value
         */
        function isInBounds(point, bounds) {
            return (point.x > bounds.left && point.x < bounds.right && point.y > bounds.top && point.y < bounds.bottom);
        };


    }




    /**
     * A catch all handler that is triggered for all swipe directions.
     * @name $.fn.swipe#swipe
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {int} direction The direction the user swiped in. See {@link $.fn.swipe.directions}
     * @param {int} distance The distance the user swiped
     * @param {int} duration The duration of the swipe in milliseconds
     * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
     * @param {object} fingerData The coordinates of fingers in event
     */




    /**
     * A handler that is triggered for "left" swipes.
     * @name $.fn.swipe#swipeLeft
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {int} direction The direction the user swiped in. See {@link $.fn.swipe.directions}
     * @param {int} distance The distance the user swiped
     * @param {int} duration The duration of the swipe in milliseconds
     * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
     * @param {object} fingerData The coordinates of fingers in event
     */

    /**
     * A handler that is triggered for "right" swipes.
     * @name $.fn.swipe#swipeRight
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {int} direction The direction the user swiped in. See {@link $.fn.swipe.directions}
     * @param {int} distance The distance the user swiped
     * @param {int} duration The duration of the swipe in milliseconds
     * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
     * @param {object} fingerData The coordinates of fingers in event
     */

    /**
     * A handler that is triggered for "up" swipes.
     * @name $.fn.swipe#swipeUp
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {int} direction The direction the user swiped in. See {@link $.fn.swipe.directions}
     * @param {int} distance The distance the user swiped
     * @param {int} duration The duration of the swipe in milliseconds
     * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
     * @param {object} fingerData The coordinates of fingers in event
     */

    /**
     * A handler that is triggered for "down" swipes.
     * @name $.fn.swipe#swipeDown
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {int} direction The direction the user swiped in. See {@link $.fn.swipe.directions}
     * @param {int} distance The distance the user swiped
     * @param {int} duration The duration of the swipe in milliseconds
     * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
     * @param {object} fingerData The coordinates of fingers in event
     */

    /**
     * A handler triggered for every phase of the swipe. This handler is constantly fired for the duration of the pinch.
     * This is triggered regardless of swipe thresholds.
     * @name $.fn.swipe#swipeStatus
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {string} phase The phase of the swipe event. See {@link $.fn.swipe.phases}
     * @param {string} direction The direction the user swiped in. This is null if the user has yet to move. See {@link $.fn.swipe.directions}
     * @param {int} distance The distance the user swiped. This is 0 if the user has yet to move.
     * @param {int} duration The duration of the swipe in milliseconds
     * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
     * @param {object} fingerData The coordinates of fingers in event
     */

    /**
     * A handler triggered for pinch in events.
     * @name $.fn.swipe#pinchIn
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {int} direction The direction the user pinched in. See {@link $.fn.swipe.directions}
     * @param {int} distance The distance the user pinched
     * @param {int} duration The duration of the swipe in milliseconds
     * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
     * @param {int} zoom The zoom/scale level the user pinched too, 0-1.
     * @param {object} fingerData The coordinates of fingers in event
     */

    /**
     * A handler triggered for pinch out events.
     * @name $.fn.swipe#pinchOut
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {int} direction The direction the user pinched in. See {@link $.fn.swipe.directions}
     * @param {int} distance The distance the user pinched
     * @param {int} duration The duration of the swipe in milliseconds
     * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
     * @param {int} zoom The zoom/scale level the user pinched too, 0-1.
     * @param {object} fingerData The coordinates of fingers in event
     */

    /**
     * A handler triggered for all pinch events. This handler is constantly fired for the duration of the pinch. This is triggered regardless of thresholds.
     * @name $.fn.swipe#pinchStatus
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {int} direction The direction the user pinched in. See {@link $.fn.swipe.directions}
     * @param {int} distance The distance the user pinched
     * @param {int} duration The duration of the swipe in milliseconds
     * @param {int} fingerCount The number of fingers used. See {@link $.fn.swipe.fingers}
     * @param {int} zoom The zoom/scale level the user pinched too, 0-1.
     * @param {object} fingerData The coordinates of fingers in event
     */

    /**
     * A click handler triggered when a user simply clicks, rather than swipes on an element.
     * This is deprecated since version 1.6.2, any assignment to click will be assigned to the tap handler.
     * You cannot use <code>on</code> to bind to this event as the default jQ <code>click</code> event will be triggered.
     * Use the <code>tap</code> event instead.
     * @name $.fn.swipe#click
     * @event
     * @deprecated since version 1.6.2, please use {@link $.fn.swipe#tap} instead
     * @default null
     * @param {EventObject} event The original event object
     * @param {DomObject} target The element clicked on.
     */

    /**
     * A click / tap handler triggered when a user simply clicks or taps, rather than swipes on an element.
     * @name $.fn.swipe#tap
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {DomObject} target The element clicked on.
     */

    /**
     * A double tap handler triggered when a user double clicks or taps on an element.
     * You can set the time delay for a double tap with the {@link $.fn.swipe.defaults#doubleTapThreshold} property.
     * Note: If you set both <code>doubleTap</code> and <code>tap</code> handlers, the <code>tap</code> event will be delayed by the <code>doubleTapThreshold</code>
     * as the script needs to check if its a double tap.
     * @name $.fn.swipe#doubleTap
     * @see  $.fn.swipe.defaults#doubleTapThreshold
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {DomObject} target The element clicked on.
     */

    /**
     * A long tap handler triggered once a tap has been release if the tap was longer than the longTapThreshold.
     * You can set the time delay for a long tap with the {@link $.fn.swipe.defaults#longTapThreshold} property.
     * @name $.fn.swipe#longTap
     * @see  $.fn.swipe.defaults#longTapThreshold
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {DomObject} target The element clicked on.
     */

    /**
     * A hold tap handler triggered as soon as the longTapThreshold is reached
     * You can set the time delay for a long tap with the {@link $.fn.swipe.defaults#longTapThreshold} property.
     * @name $.fn.swipe#hold
     * @see  $.fn.swipe.defaults#longTapThreshold
     * @event
     * @default null
     * @param {EventObject} event The original event object
     * @param {DomObject} target The element clicked on.
     */

}));
/*
 * transform: A jQuery cssHooks adding cross-browser 2d transform capabilities to $.fn.css() and $.fn.animate()
 *
 * limitations:
 * - requires jQuery 1.4.3+
 * - Should you use the *translate* property, then your elements need to be absolutely positionned in a relatively positionned wrapper **or it will fail in IE678**.
 * - transformOrigin is not accessible
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery.transform.js
 *
 * Copyright 2011 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work?
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 *
 */
(function( $, window, document, Math, undefined ) {

    /*
     * Feature tests and global variables
     */
    var div = document.createElement("div"),
        divStyle = div.style,
        suffix = "Transform",
        testProperties = [
            "O" + suffix,
            "ms" + suffix,
            "Webkit" + suffix,
            "Moz" + suffix
        ],
        i = testProperties.length,
        supportProperty,
        supportMatrixFilter,
        supportFloat32Array = "Float32Array" in window,
        propertyHook,
        propertyGet,
        rMatrix = /Matrix([^)]*)/,
        rAffine = /^\s*matrix\(\s*1\s*,\s*0\s*,\s*0\s*,\s*1\s*(?:,\s*0(?:px)?\s*){2}\)\s*$/,
        _transform = "transform",
        _transformOrigin = "transformOrigin",
        _translate = "translate",
        _rotate = "rotate",
        _scale = "scale",
        _skew = "skew",
        _matrix = "matrix";

// test different vendor prefixes of these properties
    while ( i-- ) {
        if ( testProperties[i] in divStyle ) {
            $.support[_transform] = supportProperty = testProperties[i];
            $.support[_transformOrigin] = supportProperty + "Origin";
            continue;
        }
    }
// IE678 alternative
    if ( !supportProperty ) {
        $.support.matrixFilter = supportMatrixFilter = divStyle.filter === "";
    }

// px isn't the default unit of these properties
    $.cssNumber[_transform] = $.cssNumber[_transformOrigin] = true;

    /*
     * fn.css() hooks
     */
    if ( supportProperty && supportProperty != _transform ) {
        // Modern browsers can use jQuery.cssProps as a basic hook
        $.cssProps[_transform] = supportProperty;
        $.cssProps[_transformOrigin] = supportProperty + "Origin";

        // Firefox needs a complete hook because it stuffs matrix with "px"
        if ( supportProperty == "Moz" + suffix ) {
            propertyHook = {
                get: function( elem, computed ) {
                    return (computed ?
                        // remove "px" from the computed matrix
                        $.css( elem, supportProperty ).split("px").join(""):
                        elem.style[supportProperty]
                    );
                },
                set: function( elem, value ) {
                    // add "px" to matrices
                    elem.style[supportProperty] = /matrix\([^)p]*\)/.test(value) ?
                        value.replace(/matrix((?:[^,]*,){4})([^,]*),([^)]*)/, _matrix+"$1$2px,$3px"):
                        value;
                }
            };
            /* Fix two jQuery bugs still present in 1.5.1
             * - rupper is incompatible with IE9, see http://jqbug.com/8346
             * - jQuery.css is not really jQuery.cssProps aware, see http://jqbug.com/8402
             */
        } else if ( /^1\.[0-5](?:\.|$)/.test($.fn.jquery) ) {
            propertyHook = {
                get: function( elem, computed ) {
                    return (computed ?
                        $.css( elem, supportProperty.replace(/^ms/, "Ms") ):
                        elem.style[supportProperty]
                    );
                }
            };
        }
        /* TODO: leverage hardware acceleration of 3d transform in Webkit only
         else if ( supportProperty == "Webkit" + suffix && support3dTransform ) {
         propertyHook = {
         set: function( elem, value ) {
         elem.style[supportProperty] =
         value.replace();
         }
         }
         }*/

    } else if ( supportMatrixFilter ) {
        propertyHook = {
            get: function( elem, computed, asArray ) {
                var elemStyle = ( computed && elem.currentStyle ? elem.currentStyle : elem.style ),
                    matrix, data;

                if ( elemStyle && rMatrix.test( elemStyle.filter ) ) {
                    matrix = RegExp.$1.split(",");
                    matrix = [
                        matrix[0].split("=")[1],
                        matrix[2].split("=")[1],
                        matrix[1].split("=")[1],
                        matrix[3].split("=")[1]
                    ];
                } else {
                    matrix = [1,0,0,1];
                }

                if ( ! $.cssHooks[_transformOrigin] ) {
                    matrix[4] = elemStyle ? parseInt(elemStyle.left, 10) || 0 : 0;
                    matrix[5] = elemStyle ? parseInt(elemStyle.top, 10) || 0 : 0;

                } else {
                    data = $._data( elem, "transformTranslate", undefined );
                    matrix[4] = data ? data[0] : 0;
                    matrix[5] = data ? data[1] : 0;
                }

                return asArray ? matrix : _matrix+"(" + matrix + ")";
            },
            set: function( elem, value, animate ) {
                var elemStyle = elem.style,
                    currentStyle,
                    Matrix,
                    filter,
                    centerOrigin;

                if ( !animate ) {
                    elemStyle.zoom = 1;
                }

                value = matrix(value);

                // rotate, scale and skew
                Matrix = [
                    "Matrix("+
                    "M11="+value[0],
                    "M12="+value[2],
                    "M21="+value[1],
                    "M22="+value[3],
                    "SizingMethod='auto expand'"
                ].join();
                filter = ( currentStyle = elem.currentStyle ) && currentStyle.filter || elemStyle.filter || "";

                elemStyle.filter = rMatrix.test(filter) ?
                    filter.replace(rMatrix, Matrix) :
                filter + " progid:DXImageTransform.Microsoft." + Matrix + ")";

                if ( ! $.cssHooks[_transformOrigin] ) {

                    // center the transform origin, from pbakaus's Transformie http://github.com/pbakaus/transformie
                    if ( (centerOrigin = $.transform.centerOrigin) ) {
                        elemStyle[centerOrigin == "margin" ? "marginLeft" : "left"] = -(elem.offsetWidth/2) + (elem.clientWidth/2) + "px";
                        elemStyle[centerOrigin == "margin" ? "marginTop" : "top"] = -(elem.offsetHeight/2) + (elem.clientHeight/2) + "px";
                    }

                    // translate
                    // We assume that the elements are absolute positionned inside a relative positionned wrapper
                    elemStyle.left = value[4] + "px";
                    elemStyle.top = value[5] + "px";

                } else {
                    $.cssHooks[_transformOrigin].set( elem, value );
                }
            }
        };
    }
// populate jQuery.cssHooks with the appropriate hook if necessary
    if ( propertyHook ) {
        $.cssHooks[_transform] = propertyHook;
    }
// we need a unique setter for the animation logic
    propertyGet = propertyHook && propertyHook.get || $.css;

    /*
     * fn.animate() hooks
     */
    $.fx.step.transform = function( fx ) {
        var elem = fx.elem,
            start = fx.start,
            end = fx.end,
            pos = fx.pos,
            transform = "",
            precision = 1E5,
            i, startVal, endVal, unit;

        // fx.end and fx.start need to be converted to interpolation lists
        if ( !start || typeof start === "string" ) {

            // the following block can be commented out with jQuery 1.5.1+, see #7912
            if ( !start ) {
                start = propertyGet( elem, supportProperty );
            }

            // force layout only once per animation
            if ( supportMatrixFilter ) {
                elem.style.zoom = 1;
            }

            // replace "+=" in relative animations (-= is meaningless with transforms)
            end = end.split("+=").join(start);

            // parse both transform to generate interpolation list of same length
            return $.extend( fx, interpolationList( start, end ) );
        }

        i = start.length;

        // interpolate functions of the list one by one
        while ( i-- ) {
            startVal = start[i];
            endVal = end[i];
            unit = +false;

            switch ( startVal[0] ) {

                case _translate:
                    unit = "px";
                case _scale:
                    unit || ( unit = " ");

                    transform = startVal[0] + "(" +
                    Math.round( (startVal[1][0] + (endVal[1][0] - startVal[1][0]) * pos) * precision ) / precision + unit +","+
                    Math.round( (startVal[1][1] + (endVal[1][1] - startVal[1][1]) * pos) * precision ) / precision + unit + ")"+
                    transform;
                    break;

                case _skew + "X":
                case _skew + "Y":
                case _rotate:
                    transform = startVal[0] + "(" +
                    Math.round( (startVal[1] + (endVal[1] - startVal[1]) * pos) * precision ) / precision +"rad)"+
                    transform;
                    break;
            }
        }

        fx.origin && ( transform = fx.origin + transform );

        propertyHook && propertyHook.set ?
            propertyHook.set( elem, transform, +true ):
            elem.style[supportProperty] = transform;
    };

    /*
     * Utility functions
     */

// turns a transform string into its "matrix(A,B,C,D,X,Y)" form (as an array, though)
    function matrix( transform ) {
        transform = transform.split(")");
        var
            trim = $.trim
            , i = -1
        // last element of the array is an empty string, get rid of it
            , l = transform.length -1
            , split, prop, val
            , prev = supportFloat32Array ? new Float32Array(6) : []
            , curr = supportFloat32Array ? new Float32Array(6) : []
            , rslt = supportFloat32Array ? new Float32Array(6) : [1,0,0,1,0,0]
            ;

        prev[0] = prev[3] = rslt[0] = rslt[3] = 1;
        prev[1] = prev[2] = prev[4] = prev[5] = 0;

        // Loop through the transform properties, parse and multiply them
        while ( ++i < l ) {
            split = transform[i].split("(");
            prop = trim(split[0]);
            val = split[1];
            curr[0] = curr[3] = 1;
            curr[1] = curr[2] = curr[4] = curr[5] = 0;

            switch (prop) {
                case _translate+"X":
                    curr[4] = parseInt(val, 10);
                    break;

                case _translate+"Y":
                    curr[5] = parseInt(val, 10);
                    break;

                case _translate:
                    val = val.split(",");
                    curr[4] = parseInt(val[0], 10);
                    curr[5] = parseInt(val[1] || 0, 10);
                    break;

                case _rotate:
                    val = toRadian(val);
                    curr[0] = Math.cos(val);
                    curr[1] = Math.sin(val);
                    curr[2] = -Math.sin(val);
                    curr[3] = Math.cos(val);
                    break;

                case _scale+"X":
                    curr[0] = +val;
                    break;

                case _scale+"Y":
                    curr[3] = val;
                    break;

                case _scale:
                    val = val.split(",");
                    curr[0] = val[0];
                    curr[3] = val.length>1 ? val[1] : val[0];
                    break;

                case _skew+"X":
                    curr[2] = Math.tan(toRadian(val));
                    break;

                case _skew+"Y":
                    curr[1] = Math.tan(toRadian(val));
                    break;

                case _matrix:
                    val = val.split(",");
                    curr[0] = val[0];
                    curr[1] = val[1];
                    curr[2] = val[2];
                    curr[3] = val[3];
                    curr[4] = parseInt(val[4], 10);
                    curr[5] = parseInt(val[5], 10);
                    break;
            }

            // Matrix product (array in column-major order)
            rslt[0] = prev[0] * curr[0] + prev[2] * curr[1];
            rslt[1] = prev[1] * curr[0] + prev[3] * curr[1];
            rslt[2] = prev[0] * curr[2] + prev[2] * curr[3];
            rslt[3] = prev[1] * curr[2] + prev[3] * curr[3];
            rslt[4] = prev[0] * curr[4] + prev[2] * curr[5] + prev[4];
            rslt[5] = prev[1] * curr[4] + prev[3] * curr[5] + prev[5];

            prev = [rslt[0],rslt[1],rslt[2],rslt[3],rslt[4],rslt[5]];
        }
        return rslt;
    }

// turns a matrix into its rotate, scale and skew components
// algorithm from http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp
    function unmatrix(matrix) {
        var
            scaleX
            , scaleY
            , skew
            , A = matrix[0]
            , B = matrix[1]
            , C = matrix[2]
            , D = matrix[3]
            ;

        // Make sure matrix is not singular
        if ( A * D - B * C ) {
            // step (3)
            scaleX = Math.sqrt( A * A + B * B );
            A /= scaleX;
            B /= scaleX;
            // step (4)
            skew = A * C + B * D;
            C -= A * skew;
            D -= B * skew;
            // step (5)
            scaleY = Math.sqrt( C * C + D * D );
            C /= scaleY;
            D /= scaleY;
            skew /= scaleY;
            // step (6)
            if ( A * D < B * C ) {
                A = -A;
                B = -B;
                skew = -skew;
                scaleX = -scaleX;
            }

            // matrix is singular and cannot be interpolated
        } else {
            // In this case the elem shouldn't be rendered, hence scale == 0
            scaleX = scaleY = skew = 0;
        }

        // The recomposition order is very important
        // see http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp#l971
        return [
            [_translate, [+matrix[4], +matrix[5]]],
            [_rotate, Math.atan2(B, A)],
            [_skew + "X", Math.atan(skew)],
            [_scale, [scaleX, scaleY]]
        ];
    }

// build the list of transform functions to interpolate
// use the algorithm described at http://dev.w3.org/csswg/css3-2d-transforms/#animation
    function interpolationList( start, end ) {
        var list = {
                start: [],
                end: []
            },
            i = -1, l,
            currStart, currEnd, currType;

        // get rid of affine transform matrix
        ( start == "none" || isAffine( start ) ) && ( start = "" );
        ( end == "none" || isAffine( end ) ) && ( end = "" );

        // if end starts with the current computed style, this is a relative animation
        // store computed style as the origin, remove it from start and end
        if ( start && end && !end.indexOf("matrix") && toArray( start ).join() == toArray( end.split(")")[0] ).join() ) {
            list.origin = start;
            start = "";
            end = end.slice( end.indexOf(")") +1 );
        }

        if ( !start && !end ) { return; }

        // start or end are affine, or list of transform functions are identical
        // => functions will be interpolated individually
        if ( !start || !end || functionList(start) == functionList(end) ) {

            start && ( start = start.split(")") ) && ( l = start.length );
            end && ( end = end.split(")") ) && ( l = end.length );

            while ( ++i < l-1 ) {
                start[i] && ( currStart = start[i].split("(") );
                end[i] && ( currEnd = end[i].split("(") );
                currType = $.trim( ( currStart || currEnd )[0] );

                append( list.start, parseFunction( currType, currStart ? currStart[1] : 0 ) );
                append( list.end, parseFunction( currType, currEnd ? currEnd[1] : 0 ) );
            }

            // otherwise, functions will be composed to a single matrix
        } else {
            list.start = unmatrix(matrix(start));
            list.end = unmatrix(matrix(end))
        }

        return list;
    }

    function parseFunction( type, value ) {
        var
        // default value is 1 for scale, 0 otherwise
            defaultValue = +(!type.indexOf(_scale)),
            scaleX,
        // remove X/Y from scaleX/Y & translateX/Y, not from skew
            cat = type.replace( /e[XY]/, "e" );

        switch ( type ) {
            case _translate+"Y":
            case _scale+"Y":

                value = [
                    defaultValue,
                    value ?
                        parseFloat( value ):
                        defaultValue
                ];
                break;

            case _translate+"X":
            case _translate:
            case _scale+"X":
                scaleX = 1;
            case _scale:

                value = value ?
                ( value = value.split(",") ) &&	[
                    parseFloat( value[0] ),
                    parseFloat( value.length>1 ? value[1] : type == _scale ? scaleX || value[0] : defaultValue+"" )
                ]:
                    [defaultValue, defaultValue];
                break;

            case _skew+"X":
            case _skew+"Y":
            case _rotate:
                value = value ? toRadian( value ) : 0;
                break;

            case _matrix:
                return unmatrix( value ? toArray(value) : [1,0,0,1,0,0] );
                break;
        }

        return [[ cat, value ]];
    }

    function isAffine( matrix ) {
        return rAffine.test(matrix);
    }

    function functionList( transform ) {
        return transform.replace(/(?:\([^)]*\))|\s/g, "");
    }

    function append( arr1, arr2, value ) {
        while ( value = arr2.shift() ) {
            arr1.push( value );
        }
    }

// converts an angle string in any unit to a radian Float
    function toRadian(value) {
        return ~value.indexOf("deg") ?
        parseInt(value,10) * (Math.PI * 2 / 360):
            ~value.indexOf("grad") ?
            parseInt(value,10) * (Math.PI/200):
                parseFloat(value);
    }

// Converts "matrix(A,B,C,D,X,Y)" to [A,B,C,D,X,Y]
    function toArray(matrix) {
        // remove the unit of X and Y for Firefox
        matrix = /([^,]*),([^,]*),([^,]*),([^,]*),([^,p]*)(?:px)?,([^)p]*)(?:px)?/.exec(matrix);
        return [matrix[1], matrix[2], matrix[3], matrix[4], matrix[5], matrix[6]];
    }

    $.transform = {
        centerOrigin: "margin"
    };

})( jQuery, window, document, Math );
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

        $('.b-spoiler__link').on('touchstart click', function(event) {
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

        $('.b-post__gif').on('touchend click', function(){
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

        $('.js-show-share').on('touchstart click', function(){
            var $el = $(this).siblings('.b-post__m-share');
            $el.css('display', 'block').animate({
                opacity: 1
            }, 200);
            $('body').css('overflow', 'hidden');
            return false;
        });

        $('.b-post__m-share-cl').on('touchstart click', function(){
            $(this).parent().animate({
                opacity: 0
            }, 200, function(){
                $(this).css('display', 'none');
            });
            $('body').css('overflow', 'visible');
            return false;
        });

        $('.anim-scroll').on('touchstart click', function(){
            $('.anim-scroll').removeClass('current');
            $(this).addClass('current');
            scrollto_c($(this).prop("hash"));
            return false;
        });

        $('body').on('touchstart click', '.b-post__expand', function(){
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

        var replyTemplate = $('#template_reply');
        $('.js-reply').click(function(){
            $('.js-reply__block').remove();
            $('.b-comments__bottom').show('fast');
            var $parent = $(this).closest('.b-comments__content');
            $parent.append(replyTemplate.render());
            $parent.children('.b-comments__bottom').hide('fast');
            $('.js-file').styler({
                filePlaceholder: '',
                fileBrowse: 'Изображение'
            });
        });

        $('.b-footer__scrooltop').click(function(){
            $('html, body').animate({
                scrollTop: 0
            }, 500);
        });

        $('.b-comments__show-nrati').on('touchstart click', function(){
            var $parent = $(this).closest('.b-comments__item'),
                $content = $parent.find('.b-comments__text'),
                $item = $parent.find('.b-comments__nrati');
                $content.show('fast');
                $item.hide('fast').remove();
            return false;
        });

        var $wrap_content = $('.wrap__content');

        $('.js-sidebar-control').on('touchend click', function(){
            if($wrap_content.hasClass('animating')) return false;

            $wrap_content.addClass('animating');

            showSidebar();

            return false;
        });

        $('.js-search-control').on('touchend click', function(){
            if($wrap_content.hasClass('animating')) return false;

            $wrap_content.addClass('animating');

            showSearch();

            return false;
        });

        $("body").swipe({
            swipeLeft:function(event, direction, distance, duration, fingerCount) {
                if($wrap_content.hasClass('animating') || $wrap_content.hasClass('show-search')) return false;

                $wrap_content.addClass('animating');

                if($wrap_content.hasClass('show-sidebar')) {
                    showSidebar();

                    return false;
                }

                showSearch();


            },
            swipeRight:function(event, direction, distance, duration, fingerCount) {
                if($wrap_content.hasClass('animating') || $wrap_content.hasClass('show-sidebar')) return false;

                $wrap_content.addClass('animating');

                if($wrap_content.hasClass('show-search')) {
                    showSearch();

                    return false;
                }

                showSidebar();
            }
        });

        function showSearch(){
            var leftMargin = $(window).width() - 48;

            if($wrap_content.hasClass('show-search')){
                $wrap_content.animate({
                   left: 0
                }, 300, function(){
                    $wrap_content.removeClass('show-search animating');
                    $('body').removeClass('noscroll');
                });
            } else {
                $wrap_content.animate({
                    left: -leftMargin
                }, 300, function(){
                    $wrap_content.addClass('show-search')
                        .removeClass('animating');
                    $('body').addClass('noscroll');
                });
            }
        }

        function showSidebar(){
            if($wrap_content.hasClass('show-sidebar')){
                $wrap_content.animate({
                    left: 0
                }, 300, function(){
                    $wrap_content.removeClass('show-sidebar animating');
                    $('body').removeClass('noscroll');
                });
            } else {
                $wrap_content.animate({
                    left: 200
                }, 300, function(){
                    $wrap_content.addClass('show-sidebar')
                        .removeClass('animating');
                    $('body').addClass('noscroll');
                });
            }
        }

        $(document).on("touchmove", '.noscroll', function(event) {
            if(!$('.b-sidebar, .b-search').has($(event.target)).length) {
                event.preventDefault();
                event.stopPropagation();
            }
        });


    });

    $(window).load(function() {
        $('.b-post__content').not('.b-post__content_full').each(function(){
            if($(this).height() > 380){
                $(this).height(380).append('<div class="b-post__expand">показать все</div>');
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
 * Плавная прокрутка
 *
 * param {string} Id объекта к которому нужно скролить
 * */
function scrollto_c(elem){
    $('html, body').animate({
        scrollTop: $(elem).offset().top
    }, 500);
}
