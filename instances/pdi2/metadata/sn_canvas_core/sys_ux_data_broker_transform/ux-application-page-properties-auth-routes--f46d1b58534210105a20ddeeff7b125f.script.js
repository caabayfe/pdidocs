function transform(input) {
    var result = {},
        k = undefined,
        GLOBAL_KEY = 'global',
        JSON_TYPE = 'json',
        pagePropUtil = new UXPagePropertyUtil(),
        properties,
        authRoutes,
        userPrefs;

    /**!
     * @name getAuthRoutes
     * @description Retrieves the authorization routes defined for the UX application.
     *
     * @param uxAppAuthRoutesGQL
     * @return {{auth_routes: ({}|any)}}
     */
    function getAuthRoutes(uxPageRegistrySysId) {
        var routes = {};
        if (!uxPageRegistrySysId)
            return routes;
        var gr = new GlideRecord('sys_ux_page_registry');
        gr.addQuery('sys_id', uxPageRegistrySysId);
        gr.query();
        if (gr.next()) {
            routes['auth_routes'] = _processAuthRoutes(JSON.parse(gr.getValue('auth_routes')));
        }
        return routes;
    }

    function _processAuthRoutes(routes) {
        var authRoutes = {},
            loginModal = null;

        if (!routes || routes.length === 0)
            return authRoutes;

        for (key in routes) {
            if (key === "loginModalViewport") {
                loginModal = authRoutes['loginModal'] ? authRoutes['loginModal'] : {};
                loginModal['viewportElementId'] = routes['loginModalViewport'];
                authRoutes['loginModal'] = loginModal;
            } else if (key === "loginModalRoute") {
                loginModal = authRoutes['loginModal'] ? authRoutes['loginModal'] : {};
                loginModal['route'] = routes['loginModalRoute'];
                authRoutes['loginModal'] = loginModal;
            } else {
                authRoutes[key] = routes[key];
            }
        }
        return authRoutes;
    }

    /**!
     * @name getProperties
     * @description Retrieves the authorization routes defined for the UX application.
     *
     * @param uxAppPagePropertiesGQL
     */
    function getProperties(uxPageRegistrySysId) {
        var uxPageProperties = {},
            uxPageProperty = undefined,
            routeKey;
        if (!uxPageRegistrySysId)
            return uxPageProperties;
        var properties = new GlideRecord('sys_ux_page_property');
        properties.addQuery('page', uxPageRegistrySysId);
        properties.query();

        // apply transform to process all properties as
        // - "global" if route is empty or null
        // - "route~<fileds_count>" ["home~0"] if route is home
        while (properties.next()) {
			routeKey = getRouteKey(properties);
			uxPageProperty = properties.getValue('name');
			if (uxPageProperties.hasOwnProperty(uxPageProperty)) {
				if (uxPageProperties[uxPageProperty].hasOwnProperty(GLOBAL_KEY) && routeKey === GLOBAL_KEY) {
					//handle property extensions for global
					//for array
					if (Object.prototype.toString.call(uxPageProperties[uxPageProperty][GLOBAL_KEY]) === "[object Array]") {
						uxPageProperties[uxPageProperty][GLOBAL_KEY] = uxPageProperties[uxPageProperty][GLOBAL_KEY].concat(transformProperty(properties)[GLOBAL_KEY]);
					} else if (Object.prototype.toString.call(uxPageProperties[uxPageProperty][GLOBAL_KEY]) === "[object Object]") {
						// for objects
						uxPageProperties[uxPageProperty][GLOBAL_KEY] =
							UXPagePropertyUtil.deepMerge(
							uxPageProperties[uxPageProperty][GLOBAL_KEY],
							transformProperty(properties)[GLOBAL_KEY]
						);
					}

				} else if (uxPageProperties[uxPageProperty].hasOwnProperty(routeKey)) {
					// handle property extensions for route
					// for array
					if (Object.prototype.toString.call(uxPageProperties[uxPageProperty][routeKey]) === "[object Array]") {
						uxPageProperties[uxPageProperty][routeKey] = uxPageProperties[uxPageProperty][routeKey].concat(transformProperty(properties)[routeKey]);
					} else if (Object.prototype.toString.call(uxPageProperties[uxPageProperty][routeKey]) === "[object Object]") {
						// for objects
						uxPageProperties[uxPageProperty][routeKey] =
							UXPagePropertyUtil.deepMerge(
							uxPageProperties[uxPageProperty][routeKey],
							transformProperty(properties)[routeKey]
						);
					}
				} else {
					// handle route property for non-extensions
					uxPageProperties[uxPageProperty][routeKey] = transformProperty(properties)[routeKey];
				}

			} else {
				uxPageProperties[uxPageProperty] = transformProperty(properties);
			}
            
        }

        // merge the global and route property for the configured routes
        for (uxPageProperty in uxPageProperties) {
            if (uxPageProperties.hasOwnProperty(uxPageProperty)) {
                Object.keys(uxPageProperties[uxPageProperty]).forEach(function (routeKey) {
                    if (routeKey !== GLOBAL_KEY) {
                        uxPageProperties[uxPageProperty][routeKey] =
                            UXPagePropertyUtil.deepMerge(
                                uxPageProperties[uxPageProperty][GLOBAL_KEY],
                                uxPageProperties[uxPageProperty][routeKey]
                            );
                    }
                });
            }
        }

        return uxPageProperties;
    }

    /**!
     * @name getRouteKey
     * @description Generates the routeKey for property based on the routes.
     *
     *  example:
     *  - A routeKey for the "home" route will be transformed as
     *   'home~0': {}
     *  - A routeKey for route empty/null will be transformed as
     *    'global': {}
     *
     * @param property
     */
    function getRouteKey(property) {
        var routeRecord = property.route.getRefRecord();
        var route = routeRecord.isValidRecord() ? routeRecord.getValue('route_type') : '';
        var fields = routeRecord.isValidRecord() ? routeRecord.getValue('fields') : '';
        var routeKey = '',
            fieldCount = 0;
        if (route) {
            fieldCount = fields ? fields.split(',').length : 0;
            routeKey = route + '~' + fieldCount;
        } else {
            routeKey = GLOBAL_KEY;
        }
        return routeKey;
    }

    /**!
     * Transform the property to include the route specific information. A property that doesn't have any routes
     *  are termed as "global" and applicable for all routes.
     *
     *  example:
     *  - A property defined for the "home" route will be transformed as
     *   'home~0': {}
     *  - A property without any route will be transformed as
     *    'global': {}
     *
     * @param property
     */
    function transformProperty(property) {
        var value, routeKey, transformed = {};

        // Format the route key if it exist. The route key will be of format `${route_name}~${fieldCount}`
        routeKey = getRouteKey(property);

        // json property type
        if (property.getValue('type') === JSON_TYPE) {
            value = property.value ? JSON.parse(property.getValue('value')) : '{}';
        } else {
            value = property.getValue('value');
        }
        transformed[routeKey] = value;
        return transformed;
    }

    /**
     * Retrieve the authorization routes & properties and build the transform returning result object
     */
    authRoutes = getAuthRoutes(input.uxPageRegistrySysId);
    properties = getProperties(input.uxPageRegistrySysId);
    var chromeTabNewTabMenuItems = 'chrome_tab_new_tab_menu_items';
    var chromeTab = 'chrome_tab';

    // process the specific properties for roles, apply canCreate, primaryTab, etc. data conditions
    for (k in properties) {
        UXPagePropertyUtil.handleTranslations(properties[k]);
        if (properties.hasOwnProperty(k) && k === chromeTab) {
            var newChromeTabMenuItems = null;
            if(properties.hasOwnProperty(chromeTabNewTabMenuItems)){
                newChromeTabMenuItems = properties[chromeTabNewTabMenuItems];
            }
            result[k] = pagePropUtil.processChromeTab(properties['chrome_toolbar'], properties[k], newChromeTabMenuItems);
        } else if (properties.hasOwnProperty(k) && k === 'chrome_header') {
            result[k] = pagePropUtil.processChromeHeader(properties[k], authRoutes);
        } else if (properties.hasOwnProperty(k) && k === 'chrome_toolbar') {
            result[k] = pagePropUtil.processChromeToolbar(properties[k]);
        } else if (properties.hasOwnProperty(k) && k === 'chrome_menu') {
            result[k] = pagePropUtil.processChromeMenu(properties[k]);
        } else if (properties.hasOwnProperty(k) && k === 'global_search_configurations') {
            var headerConfig = {};
            if (properties.hasOwnProperty('chrome_header')){
                headerConfig = properties['chrome_header'];
            }
            result[k] = pagePropUtil.processSearch(properties[k], headerConfig);
        } else if (k === chromeTabNewTabMenuItems && !properties.hasOwnProperty(chromeTab)) {
            result[chromeTab] = pagePropUtil.processChromeTab(properties['chrome_toolbar'], null, properties[k]);
        } else if (k !== chromeTabNewTabMenuItems && properties.hasOwnProperty(k)) {
            result[k] = properties[k];
        }
    }
    // include auth routes
    result['auth_routes'] = authRoutes['auth_routes'];
    
	// include chrome_header's notificationEnabled as a single object for easy exposure to Polaris
    var notificationEnabledValue = UXPagePropertyUtil.get(properties, 'chrome_header.global.privatePage.notificationsEnabled');
	result['chrome_notificationsEnabled'] = { 'global': notificationEnabledValue };

    return result;
}
