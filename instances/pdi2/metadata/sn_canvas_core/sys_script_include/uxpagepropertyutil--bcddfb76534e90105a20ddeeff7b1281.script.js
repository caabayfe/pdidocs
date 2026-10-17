var UXPagePropertyUtil = Class.create();

/**!
  * @name UXPagePropertyUtil.get
  * @description Gets the value at path of object. If the resolved value is undefined,
  *  the defaultValue is returned in its place.
  *
  * @param {Object} object The object to query.
  * @param {Array|string} path The path of the property to get.
  * @param {*} [value] The default value returned for `undefined` resolved values.
  * @returns {*} Returns the resolved value.
  *
  */
UXPagePropertyUtil.get = function (object, path, value) {
    var pathArray;
    // If path is not defined or it has false value
    if (!path) return undefined;
    // Check if path is string or array. Regex : ensure that we do not have '.' and brackets
    pathArray = Array.isArray(path) ?
        path :
        path.split(/[,[\].]/g).filter(Boolean);

    // Find value if exist return otherwise return undefined value;
    var pathResult = pathArray.reduce(function (prevObj, key) {
            return prevObj && prevObj[key];
        }, object);
   return pathResult === undefined ?  value : pathResult;
};

/**!
  * @name UXPagePropertyUtil.set
  * @description Add items to an object at a specific path
  *
  * @param  {Object}       obj  The object
  * @param  {String|Array} path The path to assign the value to
  * @param  {*}            val  The value to assign
  */
UXPagePropertyUtil.set = function (obj, path, val) {

    /**
      * If the path is a string, convert it to an array
      * @param  {String|Array} path The path
      * @return {Array}             The path array
      */
    var stringToPath = function (path) {

        // If the path isn't a string, return it
        if (typeof path !== 'string') return path;

        // Create new array
        var output = [];

        // Split to an array with dot notation
        path.split('.').forEach(function (item, index) {

            // Split to an array with bracket notation
            item.split(/\[([^}]+)\]/g).forEach(function (key) {

                // Push to the new array
                if (key.length > 0) {
                    output.push(key);
                }

            });

        });

        return output;

    };

    // Convert the path to an array if not already
    path = stringToPath(path);

    // Cache the path length and current spot in the object
    var length = path.length;
    var current = obj;

    // Loop through the path
    path.forEach(function (key, index) {

        // Check if the assigned key should be an array
        var isArray = key.slice(-2) === '[]';

        // If so, get the true key name by removing the trailing []
        key = isArray ? key.slice(0, -2) : key;

        // If the key should be an array and isn't, create an array
        if (isArray && Object.prototype.toString.call(current[key]) !== '[object Array]') {
            current[key] = [];
        }

        // If this is the last item in the loop, assign the value
        if (index === length - 1) {

            // If it's an array, push the value
            // Otherwise, assign it
            if (isArray) {
                current[key].push(val);
            } else {
                current[key] = val;
            }
        } else { // Otherwise, update the current place in the object

            // If the key doesn't exist, create it
            if (!current[key]) {
                current[key] = {};
            }

            // Update the current place in the object
            current = current[key];

        }

    });

};

/**!
  * @name UXPagePropertyUtil.handleTranslations
  * @description I18N translation support
  *
  * @param  {Object}       property      object for I18N translation handling
  */
UXPagePropertyUtil.handleTranslations = function (property) {
    if (typeof property !== 'object' || !property)
        return;

    Object.keys(property).forEach(function (key) {
        if (property[key].hasOwnProperty("translatable") &&
            property[key].hasOwnProperty("message")) {
            var label = property[key]["message"];
            property[key] = property[key]["translatable"] === true ? gs.getMessage(label) : label;
        }
        if (property[key] !== null &&
            property[key] !== undefined &&
            typeof property[key] === 'object') {
            UXPagePropertyUtil.handleTranslations(property[key]);
        }
    });
};

/**!
 * @name UXPagePropertyUtil.hasRoles
 * @description checks to see if the user has roles. If roles is not an array it will return true
 * 
 * @param {Array.<string>} roles a list of roles to check against the current user.
 * @returns {boolean}
 */
