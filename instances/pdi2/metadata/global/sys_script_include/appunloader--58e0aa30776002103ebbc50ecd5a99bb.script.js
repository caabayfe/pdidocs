var AppUnloader = Class.create();
AppUnloader.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    addApps: function(appIds, tableName) {
        var appsToAdd = appIds.split(",") || this.getParameter("sysparm_sys_ids").split(",");
        var table = tableName || this.getParameter("sysparm_table");
        var currentUpdateSetSysId = GlideUpdateSet().get();

        if (!this._canInstallOrUpgradeAllApps(appsToAdd, table))
            return false;

        for (var i = 0; i < appsToAdd.length; i++) {
            this._addOrUpdateAppInstallInUpdateSet(appsToAdd[i], table, currentUpdateSetSysId);
        }
        return true;
    },

    validateAppsToAdd: function(appSysIds, table) {
        var appsToAdd = [];
        var appsNotToAdd = [];
        var gr = new GlideRecordSecure(table);
        if (!gr.isValid())
            return {
                "appsToAdd": [],
                "appsNotToAdd": [],
                "error": "Invalid table: " + table
            };

        gr.addQuery("sys_id", "IN", appSysIds);
        gr.query();
        while (gr.next()) {
            var id = (table == "v_plugin") ? gr.getValue("id") : gr.getValue("scope");
            var link = table + ".do?sys_id=" + gr.getUniqueValue();

            if (this._shouldAddApp(gr, id))
                appsToAdd.push({
                    "sys_id": this._getPluginToAdd(gr),
                    "name": gr.getValue("name"),
                    "link": link
                });
            else
                appsNotToAdd.push({
                    "sys_id": gr.getUniqueValue(),
                    "name": gr.getValue("name"),
                    "link": link
                });
        }

        return {
            "appsToAdd": appsToAdd,
            "appsNotToAdd": appsNotToAdd,
            "error": ""
        };
    },

    /**
     * Add app install instruction to update set
     * 
     * @param {string} updateSetSysId
     * @param {string} appOrPluginSysId - sysId of the type of record passed in
     * @returns {object} sysId of the upgrade plan item record if successful, error message if it fails
     */
    addInstallToUpdateSet: function(updateSetSysId, appOrPluginSysId) {
        var response = {
            sysId: null,
            error: null
        };

        if (!this._canAddToUpdateSet(updateSetSysId)) {
            response.error = "Failed canAddToUpdateSet check";
            return response;
        }

        var appGR = this._getRecordFromAppOrPluginSysId(appOrPluginSysId);

        if (!appGR) {
            response.error = "App is invalid";
            return response;
        }

        if (this._isJumboApp(appGR)) {
            response.error = "Jumbo apps not supported";
            return response;
        }

        var tableName = appGR.getTableName();
        var idOrScope = (tableName == "v_plugin") ? appGR.getValue("id") : appGR.getValue("scope");

        if (!this._shouldAddApp(appGR, idOrScope)) {
            response.error = "Failed shouldAddApp check";
            return response;
        }

        if (!this._canInstallOrUpgradeAllApps([appOrPluginSysId], tableName)) {
            response.error = "Failed canInstallOrUpgradeAllApps check";
            return response;
        }

        response.sysId = this._addOrUpdateAppInstallInUpdateSet(appOrPluginSysId, tableName, updateSetSysId);

        return response;
    },

    _canAddToUpdateSet: function(updateSetSysId) {
        var updateSetGR = new GlideRecord("sys_update_set");
        if (!updateSetGR.get(updateSetSysId))
            return false;

        return updateSetGR.getValue("application") == "global" && updateSetGR.getValue("state") == "in progress";
    },

    _getRecordFromAppOrPluginSysId: function(appOrPluginSysId) {
        var sysAppGR = new GlideRecordSecure("sys_app");

        if (sysAppGR.get(appOrPluginSysId))
            return sysAppGR;

        var sysStoreAppGR = new GlideRecordSecure("sys_store_app");

        if (sysStoreAppGR.get(appOrPluginSysId))
            return sysStoreAppGR;

        var vPluginGR = new GlideRecordSecure("v_plugin");

        if (vPluginGR.get(appOrPluginSysId))
            return vPluginGR;

        return null;
    },

    _addOrUpdateAppInstallInUpdateSet: function(appSysId, tableName, updateSetSysId) {
        var gr = new GlideRecordSecure(tableName);

        gr.get(appSysId);
        var type = this._getType(gr);
        var id = this._getId(gr, type, tableName, appSysId);
        var appCustomizationVersion = this._getAppCustomizationVersion(id);
        var additionalParameters = this._getAdditionalParameters(gr);
        var upgradePlanItem = this._getUpgradePlanItemInUpdateSet(id, updateSetSysId);
        var upgradePlanItemSysId = null;

        if (upgradePlanItem) {
            upgradePlanItem.version = gr.getValue("version");
            upgradePlanItem.customization_version = appCustomizationVersion;
            upgradePlanItemSysId = upgradePlanItem.update();
        } else {
            upgradePlanItem = new GlideRecord("sys_upgrade_plan_item");
            upgradePlanItem.initialize();
            upgradePlanItem.type = type;
            upgradePlanItem.id = id;
            upgradePlanItem.scope = gr.getValue("scope");
            upgradePlanItem.name = gr.getValue("name");
            upgradePlanItem.version = gr.getValue("version");
            upgradePlanItem.customization_version = appCustomizationVersion;
            upgradePlanItem.additional_parameters = additionalParameters;
            upgradePlanItemSysId = upgradePlanItem.insert();
            if (upgradePlanItemSysId)
                this._updateTypeOfCustomerUpdateFromUpgradePlanItem(upgradePlanItemSysId, updateSetSysId);
        }
        return upgradePlanItemSysId;
    },

    _canInstallOrUpgradeAllApps: function(appsToAdd, table) {
        for (var i = 0; i < appsToAdd.length; i++) {
            var appSysId = appsToAdd[i];
            var gr = new GlideRecordSecure(table);
            gr.get(appSysId);
            if (!sn_app_api.AppStoreAPI.canInstallOrUpgrade(gr))
                return false;
        }
        return true;
    },

    _shouldAddApp: function(gr, id) {
        if (!sn_app_api.AppStoreAPI.canInstallOrUpgrade(gr))
            return false;

        var table = gr.getTableName();
        if (table == "sys_app")
            return true;

        if (!GlidePluginManager.isActive(id))
            return false;

        var isJumbo = this._isJumboApp(gr);
        if (isJumbo && sn_jumbo_app.JumboAppAPI.isOffering(gr))
            return true;

        if (table == "sys_store_app")
            return true;

        if (!isJumbo) {
            if (GlidePluginManager.isPublished(gr.getUniqueValue()))
                return true;

            var associatedStoreAppGr = new GlideRecord("sys_store_app");
            if (associatedStoreAppGr.get("scope", gr.getUniqueValue()))
                return true;
        }

        return false;
    },

    _getPluginToAdd: function(gr) {
        if (this._isJumboApp(gr))
            return this._getParentPluginFromSource(gr.getUniqueValue());
        else
            return gr.getUniqueValue();
    },

    _getType: function(appGR) {
        if (this._isJumboApp(appGR))
            return "application";

        if (appGR.getTableName() == "sys_app" || (appGR.getTableName() == "sys_store_app" && !appGR.getValue("sys_code")))
            return "application";

        var vPluginGR = new GlideRecordSecure("v_plugin");
        vPluginGR.addQuery("id", appGR.getValue("scope"));
        vPluginGR.query();
        return vPluginGR.next() ? "application" : "plugin";
    },

    _getId: function(gr, type, table, appSysId) {
        if (this._isJumboApp(gr))
            return this._getAppSysIdFromScope(gr.getValue("scope"));
        if (type == "application")
            return (table == "v_plugin") ? this._getAppSysIdFromScope(appSysId) : appSysId;
        return (table == "v_plugin") ? gr.getValue("id") : gr.getValue("sys_code");
    },

    _getAppSysIdFromScope: function(scope) {
        var gr = new GlideRecordSecure("sys_store_app");
        gr.addQuery("scope", scope);
        gr.query();
        gr.next();
        return gr.getUniqueValue();
    },

    _getAppCustomizationVersion: function(appSysId) {
        var appCustomizationGR = new GlideRecordSecure("sys_app_customization");
        appCustomizationGR.addQuery("vendor_app", appSysId);
        appCustomizationGR.query();
        if (!appCustomizationGR.next() || appCustomizationGR.getValue("version") == "none")
            return null;

        return appCustomizationGR.getValue("version");
    },

    _getUpgradePlanItemInUpdateSet: function(id, updateSetSysId) {
        var updateXmlGR = new GlideRecordSecure("sys_update_xml");

        updateXmlGR.addQuery("update_set", updateSetSysId);
        updateXmlGR.addQuery("type", this._getCustomerUpdateType());
        updateXmlGR.query();

        var updateNames = [];
        var upgradePlanItemExists = false;

        while (updateXmlGR.next())
            updateNames.push(updateXmlGR.getValue("name"));

        if (updateNames.length) {
            var upgradePlanItemGR = new GlideRecordSecure("sys_upgrade_plan_item");
            upgradePlanItemGR.addQuery("sys_update_name", "IN", updateNames.toString());
            upgradePlanItemGR.addQuery("id", id);
            upgradePlanItemGR.query();
            upgradePlanItemExists = upgradePlanItemGR.next();
        }

        return upgradePlanItemExists ? upgradePlanItemGR : null;
    },

    _updateTypeOfCustomerUpdateFromUpgradePlanItem: function(upgradePlanItemId, updateSetSysId) {
        var gr = this._getCustomerUpdateFromUpgradePlanItem(upgradePlanItemId);
        if (gr) {
            gr.setValue("type", this._getCustomerUpdateType());
            gr.setValue("update_set", updateSetSysId);
            gr.update();
        }
    },

    _getCustomerUpdateFromUpgradePlanItem: function(upgradePlanItemId) {
        var gr = new GlideRecord("sys_update_xml");
        gr.orderByDesc("sys_recorded_at");
        gr.addQuery("name", "sys_upgrade_plan_item_" + upgradePlanItemId);
        gr.setLimit(1);
        gr.query();
        if (!gr.next())
            return null;
        return gr;
    },

    _getCustomerUpdateType: function() {
        return "App Install";
    },

    _getAdditionalParameters: function(gr) {
        if (this._isJumboApp(gr))
            return sn_jumbo_app.JumboAppAPI.calculateJumboAppAdditionalParameters(gr.getValue("id"));

        return null;
    },

    _isJumboApp: function(gr) {
        if (gr.getTableName() == "v_plugin" && gr.isValidField("type")) {
            var value = gr.getValue("type");
            return value == "implementation_detail" || value == "offering";
        } else if (gr.getTableName() == "sys_store_app" && gr.isValidField("contains_plugins")) {
            return gr.getValue("contains_plugins") == 1;
        } else
            return false;
    },

    _getParentPluginFromSource: function(appId) {
        var scopedPlugin = new GlideRecordSecure("sys_scoped_plugin");
        if (scopedPlugin.get("source", appId))
            return scopedPlugin.getValue("parent_plugin");

        return null;
    },

    type: 'AppUnloader'
});
