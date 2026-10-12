angular.module("sn_chg_soc_cp.snColorPicker", ["ui.bootstrap", "ui.bootstrap.tooltip", "ui.bootstrap.popover","sn.common.i18n", "sn.chg_soc.accessibility"])
.constant("VIEW", {
	"HSL": "hsl",
	"PALLET" : "pallet",
	"NONE" : "none",
	"KEYS" : {
		"TABKEY"          : 9,
		"ENTER"           : 13,
		"ESCAPE"          : 27
	}
})
.directive("focusThis", function($timeout) {
    return {
        scope: { trigger: "@focusThis" },
        link: function(scope, element) {
            scope.$watch("trigger", function(value) {
                if (value === "true")
                    $timeout(function() { element[0].focus(); });
            });
        }
    };
})
.directive("trapTabFocus", ["VIEW", "$timeout", function (VIEW, $timeout) {
	return {
		restrict: "A",
		link: function ($scope, $element, $attr) {
			$element.on("keyup", function(event) {
				if (event.keyCode === VIEW.KEYS.ESCAPE) {
					event.stopPropagation();
					event.preventDefault();
					$timeout(function() { $scope.$parent.action.cancel(); });
				}
			});
			$element.on("keydown", function(event) {
				if (event.keyCode === VIEW.KEYS.TABKEY) {
					var tabEls = $element.find(":tabbable");
					var firstEl = tabEls.first();
					var lastEl = tabEls.last();
					// tab and last element then focus on first element
					if (!event.shiftKey && event.target === lastEl[0]) {
						event.preventDefault();
						firstEl.focus();
					}
					// shift+tab and first element then focus on last element
					if (event.shiftKey && event.target === firstEl[0]) {
						event.preventDefault();
						lastEl.focus();
					}
					return;
				}
				if (event.keyCode === VIEW.KEYS.ESCAPE) {
					event.stopPropagation();
					event.preventDefault();
				}
			});
		}
	};
}])
.run(["$templateCache", function($templateCache) {
	$templateCache.put("sn-cp-c63eae2d5710130034d169202d94f92f.html",
		'<div sn-color-picker-control trap-tab-focus="" class="cp-container" ng-class="{' +
									'\'alpha\' : options.alpha && state.view != pallet,' +
									'\'pallet\': state.view == \'pallet\',' +
									'\'rgb\': options.compView && state.view == \'hsl\'' +
									'}">' +
			'<sn-color-picker-tabs ng-if="options.tabs"></sn-color-picker-tabs>' +
			'<sn-color-picker-hsl ng-style="state.view == \'hsl\' ? {} : {\'display\': \'none\'}"></sn-color-picker-hsl>' +
			'<sn-color-picker-pallet ng-style="state.view == \'pallet\' ? {} : {\'display\': \'none\'}"></sn-color-picker-pallet>' +
			'<sn-color-picker-save-cancel ng-if="options.saveCancel"></sn-color-picker-save-cancel>' +
		'</div>'
	);
}])
.directive("afterRender", ["$timeout", function ($timeout) {
	return {
		restrict: 'A',
		terminal: true,
		transclude: false,
		scope: {
			afterRender: '&'
		},
		link: function (scope) {
			$timeout(function() {
				scope.afterRender();
			}, 0);
		}
	};
}])
.directive("snColorPicker", ["$compile", "$document", "$timeout", "VIEW", "i18n", function($compile, $document, $timeout, VIEW, i18n) {
	/**
	 * Represents a colour. Deals with colourspace translations etc.
	 * @constructor
	 */
	function Color() {
		// Default to a blue
		this.r = 10;
		this.g = 10;
		this.b = 252;
		this.a = 1;
	}
	Color.prototype = (function() {
		// Forward lookup of color names
		var W3C_COLOR = {
			"aliceblue": "#f0f8ff",
			"antiquewhite": "#faebd7",
			"aqua": "#00ffff",
			"aquamarine": "#7fffd4",
			"azure": "#f0ffff",
			"beige": "#f5f5dc",
			"bisque": "#ffe4c4",
			"black": "#000000",
			"blanchedalmond": "#ffebcd",
			"blue": "#0000ff",
			"blueviolet": "#8a2be2",
			"brown": "#a52a2a",
			"burlywood": "#deb887",
			"cadetblue": "#5f9ea0",
			"chartreuse": "#7fff00",
			"chocolate": "#d2691e",
			"coral": "#ff7f50",
			"cornflowerblue": "#6495ed",
			"cornsilk": "#fff8dc",
			"crimson": "#dc143c",
			"cyan": "#00ffff",
			"darkblue": "#00008b",
			"darkcyan": "#008b8b",
			"darkgoldenrod": "#b8860b",
			"darkgray": "#a9a9a9",
			"darkgreen": "#006400",
			"darkkhaki": "#bdb76b",
			"darkmagenta": "#8b008b",
			"darkolivegreen": "#556b2f",
			"darkorange": "#ff8c00",
			"darkorchid": "#9932cc",
			"darkred": "#8b0000",
			"darksalmon": "#e9967a",
			"darkseagreen": "#8fbc8f",
			"darkslateblue": "#483d8b",
			"darkslategray": "#2f4f4f",
			"darkturquoise": "#00ced1",
			"darkviolet": "#9400d3",
			"deeppink": "#ff1493",
			"deepskyblue": "#00bfff",
			"dimgray": "#696969",
			"dodgerblue": "#1e90ff",
			"firebrick": "#b22222",
			"floralwhite": "#fffaf0",
			"forestgreen": "#228b22",
			"fuchsia": "#ff00ff",
			"gainsboro": "#dcdcdc",
			"ghostwhite": "#f8f8ff",
			"gold": "#ffd700",
			"goldenrod": "#daa520",
			"gray": "#808080",
			"green": "#008000",
			"greenyellow": "#adff2f",
			"honeydew": "#f0fff0",
			"hotpink": "#ff69b4",
			"indianred": "#cd5c5c",
			"indigo": "#4b0082",
			"ivory": "#fffff0",
			"khaki": "#f0e68c",
			"lavender": "#e6e6fa",
			"lavenderblush": "#fff0f5",
			"lawngreen": "#7cfc00",
			"lemonchiffon": "#fffacd",
			"lightblue": "#add8e6",
			"lightcoral": "#f08080",
			"lightcyan": "#e0ffff",
			"lightgoldenrodyellow": "#fafad2",
			"lightgrey": "#d3d3d3",
			"lightgreen": "#90ee90",
			"lightpink": "#ffb6c1",
			"lightsalmon": "#ffa07a",
			"lightseagreen": "#20b2aa",
			"lightskyblue": "#87cefa",
			"lightslategray": "#778899",
			"lightsteelblue": "#b0c4de",
			"lightyellow": "#ffffe0",
			"lime": "#00ff00",
			"limegreen": "#32cd32",
			"linen": "#faf0e6",
			"magenta": "#ff00ff",
			"maroon": "#800000",
			"mediumaquamarine": "#66cdaa",
			"mediumblue": "#0000cd",
			"mediumorchid": "#ba55d3",
			"mediumpurple": "#9370d8",
			"mediumseagreen": "#3cb371",
			"mediumslateblue": "#7b68ee",
			"mediumspringgreen": "#00fa9a",
			"mediumturquoise": "#48d1cc",
			"mediumvioletred": "#c71585",
			"midnightblue": "#191970",
			"mintcream": "#f5fffa",
			"mistyrose": "#ffe4e1",
			"moccasin": "#ffe4b5",
			"navajowhite": "#ffdead",
			"navy": "#000080",
			"oldlace": "#fdf5e6",
			"olive": "#808000",
			"olivedrab": "#6b8e23",
			"orange": "#ffa500",
			"orangered": "#ff4500",
			"orchid": "#da70d6",
			"palegoldenrod": "#eee8aa",
			"palegreen": "#98fb98",
			"paleturquoise": "#afeeee",
			"palevioletred": "#d87093",
			"papayawhip": "#ffefd5",
			"peachpuff": "#ffdab9",
			"peru": "#cd853f",
			"pink": "#ffc0cb",
			"plum": "#dda0dd",
			"powderblue": "#b0e0e6",
			"purple": "#800080",
			"red": "#ff0000",
			"rosybrown": "#bc8f8f",
			"royalblue": "#4169e1",
			"saddlebrown": "#8b4513",
			"salmon": "#fa8072",
			"sandybrown": "#f4a460",
			"seagreen": "#2e8b57",
			"seashell": "#fff5ee",
			"sienna": "#a0522d",
			"silver": "#c0c0c0",
			"skyblue": "#87ceeb",
			"slateblue": "#6a5acd",
			"slategray": "#708090",
			"snow": "#fffafa",
			"springgreen": "#00ff7f",
			"steelblue": "#4682b4",
			"tan": "#d2b48c",
			"teal": "#008080",
			"thistle": "#d8bfd8",
			"tomato": "#ff6347",
			"turquoise": "#40e0d0",
			"violet": "#ee82ee",
			"wheat": "#f5deb3",
			"white": "#ffffff",
			"whitesmoke": "#f5f5f5",
			"yellow": "#ffff00",
			"yellowgreen": "#9acd32"
		};

		// Reverse lookup of colour names
		var REV_W3C_COLOR = {};
		for (var key in W3C_COLOR)
			REV_W3C_COLOR[W3C_COLOR[key]] = key;

		/**
		 * Pads single character hex color to double character e.g. F -> FF
		 * @param {string} colorHex
		 */
		function padColorHex(colorHex) {
			return colorHex.length < 2 ? colorHex + colorHex : colorHex;
		}

		//Conversions for valid W3C CSS colour types
		var CONVERT = {
			"RGB_3": {
				p: /^\s*#([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})\s*$/i,
				f: function(match) {
					return {
						r: parseInt(padColorHex(match[1]), 16),
						g: parseInt(padColorHex(match[2]), 16),
						b: parseInt(padColorHex(match[3]), 16),
						a: 1
					};
				}
			},
			"RGB_6": {
				p: /^\s*#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})\s*$/i,
				f: function(match) {
					return {
						r: parseInt(match[1], 16),
						g: parseInt(match[2], 16),
						b: parseInt(match[3], 16),
						a: 1
					};
				}
			},
			"RGBA_4": {
				p: /^\s*#([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})([0-9a-f]{1})\s*$/i,
				f: function(match){
					return {
						r: parseInt(padColorHex(match[1]), 16),
						g: parseInt(padColorHex(match[2]), 16),
						b: parseInt(padColorHex(match[3]), 16),
						a: enforceNormalizedRange(parseInt(padColorHex(match[4]), 16)/255)
					};
				}
			},
			"RGBA_8": {
				p: /^\s*#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})\s*$/i,
				f: function(match) {
					return {
						r: parseInt(match[1], 16),
						g: parseInt(match[2], 16),
						b: parseInt(match[3], 16),
						a: enforceNormalizedRange(parseInt(match[4], 16)/255)
					};
				}
			},
			"RGB_CSS" : {
				p: /^\s*rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)\s*$/,
				f: function(match){
					return {
						r: enforce8BitRange(match[1]),
						g: enforce8BitRange(match[2]),
						b: enforce8BitRange(match[3]),
						a:1
					};
				}
			},
			"RGBA_CSS" : {
				p: /^\s*rgba\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(1(\.0)?|0(.\d+)?)\s*\)\s*$/,
				f: function(match) {
					return {
						r: enforce8BitRange(match[1]),
						g: enforce8BitRange(match[2]),
						b: enforce8BitRange(match[3]),
						a: enforceNormalizedRange(match[4])
					};
				}
			},
			"HSL_CSS": {
				p: /^\s*hsl\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)\s*$/,
				f: function(match) {
					return hsl2rgb ({
						h: enforceDegreeRange(match[1]),
						s: enforceNormalizedRange(match[2]/100),
						l: enforceNormalizedRange(match[3]/100),
						a: 1
					});
				}
			},
			"HSLA_CSS": {
				p: /^\s*hsla\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(1(\.0)?|0(.\d+)?)\s*\)\s*$/,
				f: function(match) {
					return hsl2rgb ({
						h: enforceDegreeRange(match[1]),
						s: enforceNormalizedRange(match[2]/100),
						l: enforceNormalizedRange(match[3]/100),
						a: enforceNormalizedRange(match[4])
					});
				}
			},
			"evalOrder" : ["RGB_6", "RGB_3", "RGBA_CSS", "RGB_CSS", "RGBA_4", "RGBA_8", "HSL_CSS", "HSLA_CSS"]
		};


		/**
		 * Enforces an 8 Bit value range, 0-255
		 *
		 * @param {number} val
		 */
		function enforce8BitRange(val) {
			return Math.max(0, Math.min(255, Math.round(val)));
		}

		/**
		 * Enforces hue degrees range, 0-360
		 * @param {number} val
		 */
		function enforceDegreeRange(val) {
			return Math.max(0, Math.min(360, val));
		}

		/**
		 * Enforces an normalised range, 0-1
		 * @param {number} val
		 */
		function enforceNormalizedRange(val) {
			return Math.max(0, Math.min(1, val));
		}

		/**
		 * Converts a normalised 0-1 based value to an 8 bit value 0-255
		 * @param {number} val
		 */
		function normalizedTo8Bit(val) {
			return enforce8BitRange(val*255);
		}

		function hsl2rgb(hsl) {
			function toRGBVal(t1, t2, tCol) {
				if (tCol < 0) tCol += 1;
				if (tCol > 1) tCol -= 1;

				if (6 * tCol < 1)
					return normalizedTo8Bit(t2 + (t1 - t2) * 6 * tCol);
				if (2 * tCol < 1)
					return normalizedTo8Bit(t1);

				// 3*tCol < ~2.  Last one.  Could be over 2 due to rounding
				return normalizedTo8Bit(t2 + (t1 - t2) * (2/3 - tCol) * 6);
			}

			if (hsl.s == 0) {  //Grey
				var colVal = normalizedTo8Bit(hsl.l);
				return {
					r: colVal,
					g: colVal,
					b: colVal,
					a: hsl.a || 1
				};
			}

			var t1 = hsl.l < 0.5 ? hsl.l * (1 + hsl.s) : (hsl.l + hsl.s) - (hsl.l * hsl.s);
			var t2 = (2 * hsl.l) - t1;

			var hue = hsl.h/360;

			var tR = hue + (1/3);
			var tG = hue;
			var tB = hue - (1/3);

			return {
				r: toRGBVal(t1, t2, tR),
				g: toRGBVal(t1, t2, tG),
				b: toRGBVal(t1, t2, tB),
				a: hsl.a || 1
			};
		}

		function rgb2hsl(rgb) {
			var rgbMin = Math.min(rgb.r, rgb.g, rgb.b);
			var rgbMax = Math.max(rgb.r, rgb.g, rgb.b);
			var rgbDelta = rgbMax - rgbMin;

			var l = (rgbMax + rgbMin) / 510;

			// Grey
			if (rgbDelta == 0)
				return {
					h: 0,
					s: 0,
					l: l,
					a: rgb.a || 1
				};

			var s = l < 0.5 ? rgbDelta / (rgbMax + rgbMin) : rgbDelta / (510 - rgbMax - rgbMin);

			var h = 0;
			if (rgb.r == rgbMax)
				h = (rgb.g - rgb.b) / rgbDelta;
			else if (rgb.g == rgbMax)
				h = 2 + (rgb.b - rgb.r) / rgbDelta;
			else
				h = 4 + (rgb.r - rgb.g) / rgbDelta;

			h *= 60; //To degrees

			return {
				"h": h,
				"s": s,
				"l": l,
				"a": rgb.a || 1
			};
		}

		/**
		 * Converts to a 2 character hex value
		 * @param {number} decVal
		 */
		function toHex(decVal) {
			decVal = enforce8BitRange(decVal);
			var hexVal = decVal.toString(16);
			return hexVal.length < 2 ? "0" + hexVal : hexVal;
		}

		function rgbHexFormat(rgb) {
			var retVal = "#" + toHex(rgb.r) + toHex(rgb.g) + toHex(rgb.b);
			if (rgb.a >= 0 && rgb.a < 1)
				retVal += toHex(rgb.a * 255);
			return retVal;
		}

		return {
			/**
			 * Return a colour which can be used in browser
			 * Very simple at the moment.  Needs to understand more.
			 */
			getColor: function() {
				// Default for colours with alpha is rgba (for IE support)
				if (this.a > 0 && this.a < 1)
					return this.rgba();

				// Otherwise, to hex then check the for standard colours
				var retVal = this.rgbHex();

				if (this.enumerateNames)
					retVal = REV_W3C_COLOR[retVal] || retVal;

				return retVal;
			},

			/**
			 * Set the colour from an HTML color
			 * Very simple at the moment.  Needs to understand more.
			 */
			setColor: function(color) {
				if (!color)
					return;

				// Deal with named colours
				color = color.toLowerCase();
				color = W3C_COLOR[color] || color;

				var colSep = null;
				CONVERT.evalOrder.some(function(key) {
					var matchArr = CONVERT[key].p.exec(color);
					if (!matchArr)
						return false;

					colSep = CONVERT[key].f(matchArr);

					if (!colSep)
						return false;

					return true;
				});

				if (!colSep)
					return;

				this.setRGB(colSep);
			},
			/**
			 * Returns CSS rgba(r,g,b,a) format
			 */
			rgba: function() {
				return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a.toFixed(3) + ")";
			},
			/**
			 * Returns 6 or 8 byte hex rgb format depending on alpha value
			 */
			rgbHex: function() {
				return rgbHexFormat(this);
			},
			/**
			 * Returns the colour ignoring the alpha value
			 */
			rgbHexNoAlpha: function() {
				var rgb = this.getRGB();
				rgb.a = 1;
				return rgbHexFormat(rgb);
			},
			/**
			 * Sets the colour from an RGB values object.
			 * r,g and b values should be in the range 0-255. a, 0-1
			 * @param {{r:number,g:number,b:number, a:number}} rgb
			 */
			setRGB: function(rgb) {
				this.r = enforce8BitRange(rgb.r);
				this.g = enforce8BitRange(rgb.g);
				this.b = enforce8BitRange(rgb.b);
				this.a = enforceNormalizedRange(rgb.a || 1);
			},

			/**
			 * Returns the color as an RGB object
			 * @returns {{r: number, g: number, b: number, a:number}}
			 */
			getRGB: function() {
				return {
					r: this.r,
					g: this.g,
					b: this.b,
					a: this.a
				};
			},
			/**
			 * Sets the colour from an HSL values object.
			 * Ranges: h: 0-360, s: 0-1, l: 0-1, a: 0-1
			 * @param {{h:number,s:number,l:number,a:number}} hsl
			 */
			setHSL: function(hsl) {
				var rgb = hsl2rgb(hsl);
				this.r = rgb.r;
				this.g = rgb.g;
				this.b = rgb.b;
				this.a = hsl.a || 1;
			},

			getHSL: function() {
				return rgb2hsl(this);
			},
			/**
			 * Returns the hue base color (saturation=1, luminance=0.5, ignore alpha).
			 * Uses color values unless hsl object is provided
			 *
			 * @param {{h:number,s:number,l:number}} hsl
			 */
			rgbBaseHue: function(hsl) {
				if (!hsl)
					hsl = rgb2hsl(this);
				return rgbHexFormat(hsl2rgb({h: hsl.h, s: 1, l: 0.5}));
			},

			/**
			 * If getColor should return W3C Color names.
			 */
			enumerateW3CColorNames: function(enumerateNames) {
				this.enumerateName = enumerateNames;
			},

			/**
			 * Colour utility functions
			 */
			utils: {
				"enforce8BitRange": enforce8BitRange,
				"enforceDegreeRange": enforceDegreeRange,
				"enforceNormalizedRange":  enforceNormalizedRange,
				"normalizedTo8Bit": normalizedTo8Bit,
				"hsl2rgb": hsl2rgb,
				"rgb2hsl": rgb2hsl
			}
		};
	})();

	/**
	 * The default options for the picker.  These should be overloaded using the picker-options attribute
	 * @param {placement: string, alpha:boolean, view:string}
	 */
	var DEFAULT_OPTIONS = {
		placement: "auto bottom-right", // Popover placement
		alpha: false, // Include the alpha
		view: VIEW.HSL,  // Available views: hsl, pallet
		toggle: false, // Toggle between views (instead of tabs.  Tabs wins)
		tabs: true, // Tabs for views
		//rgbField: false, //Show RGB Fields
		hexField: true, // Show Hex Value field
		saveCancel: false, // Show Save Cancel buttons
		w3cColors: false, //If true getColor will return the W3C name of the colour (if there is one)
		compView: true,
		pallet: ["#278EFC", "#6D79E8", "#289FBD", "#19C4D1", "#52DBA7",
				"#83BFFF", "#A0A8F1", "#74C2E8", "#68D9E1", "#8FE9C6",
				"#71E279", "#FCC742", "#FC8A3D", "#F84B4B", "#F95095",
				"#A4EDA8", "#FFDB85", "#FFB47D", "#F78181", "#FA8DB7",
				"#BDDCFC", "#BDC0C4", "#81878E", "#485563", "#343D47"]
	};

	return {
		restrict: "A",
		replace: false,
		terminal: true,
		priority: 1001,
		scope: {
			pickerColor: "=",
			pickerLabel: "@",
			pickerOptions: "=",
			pickerSaveAction: "&",
			pickerCancelAction: "&"
		},
		link: function(scope, element) {

			function outsideClickHandler(event) {
				var tooltips = document.getElementsByClassName("sn-color-picker");
				if (element[0] == event.target || (tooltips[0] && !tooltips[0].contains(event.target))) {
					registerClosedListeners();
					doCancel();
					scope.$apply();
				}
			}

			function targetElementHandler(event) {
				//Reset origin colour each time the picker is opened
				scope.state.originColor = scope.pickerColor;
				if (scope.state.originColor)
					scope.color.setColor(scope.state.originColor);
				scope.state.open = true;
				event.stopPropagation();
				registerOpenListeners();
				scope.$apply();
			}

			function registerOpenListeners() {
				element.off("click", targetElementHandler);
				$document.on("click", outsideClickHandler);
			}

			function registerClosedListeners() {
				$document.off("click", outsideClickHandler);
				element.on("click", targetElementHandler);
				element.focus();
			}

			function doSave() {
				if (scope.options.saveCancel)
					scope.pickerSaveAction({color: scope.color});

				scope.state.open = false;
			}

			function doCancel() {
				if (scope.options.saveCancel) {
					scope.pickerColor = scope.state.originColor;
					scope.pickerCancelAction({color: scope.color});
				}

				scope.state.open = false;
			}

			scope.isOpen = function() {
				return scope.state.open;
			};

			scope.action = {
				save: function() {
					doSave();
					registerClosedListeners();
				},

				cancel: function() {
					doCancel();
					registerClosedListeners();
				},
				palletView: function() {
					if (scope.state.view === VIEW.PALLET)
						return;

					scope.state.view = VIEW.PALLET;
				},
				hslView: function() {
					if (scope.state.view === VIEW.HSL)
						return;

					scope.state.view = VIEW.HSL;
				}
			};

			function configureOptions() {
				scope.options = angular.extend({}, DEFAULT_OPTIONS, scope.pickerOptions);

				//Setup options if tabs is selected
				if (scope.options.compView) {
					scope.options.alpha = false;
					scope.options.tabs = true;
				}

				if (scope.options.toggle && scope.options.tabs)
					scope.options.toggle = false;

				// Check the provided view
				if (scope.pickerOptions && scope.pickerOptions.view && !VIEW[scope.pickerOptions.view.toUpperCase()])
					scope.options.view = VIEW.HSL;

				// Default the pallet if it's invalid or a 0 length array
				if (scope.options.pallet.constructor !== Array || scope.options.pallet.length == 0)
					scope.options.pallet = DEFAULT_OPTIONS.pallet;

				// If the pallet is less than 25 colours we need to expand it to make it look OK.
				// Duplicate colours from the provided pallet to make up the deficite.
				if (scope.options.pallet.length < 25) {
					var colCount = 0;
					for (var pi = scope.options.pallet.length-1; pi < 25; pi++) {
						scope.options.pallet.push(scope.pickerOptions.pallet[colCount++]);
						if (colCount == scope.pickerOptions.pallet.length)
							colCount = 0;
					}
				}

				scope.color.enumerateW3CColorNames(scope.options.w3cColors);

				// Set up the display state
				scope.state = angular.extend({}, scope.state, {
					open: false,
					view: scope.options.view,
					maxPalletColors: scope.options.toggle ? 24 : 25
				});
			}

			scope.locale = {
				redChar: i18n.getMessage("rgba_red_field_character_label"),
				greenChar: i18n.getMessage("rgba_green_field_character_label"),
				blueChar: i18n.getMessage("rgba_blue_field_character_label"),
				alphaChar: i18n.getMessage("rgba_alpha_field_character_label"),
				colorCode: i18n.getMessage("Color code"),
				save: i18n.getMessage("Save"),
				cancel: i18n.getMessage("Cancel"),
				pallet: i18n.getMessage("Pallet"),
				advanced: i18n.getMessage("Advanced")
			};

			//watch picker options
			if (scope.pickerOptions)
				scope.$watch("pickerOptions", function() {
					configureOptions();
				}, true);

			//Mount points for the trigger actions
			element.attr("uib-popover-template", "'sn-cp-c63eae2d5710130034d169202d94f92f.html'");
			element.attr("popover-placement", "{{options.placement}}");
			element.attr("popover-class", "sn-color-picker");
			element.attr("popover-trigger", "'none'");
			element.attr("popover-is-open", "isOpen()");
			element.attr("popover-append-to-body", true);
			element.attr("aria-label", scope.pickerLabel);

			element.removeAttr("sn-color-picker"); //Prevent compile loop
			$compile(element)(scope);

			// Create a colour object in scope
			scope.color = new Color();

			configureOptions();
			registerClosedListeners();

			scope.$watchGroup(["color.r","color.g","color.b","color.a"], function(newValue, oldValue) {
				if (newValue == oldValue)
					return;

				scope.pickerColor = scope.color.getColor();

			}, true);
		}
	};
}])
.directive("snColorPickerTabs", [function() {
	return {
		restrict: "E",
		replace: true,
		template:  '<div class="cp-control-group cp-tab-container" role="tablist">' +
						'<button id="cpPalletTab" focus-this="true" class="btn sn-navhub-btn sn-navhub-btn_text cp-tab" ng-class="{\'state-active\': state.view == \'pallet\'}" ng-click="action.palletView()" role="tab" aria-label="{{locale.pallet}}" aria-controls="cpPalletPanel"><span class="icon-cards dead-centre"></span></button>' +
						'<button id="cpAdvancedTab" class="btn sn-navhub-btn sn-navhub-btn_text cp-tab" ng-class="{\'state-active\': state.view == \'hsl\'}" ng-click="action.hslView()" role="tab" aria-label="{{locale.advanced}}" aria-controls="cpAdvancedPanel"><span ng-include="\'styles/sn_chg_soc_cp/Fill-color.svg\'" class="icon-bucket dead-centre"></span></button>' +
					'</div>'
	};
}])
.directive("snColorPickerSaveCancel", function() {
	return {
		restrict: "E",
		replace: true,
		template: 	'<div class="cp-control-group save-cancel">' +
						'<div class="cp-btn"><button class="btn btn-default" ng-click="action.cancel()" aria-label="{{locale.cancel}}">{{locale.cancel}}</button></div>' +
						'<div class="cp-btn"><button class="btn btn-primary" ng-click="action.save()" aria-label="{{locale.save}}">{{locale.save}}</button></div>' +
					'</div>'
	};
})
.directive("snColorPickerHsl", function() {
	return {
		restrict: "E",
		replace: true,
		controller: function() {
			//Blank controller for require
		},
		template:	'<div id="cpAdvancedPanel" role="tabpanel" aria-labelledby="cpAdvancedTab">' +
						'<div class="cp-control-group hsl-group">' +
							'<sn-color-picker-saturation-luminance></sn-color-picker-saturation-luminance>' +
							'<sn-color-picker-rgb-fields ng-if="options.compView"></sn-color-picker-rgb-fields>' +
							'<sn-color-picker-hue ng-if="!options.compView"></sn-color-picker-hue>' +
							'<sn-color-picker-alpha ng-if="options.alpha"></sn-color-picker-alpha>' +
						'</div>' +
						'<div class="cp-control-group hsl-group">' +
							'<sn-color-picker-hue orientation="horizontal" ng-if="options.compView"></sn-color-picker-hue>' +
							'<sn-color-picker-swatch></sn-color-picker-swatch>' +
							'<sn-color-picker-pallet-toggle ng-if="options.toggle"></sn-color-picker-pallet-toggle>' +
						'</div>' +
						'<div class="cp-control-group" ng-if="options.hexField">' +
							'<sn-color-picker-hex-field></sn-color-picker-hex-field>' +
						'</div>' +
					'</div>',
		link: function(scope) {
			scope.hsl = scope.color.getHSL();
		}
	};
})
.directive("snColorPickerSaturationLuminance", function($log) {
	/**
	 * Calculates the intersection between to lines a and b defined by 2 element array containing start and end coords
	 * @param {Array.<{x:number,y:number}>} a
	 * @param {Array.<{x:number,y:number}>} b
	 * @return {Array.<{x:number,y:number}>}
	 */
	function lineIntersect(a, b) {
		var denom = (b[1].y - b[0].y) * (a[1].x - a[0].x) - (b[1].x - b[0].x) * (a[1].y - a[0].y);
		if (denom == 0)
			return null;

		var ua = ((b[1].x - b[0].x) * (a[0].y - b[0].y) - (b[1].y - b[0].y) * (a[0].x - b[0].x))/denom;

		return {
			x: a[0].x + ua*(a[1].x - a[0].x),
			y: a[0].y + ua*(a[1].y - a[0].y)
		};
	}

	/**
	 * Equivalent to Math.hypot (not supported by IE)
	 * @param {number} x
	 * @param {number} y
	 */
	function hypot(x, y) {
		return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
	}

	return {
		restrict: "E",
		replace: true,
		require: "^snColorPickerHsl",
		template: '<div class="cp-control saturation-luminance" ng-class="{\'compact-lhs\': options.compView}"><i class="cp-hsl-lens"></i></div>',
		link: function(scope, element) {

			// Takes the coordinates from the event, works out the location on the SL plane and sets the values in the color picker accordingly
			// Some linear equations for the saturation and luminance values
			function setSLValue(event) {
				var slPlane = element[0].getBoundingClientRect();
				var slX = event.pageX - slPlane.left;
				var slY = event.pageY - slPlane.top;

				//There has to be a better way to do this than linear equations

				// Slope for the saturation and luminance axis
				var satM = (slPlane.width - 0)/(0 - slPlane.height);
				var lumM = (slPlane.height - 0)/(slPlane.width - 0);

				// Find b (y intersect) for clicked point for given slope
				var satB = (satM * slX - slY) * -1;
				var lumB = (lumM * slX - slY) * -1;

				var lumIntersectLine = [{x: 0, y: satB}, {x: slPlane.width, y: satM * slPlane.width + satB}];
				var satIntersectLine = [{x: 0, y: lumB}, {x: slPlane.width, y: lumM * slPlane.width + lumB}];

				var lumLine = [{x: 0, y: 0},{x: slPlane.width, y: slPlane.height}];
				var satLine = [{x: slPlane.width, y: 0},{x: 0, y: slPlane.height}];

				var axLen = hypot(slPlane.width, slPlane.height);

				var lumIntersect = lineIntersect(lumLine, lumIntersectLine);
				var lumHypot = hypot(lumIntersect.x, lumIntersect.y);

				var satIntersect = lineIntersect(satLine, satIntersectLine);
				var satHypot = hypot(slPlane.width - satIntersect.x, satIntersect.y);

				// Work out the locations as a percentage of the plane.
				// The plane is 100% luminance 0% saturation top left, 0% luminance, 100% saturation bottom right
				scope.hsl.l = scope.color.utils.enforceNormalizedRange(1 - (lumHypot/axLen));
				scope.hsl.s = scope.color.utils.enforceNormalizedRange(1 - (satHypot/axLen));
				scope.color.setHSL(scope.hsl);
				scope.$apply();
			}

			function setLensElementXY(lensX, lensY) {
				var slPlane = element[0].getBoundingClientRect();
				var lensElement = angular.element(element.find("i")[0]);
				var pW = Math.round(slPlane.width);
				var pH = Math.round(slPlane.height);
				var lH = Math.round(lensElement[0].getBoundingClientRect().height);
				var lW = Math.round(lensElement[0].getBoundingClientRect().width);

				// Modify lens location for lens size
				lensX = lensX - lW/2;
				lensY = lensY - lH/2;

				// Check bounds
				if (lensX >= pW - Math.round(lW/2))
					lensX = pW - lW;
				else if (lensX <= 0)
					lensX = 0 - Math.round(lW/2);

				if (lensY >= pH - Math.round(lH/2))
					lensY = slPlane.height - lH;
				else if (lensY <= 0)
					lensY = 0 - Math.round(lH/2);

				lensElement[0].style.left = lensX;
				lensElement[0].style.top = lensY;
			}

			// Calculate the marker location
			// If there' no event, calculate (precision is not great) otherwise use event click
			function setLensLocation(event) {
				var slPlane = element[0].getBoundingClientRect();
				if (event) {
					var lensX = event.pageX - slPlane.left;
					var lensY = event.pageY - slPlane.top;
					setLensElementXY(lensX, lensY);
					return;
				}

				var slX = event.pageX - slPlane.left;
				var slY = slPlane.height - (event.pageY - slPlane.top);

				// Slope for the saturation and luminance diagonal axis
				var satM = slPlane.width/slPlane.height;
				var lumM = satM * -1;

				var axLen = hypot(slPlane.width, slPlane.height);

				var satMRad = Math.atan(satM);
				var lumMRad = Math.atan(lumM);

				var satLen = axLen * scope.hsl.s;
				var lumLen = axLen - (axLen * scope.hsl.l);

				var satXY = {
					x: Math.cos(satMRad) * satLen,
					y: Math.sin(satMRad) * satLen
				};

				var lumXY = {
					x: Math.cos(lumMRad) * lumLen,
					y: slPlane.height + Math.sin(lumMRad) * lumLen
				};

				//c = (mx - y) -1
				//(y - c) / m = x

				//var satC =

				//$log.debug(satXY);
				//$log.debug(lumXY);

				//c = (mx - y) * -1
				//y = mx + c


				/*
				var satB = (satM * slX - slY) * -1;
				var lumB = (lumM * slX - slY) * -1;

				var lumIntersectLine = [{x: 0, y: satB}, {x: slPlane.width, y: satM * slPlane.width + satB}];
				var satIntersectLine = [{x: 0, y: lumB}, {x: slPlane.width, y: lumM * slPlane.width + lumB}];
				*/

				var lumLines = {
					xAxis: [{x: lumXY.x, y:0},{x: lumXY.x, y: slPlane.height}],
					yAxis: [{x:0, y:lumXY.y},{x:slPlane.width, y:lumXY.y}]
				};
				var satLines = {
					xAxis: [{x:satXY.x, y:0},{x:satXY.x, y:slPlane.height}],
					yAxis: [{x: 0, y: satXY.y},{x: slPlane.width, y: satXY.y}]
				};

				//$log.debug(lineIntersect(lumLines.yAxis, satLines.xAxis));
				//$log.debug(lineIntersect(lumLines.xAxis, satLines.yAxis));
				//$log.debug(scope.hsl);
			}

			function mouseUpHandler(event) {
				element.off("mouseup", mouseUpHandler);
				element.off("mousemove", mouseDragHandler);
				element.off("mouseleave", mouseLeaveHandler);
				setSLValue(event);
				setLensLocation(event);
			}

			function mouseDownHandler(event) {
				element.on("mouseup", mouseUpHandler);
				element.on("mousemove", mouseDragHandler);
				element.on("mouseleave", mouseLeaveHandler);
				event.preventDefault();
			}

			function mouseLeaveHandler(event) {
				mouseUpHandler(event);
			}

			function mouseDragHandler(event) {
				setSLValue(event);
			}

			element.on("mousedown", mouseDownHandler);

			scope.$watch("hsl.h", function() {
				element.css("background-color", scope.color.rgbBaseHue(scope.hsl));
			});
		}
	};
})
.directive("snColorPickerHue", function($log) {
	return {
		restrict: "E",
		replace: true,
		require: "^snColorPickerHsl",
		template: '<div after-render="setHueSliderLocation()" class="cp-control hue" ng-class="{\'vertical\' : vertical, \'horizontal\': !vertical}"><i class="cp-hsl-slider"></i></div>',
		link: function(scope, element, attrs) {
			scope.vertical = true;
			if (attrs.orientation && attrs.orientation === "horizontal")
				scope.vertical = false;

			function setHueValue(event) {
				var huePlane = element[0].getBoundingClientRect();
				var hueY = event.pageY - huePlane.top;
				var hueX = event.pageX - huePlane.left;

				if (scope.vertical) {
					// The hue plane is a vertical representation of the color wheel, 0deg at the top, 360deg at the bottom.
					scope.hsl.h = scope.color.utils.enforceDegreeRange((hueY/huePlane.height) * 360);
				} else {
					// The hue plane is a horisontal representation of the color wheel, 0deg left, 360deg right
					scope.hsl.h = scope.color.utils.enforceDegreeRange((hueX/huePlane.width) * 360);
				}
				scope.color.setHSL(scope.hsl);
				scope.$apply();
			}

			function setSliderElementXY(sliderX, sliderY) {
				var huePlane = element[0].getBoundingClientRect();
				var hueSlider = angular.element(element.find("i"));

				var sH = Math.round(hueSlider[0].getBoundingClientRect().height);
				var sW = Math.round(hueSlider[0].getBoundingClientRect().width);

				var pH = Math.round(huePlane.height);
				var pW = Math.round(huePlane.width);

				if (scope.vertical) {
					sliderX  = 0;
					sliderY = sliderY - Math.round(sH/2);
					if (sliderY >= pH - sH)
						sliderY = huePlane.height - sH;
					else if (sliderY <= 0)
						sliderY = 0;
				} else {
					sliderY = 0;
					sliderX = sliderX - Math.round(sW/2);
					if (sliderX >= pW - sW)
						sliderX = pW - sW;
					else if (sliderX <= 0)
						sliderX = 0;
				}

				hueSlider[0].style.top = Math.round(sliderY);
				hueSlider[0].style.left = Math.round(sliderX);
			}

			function setSliderLocation(event) {
				var huePlane = element[0].getBoundingClientRect();
				var sliderX = 0;
				var sliderY = 0;
				if (event) {
					sliderX = event.pageX - huePlane.left;
					sliderY = event.pageY - huePlane.top;
					setSliderElementXY(sliderX, sliderY);
					return;
				}

				//Calculate
				if (scope.vertical) {
					sliderY = Math.round(huePlane.height * (scope.hsl.h/360));
				} else {
					sliderX = Math.round(huePlane.width * (scope.hsl.h/360));
				}
				setSliderElementXY(sliderX, sliderY);
			}

			var mouseDown = false;
			function mouseUpHandler(event) {
				element.off("mouseup", mouseUpHandler);
				element.off("mousemove", mouseDragHandler);
				element.off("mouseleave", mouseLeaveHandler);
				mouseDown = false;
				setHueValue(event);
				setSliderLocation(event);
			}

			function mouseDownHandler(event) {
				mouseDown=true;
				element.on("mouseup", mouseUpHandler);
				element.on("mousemove", mouseDragHandler);
				element.on("mouseleave", mouseLeaveHandler);
				event.preventDefault();
			}

			function mouseLeaveHandler(event) {
				mouseUpHandler(event);
			}

			function mouseDragHandler(event) {
				setHueValue(event);
			}

			element.on("mousedown", mouseDownHandler);

			//Scoped call for after-render
			scope.setHueSliderLocation = function() {
				setSliderLocation();
			};

			scope.$watch("hsl.h", function(newValue, oldValue) {
				if (newValue == oldValue || mouseDown)
					return;

				setSliderLocation();
			});
		}
	};
})
.directive("snColorPickerAlpha", function() {
	return {
		restrict: "E",
		replace: true,
		require: "^snColorPickerHsl",
		template: '<div class="cp-control alpha"></div>',
		link: function(scope, element) {
			function setAlphaValue(event) {
				var alphaPlane = element[0].getBoundingClientRect();
				var alphaY = event.pageY - alphaPlane.top;

				// The alpha plane represents opaque (1 at the top, transparent (0) at the bottom)
				scope.hsl.a = scope.color.utils.enforceNormalizedRange(1 - (alphaY/alphaPlane.height));
				scope.color.setHSL(scope.hsl);
				scope.$apply();
			}

			function mouseUpHandler(event) {
				element.off("mouseup", mouseUpHandler);
				element.off("mousemove", mouseDragHandler);
				element.off("mouseleave", mouseLeaveHandler);
				setAlphaValue(event);
			}

			function mouseDownHandler(event) {
				element.on("mouseup", mouseUpHandler);
				element.on("mousemove", mouseDragHandler);
				element.on("mouseleave", mouseLeaveHandler);
				event.preventDefault();
			}

			function mouseLeaveHandler(event) {
				mouseUpHandler(event);
			}

			function mouseDragHandler(event) {
				setAlphaValue(event);
			}

			element.on("mousedown", mouseDownHandler);

			scope.$watchGroup(["color.r","color.g","color.b"], function() {
				element.css("background-color", scope.color.rgbHexNoAlpha());
			});
		}
	};
})
.directive("snColorPickerSwatch", function() {
	return {
		restrict: "E",
		replace: true,
		require: "^snColorPickerHsl",
		template: '<div class="cp-control swatch" ng-class="{\'no-toggle\': options.toggle==false, \'with-alpha\': options.alpha==true, \'compact-rhs\': options.compView}"></div>',
		link: function(scope, element) {
			scope.$watchGroup(["color.r","color.g","color.b","color.a"], function() {
				element.css('background-color', scope.color.getColor());
			});
		}
	};
})
.directive("snColorPickerRgbFields", function() {
	return {
		restrict: "E",
		replace: true,
		require: "^snColorPickerHsl",
		template: '<div class="cp-control rgb-field-container">' +
					'<div class="rgb-field-element"><label for="cprval" class="rgb-label">{{locale.redChar}}</label><input id="cprval" class="rgb-field default-focus-outline" ng-model="rgb.r" ng-change="changeValue(\'r\')" ng-model-options="{ debounce: 500 }"/></div>' +
					'<div class="rgb-field-element"><label for="cpgval" class="rgb-label">{{locale.greenChar}}</label><input id="cpgval" class="rgb-field default-focus-outline" ng-model="rgb.g" ng-change="changeValue(\'g\')" ng-model-options="{ debounce: 500 }"/></div>' +
					'<div class="rgb-field-element"><label for="cpbval" class="rgb-label">{{locale.blueChar}}</label><input id="cpbval" class="rgb-field default-focus-outline" ng-model="rgb.b" ng-change="changeValue(\'b\')" ng-model-options="{ debounce: 500 }"/></div>' +
					'<div class="rgb-field-element"><label for="cpaval" class="rgb-label">{{locale.alphaChar}}</label><input id="cpaval" class="rgb-field default-focus-outline" ng-model="rgb.a" ng-change="changeValue(\'a\')" ng-model-options="{ debounce: 500 }"/></div>' +
				'</div>',
		link: function(scope) {
			scope.rgb = scope.color.getRGB();

			scope.changeValue = function(key) {
				if (key == "a")
					scope.rgb[key] = scope.color.utils.enforceNormalizedRange(scope.rgb[key]);
				else
					scope.rgb[key] = scope.color.utils.enforce8BitRange(scope.rgb[key]);

				scope.color.setRGB(scope.rgb);
				if (scope.hsl) {
					var hsl = scope.color.getHSL();
					["h","s","l","a"].forEach(function(key) {
						scope.hsl[key] = hsl[key];
					});
				}
			};

			scope.$watchGroup(["color.r","color.g","color.b","color.a"], function() {
				['r','g','b','a'].forEach(function(key) {
					scope.rgb[key] = scope.color.getRGB()[key];
				});
			});
		}
	};
})
.directive("snColorPickerHexField", function() {
	return {
		restrict: "E",
		replace: true,
		require: "^snColorPickerHsl",
		template: '<div class="cp-control hex-field-container" ><label for="cpcode" class="hex-label">{{locale.colorCode}}</label><input id="cpcode" class="hex-field default-focus-outline" ng-model="colorCode" ng-model-options="{ debounce: 500 }" ng-change="setColorFromCode()" ng-blur="setHexFieldValue()"></div>',
		link: function(scope, element) {
			scope.colorCode = scope.color.getColor();

			scope.$watchGroup(["color.r","color.g","color.b","color.a"], function() {
				if (scope.hexFieldChange) {
					scope.hexFieldChange = false;
					return;
				}
				scope.colorCode = scope.color.getColor();
			});

			scope.setHexFieldValue = function() {
				scope.colorCode = scope.color.getColor();
			};

			scope.setColorFromCode = function() {
				scope.hexFieldChange = true;
				scope.color.setColor(scope.colorCode);
				if (scope.hsl) {
					var hsl = scope.color.getHSL();
					["h","s","l","a"].forEach(function(key) {
						scope.hsl[key] = hsl[key];
					});
				}
			};
		}
	};
})
.directive("snColorPickerPallet", function() {
	return {
		restrict: "E",
		replace: true,
		controller: function() {
			//Blank controller to satisfy the require.
		},
		template: '<div id="cpPalletPanel" role="tabpanel" aria-labelledby="cpPalletTab">' +
					'<div class="cp-control-group cp-pallet" role="radiogroup">' +
					'<sn-color-picker-pallet-color ng-repeat="palletColor in options.pallet | limitTo: state.maxPalletColors"></sn-color-picker-pallet-color>' +
					'<sn-color-picker-pallet-toggle ng-if="options.toggle"></sn-color-picker-pallet-toggle>' +
				'</div>' +
		'</div>'
	};
})
.directive("snColorPickerPalletColor", function() {
	return {
		restrict: "E",
		require: "^snColorPickerPallet",
		replace: true,
		template: '<button class="cp-control pallet-color default-focus-outline" ng-style="{\'background-color\': palletColor}" ng-click="selectColor()" ng-class="{\'selected\': selected()}" role="radio" aria-label="{{palletColor}}" aria-checked="{{selected()}}"><span class="icon-check dead-centre selected-color" ng-show="selected()"></span></buton>',
		link: function(scope) {

			scope.selected = function() {
				if (!scope.state.selectedColor || !scope.palletColor)
					return false;

				return scope.state.selectedColor.toLowerCase() === scope.palletColor.toLowerCase();
			};

			scope.selectColor = function() {
				scope.color.setColor(scope.palletColor);
				if (scope.hsl) {
					var hsl = scope.color.getHSL();
					["h","s","l","a"].forEach(function(key) {
						scope.hsl[key] = hsl[key];
					});
				}
			};

			scope.$watchGroup(["color.r","color.g","color.b", "color.a"], function() {
				scope.state.selectedColor = scope.color.rgbHex();
			});
		}
	};
})
.directive("snColorPickerPalletToggle", ["VIEW", function(VIEW) {
	return {
		restrict: "E",
		replace: true,
		template: '<button class="cp-control pallet-toggle" ng-class="{\'to-pallet\': state.view==\'hsl\', \'to-hsl\': state.view==\'pallet\'}"></button>',
		link: function(scope, element) {

			function toggleView() {
				if (scope.state.view == VIEW.HSL)
					scope.action.palletView();
				else
					scope.action.hslView();
			}

			element.on("click", function(event) {
				event.stopPropagation();
				toggleView();
				scope.$apply();
			});

			scope.$watch("state.selectedColor", function() {
				element.css("background-color", scope.color.rgbBaseHue());
			});
		}
	};
}]);