UXPagePropertyUtil.hasRoles = function(roles) {
    if (roles && Array.isArray(roles) && roles.length > 0) {
        var flag = false, i, length;
        for (i = 0, length = roles.length; i < length; i++) {
            if (gs.getUser().hasRole(roles[i])) {
                flag = true;
                break;
            }
        }
        return flag;
    }
    return true;
};

/**!
 * @name UXPagePropertyUtil.isPluginActive
 * @description checks to see if the plugin is active.
 * 
 * @param {string} plugin name of the plugin.
 * @returns {boolean}
 */
UXPagePropertyUtil.isPluginActive = function(plugin) {
    if(plugin && plugin.length > 0)
        return hasPluginActivated = GlidePluginManager.isActive(plugin);
    return true;
};

/**!
  * @name applyConditions
  * @description applyConditions filters newMenu items array based on the conditions
  * 1. if user has write access to the table
  * 2. if user has any of roles , if specified
  * 3. if a plugin, if specified, is active
  * create records for the configured table.
  *
  * @param item
  * @return {boolean|*}
  */
UXPagePropertyUtil.applyConditions = function (item) {
    var hasWriteAccess = true, hasRequiredRoles = true, hasPluginActivated = true;
    var hasCondition = !!UXPagePropertyUtil.get(item, 'item.condition', {});
    if (!hasCondition)
        return true;
    //can create check    
    var hasTableDescription = !!UXPagePropertyUtil.get(item, 'condition.tableDescription', {}),
    table = hasTableDescription ? UXPagePropertyUtil.get(item, 'condition.tableDescription.table', '') : '';

    if (table) {
        hasWriteAccess = new GlideRecord(table).canCreate();
    }

    //plugin check
    var plugin = UXPagePropertyUtil.get(item, 'condition.plugin', "");
    hasPluginActivated = UXPagePropertyUtil.isPluginActive(plugin);

    // Role check
    var requiredRoles = UXPagePropertyUtil.get(item, 'condition.roles', []);
    hasRequiredRoles = UXPagePropertyUtil.hasRoles(requiredRoles);

    return hasWriteAccess && hasRequiredRoles && hasPluginActivated;
};

/**!
  * @name UXPagePropertyUtil.reducePrimary
  * @description The reducePrimary method is a reducer function to compute build "primaryRoute" object data
  * for the toolbar button with configured routeInfo
  *
  * @param retObj
  * @param cur
  * @return {*}
  */
UXPagePropertyUtil.reducePrimary = function (retObj, cur) {
    retObj[UXPagePropertyUtil.get(cur, 'routeInfo.route')] = cur;
    return retObj;
};

/**!
  * @name UXPagePropertyUtil.applyAvailability
  * @description The applyAvailability method checks for the availability conditions for toolbar
  * button configuration
  *
  * @param buttonConfig
  * @return {boolean}
  */
UXPagePropertyUtil.applyAvailability = (buttonConfig) => {
	const rawRoles = UXPagePropertyUtil.get(buttonConfig, 'availability.roles', []);
	const rawPlugin = UXPagePropertyUtil.get(buttonConfig, 'availability.plugin', '');
	
	const hasNonEmptyValuesArray = (obj) => {
		return obj &&
			typeof obj === 'object' &&
			Array.isArray(obj.values) && 
			obj.values.length > 0;
	};

	const rolesDefined = (
		(Array.isArray(rawRoles) && rawRoles.length > 0) ||
		hasNonEmptyValuesArray(rawRoles)
	);

	const pluginDefined = (
		(typeof rawPlugin === 'string' && rawPlugin !== '') ||
		hasNonEmptyValuesArray(rawPlugin)
	);

	const checkRoles = (spec) => {
		if (Array.isArray(spec)) {
			return spec.every(role => gs.hasRole(role));
		}
		if (hasNonEmptyValuesArray(spec)) {
			const operator = spec.operator ? spec.operator.toLowerCase() : 'and';
			
			if (operator === 'and') {
				return spec.values.every(role => gs.hasRole(role));
			} else if (operator === 'or') {
				return spec.values.some(role => gs.hasRole(role));
			}
		}
		gs.warn('Invalid availability object spec for chrome toolbar');
		return false;
	};

	const checkPlugins = (spec) => {
		if (typeof spec === 'string') {
			return UXPagePropertyUtil.isPluginActive(spec);
		}
		if (hasNonEmptyValuesArray(spec)) {
			const operator = spec.operator ? spec.operator.toLowerCase() : 'and';
			
			if (operator === 'and') {
				return spec.values.every(p => UXPagePropertyUtil.isPluginActive(p));
			} else if (operator === 'or') {
				return spec.values.some(p => UXPagePropertyUtil.isPluginActive(p));
			}
		}
		gs.warn('Invalid availability object spec for chrome toolbar');
		return false;
	};

	if (!rolesDefined && !pluginDefined) return true;
	if (rolesDefined && !pluginDefined) return checkRoles(rawRoles);
	if (!rolesDefined && pluginDefined) return checkPlugins(rawPlugin);
	return checkRoles(rawRoles) && checkPlugins(rawPlugin);
 };

