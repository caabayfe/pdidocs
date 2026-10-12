var ChromeToolbarUtil = Class.create();

ChromeToolbarUtil.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

    /**!
     * @name getChromeToolbar
     * @description AJAX function. Called client-side via xmlhttp.do;
     * reads sysparm_ux_page_registry_sys_id from the request and returns
     * the processed chrome_toolbar as a JSON string (AbstractAjaxProcessor
     * writes the return value as the XML answer automatically).
     *
     * @returns {string} JSON-serialised chrome_toolbar object keyed by route key
     */
    getChromeToolbar: function() {
        var sysId = this.getParameter('sysparm_ux_page_registry_sys_id');
        return JSON.stringify(this._getChromeToolbar(sysId));
    },

    _getChromeToolbar: function(uxPageRegistrySysId) {
        var properties = this._getProperties(uxPageRegistrySysId);
        var chromeToolbar = properties['chrome_toolbar'];
        if (!chromeToolbar) {
            gs.warn('ChromeToolbarUtil: no chrome_toolbar property found for page ' + uxPageRegistrySysId);
            return {};
        }
        return new UXPagePropertyUtil().processChromeToolbar(chromeToolbar);
    },


    // -------------------------------------------------------------------------
    // Property fetching (adapted from the UX Application Page Properties transform)
    // -------------------------------------------------------------------------

    /**!
     * @name _getProperties
     * @description Queries sys_ux_page_property for the given page registry sys_id,
     * builds a map of { propertyName: { routeKey: value } }, and merges global values
     * into each route-specific entry.  Only chrome_toolbar records are processed but
     * the full loop is preserved so the shape matches the original transform exactly.
     *
     * @param {string} uxPageRegistrySysId
     * @returns {Object}
     */
    _getProperties: function(uxPageRegistrySysId) {
        var GLOBAL_KEY = 'global';
        var JSON_TYPE = 'json';
        var uxPageProperties = {};

        if (!uxPageRegistrySysId)
            return uxPageProperties;

        var properties = new GlideRecord('sys_ux_page_property');
        properties.addQuery('page', uxPageRegistrySysId);
        properties.addQuery('name', 'chrome_toolbar');
        properties.query();

        while (properties.next()) {
            var routeKey = this._getRouteKey(properties, GLOBAL_KEY);
            var uxPageProperty = properties.getValue('name');
            var transformed = this._transformProperty(properties, routeKey, JSON_TYPE);

            if (uxPageProperties.hasOwnProperty(uxPageProperty)) {
                if (uxPageProperties[uxPageProperty].hasOwnProperty(GLOBAL_KEY) && routeKey === GLOBAL_KEY) {
                    if (Object.prototype.toString.call(uxPageProperties[uxPageProperty][GLOBAL_KEY]) === '[object Array]') {
                        uxPageProperties[uxPageProperty][GLOBAL_KEY] =
                            uxPageProperties[uxPageProperty][GLOBAL_KEY].concat(transformed[GLOBAL_KEY]);
                    } else if (Object.prototype.toString.call(uxPageProperties[uxPageProperty][GLOBAL_KEY]) === '[object Object]') {
                        uxPageProperties[uxPageProperty][GLOBAL_KEY] =
                            UXPagePropertyUtil.deepMerge(uxPageProperties[uxPageProperty][GLOBAL_KEY], transformed[GLOBAL_KEY]);
                    }
                } else if (uxPageProperties[uxPageProperty].hasOwnProperty(routeKey)) {
                    if (Object.prototype.toString.call(uxPageProperties[uxPageProperty][routeKey]) === '[object Array]') {
                        uxPageProperties[uxPageProperty][routeKey] =
                            uxPageProperties[uxPageProperty][routeKey].concat(transformed[routeKey]);
                    } else if (Object.prototype.toString.call(uxPageProperties[uxPageProperty][routeKey]) === '[object Object]') {
                        uxPageProperties[uxPageProperty][routeKey] =
                            UXPagePropertyUtil.deepMerge(uxPageProperties[uxPageProperty][routeKey], transformed[routeKey]);
                    }
                } else {
                    uxPageProperties[uxPageProperty][routeKey] = transformed[routeKey];
                }
            } else {
                uxPageProperties[uxPageProperty] = transformed;
            }
        }

        // Merge global into each route-specific entry
        for (var propName in uxPageProperties) {
            if (uxPageProperties.hasOwnProperty(propName)) {
                var prop = uxPageProperties[propName];
                Object.keys(prop).forEach(function(rKey) {
                    if (rKey !== GLOBAL_KEY) {
                        prop[rKey] = UXPagePropertyUtil.deepMerge(prop[GLOBAL_KEY], prop[rKey]);
                    }
                });
            }
        }
        return uxPageProperties;
    },

    /**!
     * @name _getRouteKey
     * @description Generates the routeKey for a sys_ux_page_property GlideRecord row.
     * Format: "<route_type>~<field_count>" or "global" when no route is set.
     *
     * @param {GlideRecord} property
     * @param {string} GLOBAL_KEY
     * @returns {string}
     */
    _getRouteKey: function(property, GLOBAL_KEY) {
        var routeRecord = property.route.getRefRecord();
        var route = routeRecord.isValidRecord() ? routeRecord.getValue('route_type') : '';
        var fields = routeRecord.isValidRecord() ? routeRecord.getValue('fields') : '';
        if (route) {
            var fieldCount = fields ? fields.split(',').length : 0;
            return route + '~' + fieldCount;
        }
        return GLOBAL_KEY;
    },

    /**!
     * @name _transformProperty
     * @description Reads the value of a sys_ux_page_property record and wraps it
     * under its routeKey.  JSON-typed properties are parsed.
     *
     * @param {GlideRecord} property
     * @param {string} routeKey
     * @param {string} JSON_TYPE
     * @returns {Object}
     */
    _transformProperty: function(property, routeKey, JSON_TYPE) {
        var value;
        var transformed = {};
        if (property.getValue('type') === JSON_TYPE) {
            value = property.value ? JSON.parse(property.getValue('value')) : {};
        } else {
            value = property.getValue('value');
        }
        transformed[routeKey] = value;
        return transformed;
    },

    type: 'ChromeToolbarUtil'
});
