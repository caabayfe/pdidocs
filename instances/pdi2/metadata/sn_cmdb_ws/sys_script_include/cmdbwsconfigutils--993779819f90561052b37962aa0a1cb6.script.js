var CmdbWsConfigUtils = Class.create();
CmdbWsConfigUtils.prototype = Object.extendsObject(CmdbWsConfigBase, {

    initialize: function() {},

    getApplicationConfigProp: function(requestObj) {
        var properties = requestObj[this.PARAM_PROPERTIES];
        var appId = requestObj[this.PARAM_APP_ID];
        var configId = requestObj[this.PARAM_CONFIG_ID];

        if (gs.nil(properties) || properties.length === 0) {
            gs.error("Unable to fetch CMDB Workspace Config property - provided Property Name is empty");
            return;
        }
        var result = {};
        // Query for the UX Application (and potentially Config) specific values first
        var propGr;
        if (!gs.nil(appId) || !gs.nil(configId)) {
            propGr = new GlideRecord(this.TABLE_CONFIG_PROP);
            propGr.addQuery(this.COLUMN_CONFIG_PROP_NAME, "IN", properties.join(","));
            if (!gs.nil(appId)) {
                propGr.addQuery(this.COLUMN_CONFIG_TO_APP_ID, appId);
            }
            if (!gs.nil(configId)) {
                propGr.addQuery(this.COLUMN_CONFIG_IDENTIFIER, configId);
            }
            propGr.query();
            while (propGr.next()) {
                result[propGr.getValue(this.COLUMN_CONFIG_PROP_NAME)] = propGr.getValue(this.COLUMN_CONFIG_PROP_VALUE);
            }
            //Check if found all properties
            if (Object.keys(result).length > 0 && Object.keys(result).length === properties.length) {
                return result;
            }
        }

        var remainingProp = properties.filter(function(prop) {
            return !result[prop];
        });

        // If no Application specific value, fall back to the Default configuration
        propGr = new GlideRecord(this.TABLE_CONFIG_PROP);
        propGr.addQuery(this.COLUMN_DEFAULT_CONFIG, 'true');
        propGr.addQuery(this.COLUMN_CONFIG_PROP_NAME, "IN", remainingProp.join(","));
        propGr.query();

        while (propGr.next()) {
            result[propGr.getValue(this.COLUMN_CONFIG_PROP_NAME)] = propGr.getValue(this.COLUMN_CONFIG_PROP_VALUE);
        }
        var propsNotFound = remainingProp.filter(function(prop) {
            return !result[prop];
        });
        if (!gs.nil(propsNotFound) && Object.keys(propsNotFound).length > 0) {
            // No Application or Default found for the property name, raise an error
            gs.error("Failed to locate CMDB Workspace Config property for Prop Name '{0}'", [propsNotFound.join(",")]);
        }
        return result;
    },

    getApplicationConfigTable: function(requestObj) {
        var tableName = requestObj[this.PARAM_TABLE_NAME];
        var appId = requestObj[this.PARAM_APP_ID];
        var configId = requestObj[this.PARAM_CONFIG_ID];
        var orderBy = requestObj[this.PARAM_ORDER_BY];
        var conditions = requestObj[this.PARAM_CONDITIONS]; // eg. [{ name: 'age', operator: '>=', value: '0' }, ... ] 
        var limit = requestObj[this.PARAM_LIMIT];

        if (gs.nil(tableName)) {
            gs.error("Unable to fetch CMDB Workspace Config table configuration - provided Table Name is empty");
            return;
        }
        // Query for the UX Application (and potentially Config) specific values first
        var configTableGr;
        if (!gs.nil(appId) || !gs.nil(configId)) {
            configTableGr = new GlideRecord(tableName);
            configTableGr.addActiveQuery();
            if (!gs.nil(appId)) {
                configTableGr.addQuery(this.COLUMN_CONFIG_TO_APP_ID, appId);
            }
            if (!gs.nil(configId)) {
                configTableGr.addQuery(this.COLUMN_CONFIG_IDENTIFIER, configId);
            }
            if (!gs.nil(conditions) && Array.isArray(conditions) && conditions.length) {
                conditions.forEach(function(query) {
                    configTableGr.addQuery(query.name, query.operator || '=', query.value);
                });
            }

            if (!gs.nil(limit)) {
                configTableGr.setLimit(limit);
            }
            if (!gs.nil(orderBy)) {
                configTableGr.orderBy(orderBy);
            }
            configTableGr.query();
            if (configTableGr.hasNext()) {
                return configTableGr;
            }
        }

        // If no Application specific value, fall back to the Default configuration
        configTableGr = new GlideRecord(tableName);
		configTableGr.addActiveQuery();
        configTableGr.addQuery(this.COLUMN_DEFAULT_CONFIG, 'true');
        if (!gs.nil(conditions) && Array.isArray(conditions) && conditions.length) {
            conditions.forEach(function(query) {
                configTableGr.addQuery(query.name, query.operator || '=', query.value);
            });
        }
        if (!gs.nil(limit)) {
            configTableGr.setLimit(limit);
        }
		if (!gs.nil(orderBy)) {
            configTableGr.orderBy(orderBy);
        }
        configTableGr.query();

        // No Application or Default found for the table name, log an error
        if (!configTableGr.hasNext()) {
            gs.error("Failed to locate CMDB Workspace Config table configuration for Table Name '{0}'", [tableName]);
        }

        return configTableGr;
    },


    /**
     * Retrieves the specified Config Identifier or the one applicable to the Workspace.
     * If the Config Identifier is NOT specified, and there is not applicable Config Identifier
     * for the Workspace, a new record will be created.
     */
    fetchOrCreateConfigIdentifier: function(requestObj) {
        var appId = requestObj[this.PARAM_APP_ID];
        var configId = requestObj[this.PARAM_CONFIG_ID];
        var configIdentifierGr = new GlideRecordSecure(this.TABLE_CONFIG_IDENTIFIER);
        if (!gs.nil(configId)) {
            if (configIdentifierGr.get(configId)) {
                return configId;
            }
            gs.error("Failed to locate Config Identifier for SysId '{0}'", [configId]);
            return null;
        }
        if (gs.nil(appId)) {
            gs.error("Failed to locate Config Identifier due to missing parameter 'appId'");
            return null;
        }
        configIdentifierGr.addQuery(this.COLUMN_CONFIG_APP_ID, appId);
        configIdentifierGr.query();
        if (configIdentifierGr.next()) {
            return configIdentifierGr.getUniqueValue();
        }
        var uxApplicationGr = new GlideRecordSecure('sys_ux_page_registry');
        if (!uxApplicationGr.get(appId)) {
            gs.error("Failed to locate UX Application for appId '{0}'", [appId]);
            return null;
        }
        var defaultConfigName = uxApplicationGr.getValue('title');
        configIdentifierGr.newRecord();
        configIdentifierGr.setValue(this.COLUMN_CONFIG_APP_ID, appId);
        configIdentifierGr.setValue(this.COLUMN_CONFIG_NAME, defaultConfigName);
        var newConfigId = configIdentifierGr.insert();
        var errMessage = configIdentifierGr.getLastErrorMessage();
        if (!gs.nil(errMessage)) {
            gs.getError("Failed insert new Config Identifier for appId '{0}', cause: {1}", [appId, errMessage]);
            return null;
        }
        return newConfigId;
    },
    type: 'CmdbWsConfigUtils'
});