/*!
  * @name UXPagePropertyUtil.deepMerge
  * @description Deep merge two or more objects together.
  * @param   {Object}   objects  The objects to merge together
  * @returns {Object}            Merged values of defaults and options
  *
  * example:
  *   const default = {s: 4, d: 15};
  *   const options = {a: 1, d: 55, b: { c: 2, d:3}};
  *   deepMerge(default, options); // {s: 4, d: 55, a: 1, b: { c: 2, d:3}}
  */
UXPagePropertyUtil.deepMerge = function () {

    // Setup merged object
    var newObj = {};

    // Merge the object into the newObj object
    var merge = function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                // If property is an object, merge properties
                if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                    newObj[prop] = UXPagePropertyUtil.deepMerge(newObj[prop], obj[prop]);
                } else {
                    newObj[prop] = obj[prop];
                }
            }
        }
    };

    // Loop through each object and conduct a merge
    for (var i = 0; i < arguments.length; i++) {
        merge(arguments[i]);
    }

    return newObj;

};

/**!
  * @name parse
  * @description Parse the JSON property values
  * @param data
  * @return {{}|any}
  */
UXPagePropertyUtil.parse = function (data) {
    try {
        if (typeof data === 'string') {
            return JSON.parse(data);
        } else {
            return data;
        }

    } catch (e) {
        gs.error('Error parsing value of type JSON', e);
        return {};
    }
};

/**!
 * @name isAuthBinding
 * @description Use duck typing to check if an object is an AUTH_ROUTE_BINDING.
 * 
 * @param {Object} obj 
 * @returns {boolean}
 * 
 * @example
 * // syntax of AUTH_ROUTE_BINDING usage
 * { 
 *   "type": "AUTH_ROUTE_BINDING",
 *   "binding": {
 *     "address": ["logout"],
 *     "default": "/logout.do"
 *   }
 * }
 */
UXPagePropertyUtil.isAuthBinding = function (obj) {
    var hasValidType = obj.hasOwnProperty('type') && obj.type === 'AUTH_ROUTE_BINDING';
    var hasValidBindingAddress = Array.isArray(UXPagePropertyUtil.get(obj, 'binding.address', null));

    return hasValidType && hasValidBindingAddress;
};

/**!
 * @name getRouteFromAuthValue
 * @description Given an authObject convert it into a route value parseable by sn-nav-item.
 * 
 * @param {Object} authObj 
 */
UXPagePropertyUtil.getRouteFromAuthValue = function (authObj, authRoutes) {
    var address = UXPagePropertyUtil.get(authObj, 'binding.address', []);
    var extraParams = UXPagePropertyUtil.get(authObj, 'binding.params', {});
    var defaultValue = UXPagePropertyUtil.get(authObj, 'binding.default', '');
    var resolvedAddress = UXPagePropertyUtil.get(authRoutes, address.join('.'), null);
    var defaultValueRoute = defaultValue;
    var stringifiedProp = Object.prototype.toString.call(defaultValue);     

    // Routes from auth routes will be a route that leads to a page or routes that lead to a viewportModal.
    var resolvedAddressRoute = {};
    
    // Duck type to check if it should be of type viewportModal or route.
    if (resolvedAddress && resolvedAddress.hasOwnProperty('viewportElementId') && resolvedAddress.hasOwnProperty('route')) {
        resolvedAddressRoute = {
            type: 'viewportModal',
            value: UXPagePropertyUtil.deepMerge(extraParams, resolvedAddress)
        };
    } else {
        resolvedAddressRoute = {
            type: 'route',
            value: UXPagePropertyUtil.deepMerge(extraParams, { route: resolvedAddress })
        };
    }
    
    // If default value is a string covert it into an external route
    // If default value is an object convert it into a route use-able by `sn-canvas-router`
    if (stringifiedProp === '[object String]') {
        defaultValueRoute = {
            type: 'external',
            value: { href: defaultValue }
        };
    }
    
    return !resolvedAddress ? defaultValueRoute : resolvedAddressRoute;
};

