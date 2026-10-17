var UninstallValidator = Class.create();
UninstallValidator.prototype = {
    initialize: function(scope, pluginId) {
        this.uninstallingScopeId = this._getScopeId(scope);
        this.pluginId = pluginId;
        this.anchorPluginId;
        this.anchorPluginScopeId;
        this.allAppsURL = "sys_store_app.do?sys_id=";
        this.inDevAppsURL = "sys_app.do?sys_id=";
        this.jumboAppPluginURL = "v_plugin.do?sysparm_query=id=";

        this.upstreamDependentJumboAppPlugins = {};
        this.upstreamDependentStoreApps = {};
        this.upstreamDependentInDevApps = {};
        this.upstreamDependentInActiveStoreApps = {};
        this.pluginsToBeRemoved = {};
        this.isUninstallBlocked = false;
        this.isActive = false;

        this.numTables = 0;
        this.numRows = 0;
        this.numFields = 0;
        this.numTablesWithoutScopePrefix = 0;
        this.extensionWarningCount = 0;
        this.fieldWarningCount = 0;
        this.rcSize = 0;

        this.tableDetails = [];
        this.extDetails = [];

        this.uninstallingScopes = [];
        this.scopesProcessed = [];
        this.jumboAppPlugins = [];
    },

    _getScopeId: function(scope) {
        var storeApp = new GlideRecord('sys_store_app');
        storeApp.get(scope);
        if (storeApp.isValidRecord())
            return scope;

        storeApp = new GlideRecord('sys_store_app');
        storeApp.get('scope', scope);
        return storeApp.getUniqueValue();
	},

    canUninstall: function(table) {
        if (!gs.hasRole('admin') && !gs.hasRole('sn_appclient.app_client_user'))
            return false;

        if (sn_jumbo_app.JumboAppAPI.isJumboPlugin(this.pluginId)) {
            if (table == 'v_plugin')
                return sn_jumbo_app.JumboAppAPI.canUninstallPlugin(this.pluginId);
            else if (table == 'sys_store_app' && this._isAnchorPlugin(this.pluginId)) {
                var primaryOfferingId = sn_jumbo_app.JumboAppAPI.getPrimaryOffering(this.uninstallingScopeId);
                return sn_jumbo_app.JumboAppAPI.canUninstallPlugin(primaryOfferingId);
            }

            return false;
        }

        var storeApp = new GlideRecord('sys_store_app');
        storeApp.get(this.uninstallingScopeId);
        var uninstallingScopeName = storeApp.getValue('scope');

        return new ScopeChecker().isStoreApp(uninstallingScopeName) && new GlideAppLoader().canUninstall(uninstallingScopeName, this.pluginId);
    },

    _isAnchorPlugin: function(pluginId) {
        var scopedPlugin = new GlideRecord('sys_scoped_plugin');
        scopedPlugin.addQuery('source', pluginId);
        scopedPlugin.addQuery('parent_plugin', pluginId);
        scopedPlugin.query();
        return scopedPlugin.hasNext();
    },

    validate: function() {
        if (sn_jumbo_app.JumboAppAPI.isJumboPlugin(this.pluginId)) { // uninstall jumbo app scope
            appRecord = new GlideRecord("sys_scoped_plugin");
            appRecord.get("source", this.pluginId);
            this.anchorPluginId = appRecord.getValue("parent_plugin");
            if (!this.anchorPluginId)
                this.anchorPluginId = this.pluginId;
            this.anchorPluginScopeId = sn_jumbo_app.JumboAppAPI.getJumboPluginScope(this.anchorPluginId);
            if (this.anchorPluginScopeId == this.uninstallingScopeId)
                this.uninstallingScopes = sn_jumbo_app.JumboAppAPI.getAllScopesUnderAnchorPlugin(this.anchorPluginId);
            else
                this.uninstallingScopes.push(this.uninstallingScopeId);
            this.jumboAppPlugins = sn_jumbo_app.JumboAppAPI.getAllScopedPluginsWithScopes(this.uninstallingScopes, true);
            this.appName = appRecord.getValue("name");

            this.validateJumboDependencies();
        } else { // uninstall non-jumbo app scope
            appRecord = new GlideRecord("sys_store_app");
            appRecord.get(this.uninstallingScopeId);
            this.uninstallingScopes.push(appRecord.getUniqueValue());
            this.appName = appRecord.getDisplayValue();

            pluginIdToUse = appRecord.getValue("sys_code");
            if (!pluginIdToUse)
                pluginIdToUse = appRecord.getValue("scope");
            this.validateDependencies(this.uninstallingScopeId, pluginIdToUse);
        }
    },

    validateDependencies: function(scopeId, pluginId) {
        var activeDependents = DependencyManager.getActiveImmediateUpstreamDependents(pluginId);
        this.addDependentsToList(activeDependents, this.upstreamDependentStoreApps, this.allAppsURL, "sys_store_app");

        var inactiveDependents = DependencyManager.getInactiveImmediateUpstreamDependents(pluginId);
        this.addDependentsToList(inactiveDependents, this.upstreamDependentInActiveStoreApps, this.allAppsURL, "sys_store_app");

        var devDependents = DependencyManager.getInDevelopmentImmediateUpstreamDependents(pluginId);
        this.addDependentsToList(devDependents, this.upstreamDependentInDevApps, this.inDevAppsURL, "sys_app");

        if (scopeId != "global" && this.scopesProcessed.indexOf(scopeId) == -1) {
            this.updateAppInfo(scopeId);
            this.scopesProcessed.push(scopeId);
        }
    },

    addDependentsToList: function(listToQuery, listToAdd, baseURL, table) {
        var encodedQuery = "sys_codeIN" + listToQuery.join(",") + "^ORscopeIN" + listToQuery.join(",");
        scopeGR = new GlideRecord(table);
        scopeGR.addEncodedQuery(encodedQuery);
        scopeGR.addNotNullQuery('version');
        scopeGR.query();
        while (scopeGR.next()) {
            if ((scopeGR.active || scopeGR.sys_class_name == "sys_app") && !this.isUninstallBlocked)
                this.isUninstallBlocked = true; // if atleast 1 active upstream dependency is found active should block uninstall

            listToAdd[scopeGR.getValue("sys_id") + ''] = {
                "appName": scopeGR.getValue("name"),
                "link": baseURL + scopeGR.getValue("sys_id")
            };
        }
	},

    validateJumboDependencies: function() {
        for (i = 0; i < this.jumboAppPlugins.length; i++) {
            var activeDependents = DependencyManager.getActiveImmediateUpstreamDependents(this.jumboAppPlugins[i]);
            for (j = 0; j < activeDependents.length; j++) {
                var dependentScope = sn_jumbo_app.JumboAppAPI.getJumboPluginScope(activeDependents[j]);
                if (this.uninstallingScopes.indexOf(dependentScope) == -1) {
                    this.isUninstallBlocked = true;
                    this.upstreamDependentJumboAppPlugins[activeDependents[j]] = {
                        "appName": activeDependents[j],
                        "link": this.jumboAppPluginURL + activeDependents[j]
                    };
                }
            }
        }

        if (this.isUninstallBlocked)
            return;

        for (i = 0; i < this.uninstallingScopes.length; i++) {
            this.updateAppInfo(this.uninstallingScopes[i]);
        }

        for (i = 0; i < this.jumboAppPlugins.length; i++) {
            this.pluginsToBeRemoved[this.jumboAppPlugins[i] + ''] = {
                "appName": this.jumboAppPlugins[i],
                "link": this.jumboAppPluginURL + this.jumboAppPlugins[i]
            };
        }
    },

    updateAppInfo: function(scope) {
        var info = new UninstallApplicationInfo(scope);
        this.rcSize += info.getRcSize();
        this.numTables += info.getNumTables();
        this.numRows += info.getNumRowsOfData();
        this.numFields += info.getNumFieldsOnOtherTables();
        this.numTablesWithoutScopePrefix += info.getNumTablesWithoutScopePrefix();
        // unused: var numOtherTables = info.getNumOtherTablesThatHaveFields();
        //Generate and collect field warnings
        this.fieldWarningCount += info.getFieldWarningCount();
        this.addWarningDetail(info, this.tableDetails);
        this.isActive = this.isActive ? this.isActive : info.getActive();

        //Generate and collect extension warnings
        this.extensionWarningCount += info.getExtensionWarningCount();
        this.addWarningDetail(info, this.extDetails);

		if ((Object.keys(this.upstreamDependentInActiveStoreApps).length > 0 || Object.keys(this.upstreamDependentInDevApps).length > 0) && !this.isUninstallBlocked) {
			if (!this.isActive)
				this.isUninstallBlocked = true; // reusing same flag to show error message and block the ui
		}
    },

    addWarningDetail: function(info, detailObject) {
        while (info.wNext()) {
            row = {};
            row['tableName'] = info.getWTableName();
            row['tableURL'] = info.getWTableUrl();
            row['tableLabel'] = info.getWTableLabel();
            row['appScope'] = info.getWAppScope();
            row['appURL'] = info.getWAppUrl();
            row['appName'] = info.getWAppName();
            row['objectName'] = info.getWObjectName();
            row['objectURL'] = info.getWObjectUrl();
            row['objectLabel'] = info.getWObjectLabel();
            detailObject.push(row);
        }
    },

    type: 'UninstallValidator'
};
