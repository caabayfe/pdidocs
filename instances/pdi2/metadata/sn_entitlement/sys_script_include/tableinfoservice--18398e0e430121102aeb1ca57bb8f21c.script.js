var TableInfoService = Class.create();
TableInfoService.prototype = {
    initialize: function(appFamilyInfoService) {
        this.appFamilyInfoService = appFamilyInfoService;
        this.subscriptionHasFamilyDAO = new sn_entitlement.PassThroughCache(new SubscriptionHasFamilyDAO());
        this.TASK_EXTENSIONS = null;
        this.TABLE_CACHE = {};
        this.CUSTOM_TABLE_CACHE = {};
        this.CUSTOM_TABLE_LIST = [];

        this.IGNORED_TABLES = this._getIgnoredTables();

        if (gs.getProperty("sn_entitlement.role_analyzer.use_custom_table_access", "false") === "true") {
            this.readAllCustomTableInfo();
        } else {
            gs.info("role_analyzer.use_custom_table_access is not in use, custom role license_family mapping is limited.");
        }
    },

    /**
     * readAllCustomTableInfo
     * Read and cache information about all custom tables from ua_custom_table_inventory. V2 support only.
     */
    readAllCustomTableInfo: function() {
        var cti = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        cti.query();
        while (cti.next()) {
            var subscriptionId = cti.getValue("subscription_entitlement");
            var applicationFamily = null;
            var applicationFamilies = [];

            if(subscriptionId) {
                applicationFamilies = this.subscriptionHasFamilyDAO.getCustomTableAccessApplicationFamilyForSubscription(subscriptionId);
            }

            // For now we will only set the application family if there is exactly 1. TODO we need to decide how to handle the edge case
            // of mulitple application families.
            if(applicationFamilies.length === 1) {
                applicationFamily = applicationFamilies[0];
            }

            var customTable = {
                isCustom: true,
                mapped: !!subscriptionId,
                sysId: cti.getUniqueValue(),
                subscriptionId: subscriptionId ? subscriptionId : null,
                applicationFamily: applicationFamily
            };

            this.CUSTOM_TABLE_CACHE[cti.getValue("table_name")] = customTable;
        }

        this.CUSTOM_TABLE_LIST = Object.keys(this.CUSTOM_TABLE_CACHE);
        return;
    },

    /**
     * Return the list of tables which are grandfathered in per ua_custom_table_inventory and ua_exempted_table_inventory
     * @returns {array} of table names
     */
    getIgnoredTables: function() {
        return this.IGNORED_TABLES;
    },

    /**
     * getTableInfo
     * Return information about a table in sys_db_object. Any other table like structures (like views) are not
     * covered here.
     * @param {string} tableName Name of table
     * @returns {object} an object with information about the table.
     * The app_id will be one of package name from license_family or scope id or 'platform'
     * The subscriptionAppId which is the subscription to which the table may have been mapped is the same as app_id for now
     */
    getTableInfo: function(tableName) {
        if (Object.prototype.hasOwnProperty.call(this.TABLE_CACHE, tableName)) {
            return this.TABLE_CACHE[tableName];
        }
        var ti = new GlideRecord('sys_db_object');
        ti.addQuery('name', '=', tableName);
        ti.query();
        if (!ti.next()) {
            return null;
        }
            
        var tableInfo = {
            name: tableName,
            sysId: ti.getUniqueValue(),
            isCustom: null,
            isTaskExt: null,
            isRemoteTable: (ti.getValue('scriptable_table') == true),
            appName: null,
            appId: null,
            subscriptionAppId: null,
            appFamilySysId: null,
            scope: ti.sys_scope.scope.toString(),
            package: ti.sys_package.source.toString(),
            source: null,
            customTable: null
        };

        var customTableInfo = this._getCustomTableInfo(tableName);
        tableInfo.isCustom = customTableInfo.isCustom;

        if (tableInfo.isCustom) {
            if (!customTableInfo.applicationFamily) {
                tableInfo.source = "Custom Unknown";
                tableInfo.appId = tableInfo.scope;
                tableInfo.appName = "Unknown";
                tableInfo.subscriptionAppId = tableInfo.scope;
            } else {
                tableInfo.customTable = customTableInfo.sysId;
                tableInfo.source = "Custom Table Access Application Family";
                tableInfo.appId = customTableInfo.applicationFamily.appId;
                tableInfo.appName = customTableInfo.applicationFamily.appName;
                tableInfo.subscriptionAppId = customTableInfo.applicationFamily.appId;
                tableInfo.appFamilySysId = customTableInfo.applicationFamily.appSysId;
            }
        } else {
            var packageInfo = this.appFamilyInfoService.getPackageApp(tableInfo['package'], null);
            tableInfo['appFamilies'] = packageInfo;
            tableInfo['appName'] = packageInfo.name;
            tableInfo['appId'] = packageInfo.id;
            tableInfo['subscriptionAppId'] = packageInfo.id;
            tableInfo['appFamilySysId'] = packageInfo.appSysId;
            tableInfo['source'] = 'App Family';

            if ((gs.nil(tableInfo['appName']) || tableInfo['appId'] == 'unk') && tableInfo['scope'] != 'global') {
                packageInfo = this.appFamilyInfoService.getPackageApp(null, tableInfo['scope']);
                tableInfo['appFamilies'] = packageInfo;
                tableInfo['appName'] = packageInfo.name;
                tableInfo['appId'] = packageInfo.id;
                tableInfo['subscriptionAppId'] = packageInfo.id;
                tableInfo['appFamilySysId'] = packageInfo.appSysId;
                tableInfo['source'] = 'App Family (scope)';
            }

            if ((gs.nil(tableInfo['appName']) || tableInfo['appId'] == 'unk') && tableInfo['scope'] != 'global') {
                tableInfo['appName'] = tableInfo['scope'];
                tableInfo['appId'] = tableInfo['scope'];
                tableInfo['subscriptionAppId'] = tableInfo['scope'];
                tableInfo['appFamilySysId'] = packageInfo.appSysId;
                tableInfo['source'] = 'Scope';
            }

            // special handling for platform
            if ((gs.nil(tableInfo['appName']) || tableInfo['appId'] == 'unk') && tableInfo['scope'] == 'global') {
                if (tableInfo['package'].substring(0, 9) == 'com.glide' || tableInfo['package'].substring(0, 11) == 'apps/system' || tableInfo['package'].substring(0, 8) == 'com.snc.') { //
                    // if we have a known platform package, put it in the platform family
                    tableInfo['appName'] = 'Now Platform';
                    tableInfo['appId'] = 'platform';
                    tableInfo['subscriptionAppId'] = 'platform';
                    tableInfo['source'] = 'Package Name';
                } else if (gs.nil(tableInfo['package']) && tableName.substring(0, 4) == 'sys_') {
                    tableInfo['appName'] = 'Now Platform';
                    tableInfo['appId'] = 'platform';
                    tableInfo['subscriptionAppId'] = 'platform';
                    tableInfo['source'] = 'Table Name';
                }
            }
        }

        tableInfo.isTaskExt = this.isTaskExtension(tableName);
        this.TABLE_CACHE[tableName] = tableInfo;

        return this.TABLE_CACHE[tableName];
    },


    getTableHierarchy: function(baseTable) {
        // TODO unify this
        if (gs.getCurrentScopeName() == 'rhino.global') {
            var result = [];
            var tables = GlideDBObjectManager.get().getHierarchy(baseTable);
            for (var i = 0; i < tables.size(); ++i)
                result.push(tables.get(i));

            return result;
        } else
            return new GlideTableHierarchy(baseTable).getHierarchy();
    },

    getTableAncestors: function(baseTable) {
        // TODO unify this
        var result = [];
        if (gs.getCurrentScopeName() == 'rhino.global') {
            var tables = GlideDBObjectManager.get().getTables(baseTable);
            for (var i = 0; i < tables.size(); ++i)
                result.push(tables.get(i));

            return result;
        } else
            result = new GlideTableHierarchy(baseTable).getTables();
        // remove the first element which is the table itself
        result.slice(1, result.length);
    },

    isTaskExtension: function(tableName) {
        return new global.LicensingScriptUtil().contains(this._getTaskExtensions(), tableName);
    },

    getCustomTableList: function() {
        return this.CUSTOM_TABLE_LIST;
    },

    hasCustomTable: function(tableName) {
        return Object.prototype.hasOwnProperty.call(this.CUSTOM_TABLE_CACHE, tableName);
    },

    _getTaskExtensions: function() {
        if (this.TASK_EXTENSIONS == null)
            this.TASK_EXTENSIONS = this.getTableHierarchy('task');

        return this.TASK_EXTENSIONS;
    },

    _getIgnoredTables: function() {
        var ignoredTables = [];
        var c = new GlideRecord('ua_custom_table_inventory');
        c.addQuery('allotment_type', '=', '2'); // grandfathered
        c.query();
        while (c.next()) {
            ignoredTables.push(c.getValue('table_name'));
        }
        var e = new GlideRecord('ua_exempted_table_inventory');
        e.query();
        while (e.next()) {
            ignoredTables.push(e.getValue('table_name'));
        }
        return ignoredTables;
    },

    _getCustomTableInfo: function(tableName) {
        if (Object.prototype.hasOwnProperty.call(this.CUSTOM_TABLE_CACHE, tableName))
            return this.CUSTOM_TABLE_CACHE[tableName];

        return {
            isCustom: false
        };
    },

    type: 'TableInfoService'
};