/**!
 * @name isNil
 * @description Determines if an object is null or undefined.
 * 
 * @param {Object} value 
 */
UXPagePropertyUtil.isNil = function(value) {
    return value === null || value === undefined;
};

/**!
 * @name processUserPreferences
 * @description Process user preference values given _meta syntax.
 * @example
 * 
 *  "_meta":{
 *      "_type":"userPreferences",
 *      "_path":"userPrefName",
 *      "_value":{
 *          "userPrefName":"workspace.showRibbon"
 *      },
 *      "_default":{
 *          "userPrefName":"true"
 *      }
 *  }
 * 
 *  The above meta syntax will be process to be:
 * 
 * {
 *      "label": "Show Ribbon",
 *      "type": "toggle",
 *      "value": {
 *          "userPrefName": "workspace.showRibbon",
 *          "action": {
 *              "name": "USER_PREF_UPDATED",
 *              "payload": {
 *                  "name": "workspace.showRibbon"
 *              }
 *          },
 *          "value": true
 *      }
 *   }
 * 
 * @param {Object} property to process.
 */

UXPagePropertyUtil.processUserPreferences = function (property) {
    var _META = '_meta';
    var _PATH = '_path';
    var _VALUE = '_value';
    var _DEFAULT = '_default';
    var _TYPE = '_type';

    function getMetaValue(property) {
        var metaProperty = property[_META];
        var metaValue = metaProperty[_VALUE];
        var defaultObject = metaProperty[_DEFAULT];
        var path = metaProperty[_PATH];
        UXPagePropertyUtil.set(metaValue, 'action.name', 'USER_PREF_UPDATED');
        UXPagePropertyUtil.set(metaValue, 'action.payload.name', metaValue[path]);
        UXPagePropertyUtil.set(metaValue, 'value', defaultObject[path] === 'true');
        if (!metaValue) {
            gs.info('getMetaValue returning null for ' + JSON.stringify(property));
            metaValue = {};
        }
        return metaValue;
    }
    if (typeof property !== 'object' || !property) return;
    Object.keys(property).forEach(function(key) {
        //gs.info('in foreach ' + key);
        var metaProperties = {};
        if (
            property.hasOwnProperty(_META) &&
            UXPagePropertyUtil.get(property, _META + '.' + _TYPE, '') === 'userPreferences'
        ) {
            metaProperties = getMetaValue(property);
        }
        Object.keys(metaProperties).forEach(function(metaKey) {
            property[metaKey] = metaProperties[metaKey];
        });
        delete property[_META];
        if (
            typeof property[key] === 'object' &&
            property[key] !== undefined &&
            property[key] !== null
        ) {
            UXPagePropertyUtil.processUserPreferences(property[key]);
        }
    });
};

UXPagePropertyUtil.setDefaultOrder = function (item) {
    var order = UXPagePropertyUtil.get(item, 'order');

    if (!item.hasOwnProperty('order') || !Number.isInteger(order)) {
        item.order = 0;
    }

    return item;
};

UXPagePropertyUtil.prototype = {
    initialize: function () { },
    /**!
     * @name processChromeSearchConfig
     * @description By default the searchEnabled config property is in chromeHeader
     * page property (because canvasChrome uses it to conditionally render the search-input
     * slot) while the rest of the search config is in global_search_configurations.
     * 
     * When exposing search configuration to Polaris, it would be helpful to have 
     * all the searchConfiguration in one object.  This function, just looks for
     * the values of searchEnabled in chromeHeader and copies it to the search config.
     * Because chrome_header has route specific properties, we use that same structure
     * in order to capture the different route's searchEnabled property.
     * @param searchConfig
     * @param chromeHeaderConfig
     *
     * @return {{}} searchConfig
     */
    processSearch: function(searchConfig, chromeHeaderConfig){
		var headerConfigForRoute, 
			publicSearchEnabled, 
			privateSearchEnabled,
            processedSearchConfig = {};
		
        if (searchConfig && chromeHeaderConfig){
			
            Object.keys(chromeHeaderConfig).forEach(function(headerKey){
                if (chromeHeaderConfig.hasOwnProperty(headerKey)) {
                    
					headerConfigForRoute = UXPagePropertyUtil.get(chromeHeaderConfig, headerKey, {});
                    publicSearchEnabled = UXPagePropertyUtil.get(headerConfigForRoute, 'publicPage.searchEnabled', false);
                    privateSearchEnabled = UXPagePropertyUtil.get(headerConfigForRoute, 'privatePage.searchEnabled', false);
					
					var newAuthSpecificSearchEnabled = {
                                                       "publicPage": { "searchEnabled": publicSearchEnabled }, 
                                                       "privatePage": { "searchEnabled": privateSearchEnabled }
                                                       };
					var authSpecificSearchConfig = UXPagePropertyUtil.get(searchConfig, headerKey, UXPagePropertyUtil.get(searchConfig, 'global', {}));
					
					var mergedSearchConfig = UXPagePropertyUtil.deepMerge(authSpecificSearchConfig, newAuthSpecificSearchEnabled);
					UXPagePropertyUtil.set(processedSearchConfig, headerKey , mergedSearchConfig);
                }
            });
        }
        return Object.keys(processedSearchConfig).length > 0 ? processedSearchConfig : searchConfig;
    },
    /**!
      * @name processChromeTab
      * @description Processes the chrome_tab property configuration to determine
      *  - primary tab information using the chrome toolbar and
      *  - new tab menu items based on the current user access to create records for the configured table
      *
      * @param chromeToolbar
      * @param chromeTab
      * @param newChromeTabMenuItems
      *
      * @return {{}} chromeTabConfig
      */
    processChromeTab: function (chromeToolbar, chromeTab, newChromeTabMenuItems) {
        const chromeTabExists = chromeTab && typeof chromeTab === 'object';
        var chromeTabConfig = {};
		if(chromeTabExists){
			chromeTabConfig = UXPagePropertyUtil.deepMerge({}, chromeTab);
		}
        
        // chromeToolbar property can't be null
        if (!chromeToolbar || typeof chromeToolbar !== 'object') {
            gs.error("Error: invalid input params:: chromeToolbar = " + chromeToolbar);
            return chromeTabConfig
        }

        // Both chromeTab and newTabMenuItems properties can't be null together
        if ((!chromeTabExists) && !(newChromeTabMenuItems && typeof newChromeTabMenuItems === 'object')) {
            gs.error("Error: invalid input params:: chromeTab = " + chromeTab + " and newTabMenuItems = " + newChromeTabMenuItems);
            return chromeTabConfig;
        }
		
        const keys = chromeTabExists ? Object.keys(chromeTab) : Object.keys(newChromeTabMenuItems);

        // process chrome tab configuration for each global and route specific (if exists)
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var newTabMenu = [];

            // filter chrome tab's new tab menu items based on the current user
            // access to create records for the configured table
            if(chromeTab && chromeTab.hasOwnProperty(key)){
                newTabMenu = UXPagePropertyUtil.get(chromeTab[key], 'newTabMenu', [])
                    .filter(UXPagePropertyUtil.applyConditions)
                    .map(UXPagePropertyUtil.setDefaultOrder);
            }   

            if(newChromeTabMenuItems && newChromeTabMenuItems.hasOwnProperty(key)){
                var newChromeTabMenu = UXPagePropertyUtil.get(newChromeTabMenuItems[key], [])
                .filter(UXPagePropertyUtil.applyConditions)
				.map(UXPagePropertyUtil.setDefaultOrder);
                // When newTabMenu and newChromeTabMenu contain items with the same order value, place newTabMenu items ahead of newChromeTabMenu items.
                newTabMenu = newTabMenu.concat(newChromeTabMenu);
            }

            newTabMenu.sort(function(a, b) {
                return a.order - b.order;
            });
            if(!chromeTabConfig.hasOwnProperty(key)){
                chromeTabConfig[key] = {};
            };
            chromeTabConfig[key]['newTabMenu'] = newTabMenu;

            // update primary tab information using the chrome toolbar and
            chromeTabConfig[key]['primaryRoute'] = chromeToolbar[key]
                .filter(function (btn) {
                    return !!UXPagePropertyUtil.get(btn, 'routeInfo.route');
                })
                .reduce(UXPagePropertyUtil.reducePrimary, {});
        }

        return chromeTabConfig;
    },
    /**!
      * @name processChromeToolbar
      * @description Processes the chrome_toolbar property configuration to determine
      *  - sort the chrome toolbar buttons based on the order property value
      *
      * @param chromeToolbar
      *
      * @return {{}} newChromeToolbar
      */
    processChromeToolbar: function(chromeToolbar) {
        var newChromeToolbar = {},
            i,
            key,
            compareFn = function(a, b) {
                if (a.order < b.order) {
                    return -1;
                }
                if (a.order > b.order) {
                    return 1;
                }
                return 0;
            },
			makeIdLowerCase = function(id) {
				if (typeof id !== 'string') {
					gs.error("Error: id must be string :: id = " + id);
					return id;
				}

				return id.toLowerCase();
			};

        // process chrome tab configuration for each global and route specific (if exists)
        for (i = 0; i < Object.keys(chromeToolbar).length; i++) {
            key = Object.keys(chromeToolbar)[i];
            newChromeToolbar[key] = chromeToolbar[key]
				.filter(UXPagePropertyUtil.applyAvailability)
				.sort(compareFn)
				.map(function(ct) {
                    var toolbarObj = {};
					Object.keys(ct).forEach(function(prop) {
                        if (prop === 'id') {
							toolbarObj[prop] = makeIdLowerCase(ct[prop]);
                        } else {
							toolbarObj[prop] = ct[prop];
						}
					});
					return toolbarObj;
                });
        }
        return newChromeToolbar;
    },
      /**!
     * @name processChromeHeader
     * @description Processes the chrome_header property configuration to update.
     *  - configuration items sensitive to authorization routes
     *  - configuration items that require a certain role
     *
     * @param chromeHeader
     * @param authRoutes
     *
     * @return {{}} chromeHeaderConfig
     */
    processChromeHeader: function (chromeHeader, authRoutes) {
        var newChromeHeader = UXPagePropertyUtil.deepMerge({}, chromeHeader),
            key, 
            i = 0;
        // chromeHeader property can't be null
        if (!chromeHeader && typeof chromeHeader !== 'object') {
            gs.error("Error: invalid input params:: chromeHeader = " + chromeHeader);
        }
        // authRoutes property can't be null
        if (!authRoutes && typeof authRoutes !== 'object') {
            gs.error("Error: invalid input params:: authRoutes = " + authRoutes);
        }
        var filterOutUserRoles = function(property) {
            var hasRole = true;
            if (!Array.isArray(property)) return property;
            return property.filter(function (item) {
                var requiredConditionRoles = UXPagePropertyUtil.get(item, 'condition.roles', []);
                var requiredRoles = UXPagePropertyUtil.get(item, '_roles', []);
                hasRole = (
                    UXPagePropertyUtil.hasRoles(requiredConditionRoles) && UXPagePropertyUtil.hasRoles(requiredRoles)
                );
                return hasRole;
            });
        };
        /**
         * Checks if the the user has the roles to view the link to the UI Builder configuration.
         * There are additional ACL checks on the server side to make sure that the user has access to the page.
         * 
         * @param {Object} property 
         */
        var evaluateScreenLinkConfigurationAgainstRole = function(property) {
            var configurationItems = UXPagePropertyUtil.get(property, 'privatePage.currentScreenLinkConfiguration', {});
            if (configurationItems.roles) {
                if (!UXPagePropertyUtil.hasRoles(configurationItems.roles))
                    property.privatePage.currentScreenLinkConfiguration = {};
                else {
                    delete property.privatePage.currentScreenLinkConfiguration['roles'];
                }
            }
        };
        /**
         * Uses BFS strategy to evaluate the chrome header to contain items based on role, and also resolves
         * any "AUTH_ROUTE_BINDING"(s) along the way.
         * 
         * @param {Object} property
         */       
        var evaluateChromeHeader = function(property) {
            var queue = [property],
                current,
                isObjectOrArray = function(prop) {
                    var stringifiedProp = Object.prototype.toString.call(prop);
                    return stringifiedProp === '[object Object]' || stringifiedProp === '[object Array]';
                };
            while (queue.length > 0) {
                current = queue.shift();
                Object.keys(current).forEach(function (key) {
                    current[key] = filterOutUserRoles(current[key]);
                    if (UXPagePropertyUtil.isAuthBinding(current[key])) {
                        current[key] = UXPagePropertyUtil.getRouteFromAuthValue(current[key], authRoutes.auth_routes);
                    }
                    if (isObjectOrArray(current[key])) {
                        queue.push(current[key]);
                    }
                });
            }
        };
        for (i = 0; i < Object.keys(newChromeHeader).length; i++) {
            key = Object.keys(newChromeHeader)[i];
            evaluateChromeHeader(newChromeHeader[key]);
            evaluateScreenLinkConfigurationAgainstRole(newChromeHeader[key]);
            UXPagePropertyUtil.processUserPreferences(newChromeHeader[key]);
        }
        return newChromeHeader;
    },
    /**!
     * @name processChromeMenu
     * @description Processes the chrome_menu property configuration to filter based on conditions.
     * If an item has a condition property, it shall be an object with this structure: {roles: [], plugin: ''}.
     * If the current user does NOT have one of the roles OR if the plugin is not active, then we remove that item.
     * If no condition property exists, then we always display that item.
     * 
     * @param chromeMenu
     *
     * @return {{}} newChromeMenu
     */
    processChromeMenu: function(chromeMenu) {
        var newChromeMenu = UXPagePropertyUtil.deepMerge({}, chromeMenu),
            chromeMenuKeys = Object.keys(newChromeMenu),
            i,
            routeKey,
            menuItems;
            
        // chromeMenu property can't be null
        if (!chromeMenu && typeof chromeMenu !== 'object') {
            gs.error("Error: invalid input params:: chromeMenu = " + chromeMenu);
        }

        var hasRoleOrIsPluginActive = function(item) {
            var hasPluginActivated = true;
            var hasRequiredRoles = true;
            //plugin check
            var plugin = UXPagePropertyUtil.get(item, 'condition.plugin', "");
            hasPluginActivated = UXPagePropertyUtil.isPluginActive(plugin);

            // Role check
            var requiredRoles = UXPagePropertyUtil.get(item, 'condition.roles', []);
            hasRequiredRoles = UXPagePropertyUtil.hasRoles(requiredRoles);

            return hasPluginActivated && hasRequiredRoles;
        };

        var evaluateMenu = function(menu) {
            var queue = [];
            for (var i = 0; i < menu.length; i++) {
                queue.push(menu[i]);
            }
            while (queue.length > 0) {
                var current = queue.pop();
                var parent = UXPagePropertyUtil.get(current, 'children', {});
                var childItems = UXPagePropertyUtil.get(current,'children.items', []);
                // If no children then continue with other nodes
                if (childItems.length === 0) continue;
                
                var node = childItems.filter(hasRoleOrIsPluginActive);
                parent.items = node;
                for (var k = 0; k < node.length; k++) {
                    queue.push(node[k]);
                }
            }
            return menu;
        };

        for (i = 0; i < chromeMenuKeys.length; i++) {
            routeKey = chromeMenuKeys[i];
            menuItems = newChromeMenu[routeKey].filter(hasRoleOrIsPluginActive);
            newChromeMenu[routeKey] = evaluateMenu(menuItems);
        }
        
        return newChromeMenu;
    },

    type: 'UXPagePropertyUtil'
};
