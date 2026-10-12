var LicensingEngineGlobalHelper = Class.create();
LicensingEngineGlobalHelper.prototype = {
    initialize: function() {},
    sleep: function(time) {
        gs.sleep(time);
    },
    /**
     * disable "all" SMv1 app modules for 'com.snc.usage_admin.snc', 'com.snc.usage_admin.base' plugin
     */
    disableAllSMv1Modules: function() {
        var smv1Source = ['com.snc.usage_admin.snc', 'com.snc.usage_admin.base'];
        var addQuery = {
            'sys_package.source': smv1Source
        };
        var setValue = {
            'active': false
        };
        this._updateSMProtectedRecord('sys_app_module', addQuery, setValue);
    },
    /**
     * disable SMv1 "UA License Download" scheduled job in "com.snc.usage_admin.base" plugin
     */
    disableSMv1LicenseDownloadJob: function() {
        var addQuery = {
            'name': 'UA License Download'
        };
        var setValue = {
            "trigger_type": '2' /**Disable */
        };
        this._updateSMProtectedRecord('sys_trigger', addQuery, setValue);
    },
    /**
     * disable all app modules for "sn_sub_man" scoped app
     */
    disableAllSMv2Modules: function() {
        var smv2Source = ['sn_sub_man'];
        var addQuery = {
            'sys_package.source': smv2Source
        };
        var setValue = {
            'active': false
        };
        this._updateSMProtectedRecord('sys_app_module', addQuery, setValue);
    },
    /**
     * disable "Subscription Entitlement Download" scheduled job in "sn_entitlement" scoped app
     */
    disableSMv2EntitlementDownloadJob: function() {
        var addQuery = {
            'name': 'Subscription Entitlement Download'
        };
        var setValue = {
            'active': false
        };
        this._updateSMProtectedRecord('sysauto_script', addQuery, setValue);
    },
    /**
     * enable all app modules for "sn_sub_man" scoped app
     */
    enableAllSMv2Modules: function() {
        var smv2Source = ['sn_sub_man'];
        var addQuery = {
            'sys_package.source': smv2Source
        };
        var setValue = {
            'active': true
        };
        this._updateSMProtectedRecord('sys_app_module', addQuery, setValue);
    },
    /**
     * enable "Subscription Entitlement Download" scheduled job in "sn_entitlement" scoped app
     */
    enableSMv2EntitlementDownloadJob: function() {
        var addQuery = {
            'name': 'Subscription Entitlement Download'
        };
        var setValue = {
            'active': true
        };
        this._updateSMProtectedRecord('sysauto_script', addQuery, setValue);
    },
    /**
     * Internal Only:
     * updates the record(s) that match the query condition.
     * 
     * @param {string} tableName new of the table being updated
     * @param {object} queryParams query condition key:value pairs
     * @param {string} setParams update fields key:value pairs
     */
    _updateSMProtectedRecord: function(tableName, queryParams, setParams) {
        if (LicensingScriptUtil.nil(tableName))
            return;

        var dbQuery = new GlideDBQuery(tableName);
        for (var qField in queryParams) {
            if (Array.isArray(queryParams[qField]))
                dbQuery.addSetQuery(qField, GlideRhinoHelper.getListFromRhino(queryParams[qField]));
            else
                dbQuery.addQuery(qField, queryParams[qField]);
        }

        var dbUpdate = new GlideDBUpdate(tableName);
        dbUpdate.setQuery(dbQuery);
        for (var sField in setParams)
            dbUpdate.setValue(sField, setParams[sField]);

        dbUpdate.executeAndReturnException();
        dbUpdate.close();
        dbQuery.close();
    },
    /**
     * Serializer the input glideRecord.
     */
    serialize: function(glideRecord) {
        return new GlideRecordXMLSerializer().serialize(glideRecord);
    },

    /**
     * create a report that shows app usage for this license by licensed or unlicensed users, grouped by app for last 30 days
     */
    createEntitlementUsageReport: function(entName, entId, assigned) {
        var report = new GlideRecord('sys_report');
        report.initialize();
        var title = entName + " - ";
        if (assigned)
            title += "Allocated";
        else
            title += "Unallocated";

        title += " Usage in the last 30 days";
        var usagePrefix = "usag_";
        report.setValue("title", title);
        report.setValue("table", 'licensed_app_usage'); //query on the db view
        report.setValue("field", usagePrefix + "app_name"); // group by
        report.setValue("other_threshold", "-1"); // show all

        // decide whether we want licensed or unlicensed user report based on the assigned flag
        var entFilter = usagePrefix + "license_idsLIKE" + entId;
        if (!assigned)
            entFilter = usagePrefix + "license_idsNOT LIKE" + entId;

        // use only last 30 days' data
        var timeFilter = usagePrefix + "sys_updated_onONLast 30 days@javascript:gs.daysAgoStart(30)@javascript:gs.daysAgoEnd(0)";

        // consider only records that have at least one fulfiller type count > 0
        var usageFilter = "usag_insert_count>0^ORusag_insert_other_count>0^ORusag_delete_count>0^ORusag_delete_other_count>0^ORusag_update_count>0^ORusag_update_other_count>0";

        // finally add the group by and build the filter
        var filter = entFilter + "^" + timeFilter + "^" + usageFilter + "^EQ^GROUPBY" + usagePrefix + "app_name";

        report.setValue("filter", filter);
        report.setValue("type", "bar");
        report.setValue("aggregate", "COUNT");
        report.setValue("y_axis_title", "Usage Count");

        // restrict viewing to usage_admin role
        report.setValue("user", "GLOBAL");
        report.setValue("roles", "usage_admin");

        // make it read only
        report.setValue("sys_policy", "read");

        report.insert();
    },

    isServiceNowScope: function(scopeName) {
        return new GlideScopeAPI().isServiceNowScope(scopeName);
    },

    /**
     * Update subscription_entitlement reference in ua_custom_table_inventory.
     * If the scope is not global go to the sys_scope (sys_app/sys_store_app) and set the subscription_entitlement field.
     * If the scope is global update in ua_custom_table_inventory.
     *
     * @param {guid} sysId of ua_custom_table_inventory
     * @param {guid} subEntSysId sysId of subscription_entitlement
     * @param {guid} grandfatherSubscriptionEntSysId sysId of subscription_entitlement (Grandfather Subscription, will be only one per customer)
     */
    updateSubscriptionEntitlementReference: function(uaCustTblSysId, subEntSysId, grandfatherSubscriptionEntSysId) {
        var gr = new GlideRecord('ua_custom_table_inventory');
        gr.addQuery('sys_id', uaCustTblSysId);
        gr.query();
        if (!gr.next()) {
            this._logger.logInfo(this.type, "updateSubscriptionEntitlementReference", 'Record not found to update: ' + uaCustTblSysId);
            return;
        }

        var scope = gr.getElement('table_ref.sys_scope.scope');

        // If a table is already mapped to a Grandfather license, update the subscription to Grandfather instead of mapping it with the Application's subscription
        if (gr.getValue('allotment_type') == '2') {
            gr.setWorkflow(false);
            gr.setValue('subscription_entitlement', grandfatherSubscriptionEntSysId);
        } else if (scope == 'global') {
            gr.setValue('subscription_entitlement', subEntSysId);
        } else {
            var sysId = gr.getElement('table_ref.sys_scope.sys_id');
            var sysClassName = gr.getElement('table_ref.sys_scope.sys_class_name');

            if (sysClassName == 'sys_store_app') {
                var dbQuery = new GlideDBQuery(sysClassName); // sysClassName = sys_app/sys_store_app
                dbQuery.addQuery('sys_id', sysId);

                var dbUpdate = new GlideDBUpdate(sysClassName);
                dbUpdate.setQuery(dbQuery);
                dbUpdate.setValue('subscription_entitlement', subEntSysId);

                dbUpdate.executeAndReturnException();
                dbUpdate.close();
                dbQuery.close();

                var grCTI = new GlideRecord('ua_custom_table_inventory');
                grCTI.addQuery('table_ref.sys_scope', sysId);
                grCTI.query();
                while (grCTI.next()) {
                    grCTI.setValue('subscription_entitlement', subEntSysId);
                    grCTI.update();
                }
            } else {
                var sysScopeGR = new GlideRecord(sysClassName); // sysClassName = sys_app/sys_store_app
                sysScopeGR.addQuery('sys_id', sysId);
                sysScopeGR.query();

                if (sysScopeGR.next()) {
                    sysScopeGR.setValue('subscription_entitlement', subEntSysId);
                    sysScopeGR.update();
                }
            }
        }
        gr.update();
    },

    /**
     * Gets current app scope for the current session
     *
     * @return property value
     */
    getGlideSessionScopeProperty: function() {
        return gs.getSession().getProperty("apps.current_app");
    },

    compressToBytes: function(orignal) {
        var compressed = global.GlideCompressionUtil.compress(orignal);
        var encodeed = global.GlideStringUtil.base64Encode(compressed);
        return encodeed;
    },

    expandToString: function(compressed) {
        var decoded = global.GlideStringUtil.base64DecodeAsBytes(compressed);
        var expanded = global.GlideCompressionUtil.expandToString(decoded);
        return expanded;
    },

    getTransformedEntitlementList: function(entitlementExtractionSchema, expandedPayload) {
        var encdataByteArray = new Packages.java.io.ByteArrayInputStream(new Packages.java.lang.String(expandedPayload).getBytes());
        var extractor = new sn_lef.JsonRecordExtractor(entitlementExtractionSchema, encdataByteArray);
        var result = [];
        while (extractor.hasNext()) {
            result.push(extractor.next());
        }
        return result;
    },

    /**
     * Helper function to clear records from licensable_app
     * clears all the apps mapped to a given family
     *
     * @param familyID unique id FAMILY_ID/LINEAGE_ID
     * @param familyName FAMILY_NAME/LINEAGE_NAME
     */
    clearLicensableAppRecords: function(familyID, familyName) {
        if (LicensingScriptUtil.nil(familyID) || LicensingScriptUtil.nil(familyName))
            return;

        var licensableAppGR = new GlideRecord("licensable_app");
        licensableAppGR.addQuery("app_family_id.lineage_id", familyID);
        licensableAppGR.addQuery("app_family_id.lineage_name", familyName);
        licensableAppGR.query();
        if (licensableAppGR.getRowCount() > 0)
            licensableAppGR.deleteMultiple();
    },

    triggerLicensingEngineJob: function() {
        var gr = new GlideRecord("sys_trigger");
        gr.addQuery("document_key", "aa68c404ffff2110d185612a453bf175");
        gr.query();
        if (gr.next()) {
            // state check is not required. 
            // If state is running, we still want to re-run it to make sure all data is refresh.
            gr.setValue("next_action", new GlideDateTime());
            gr.update();
        }
    },

    addExtraField: function(gr, fieldName) {
        gr.addExtraField(fieldName);
    },

    hasAttachments: function(current) {
        return current.hasAttachments();
    },

    processLicensingStatsDefn: function(payload) {
        // workaround for Y. instances
        // Z.+ should have this fixed in the Glide code
        preProcessTableStatsDefn(payload);

        SNC.UsageAnalyticsScriptUtils.processLicensingStatsDefn(payload);

        function preProcessTableStatsDefn(payload) {
            var defns = JSON.parse(payload);
            if (global.LicensingScriptUtil.isEmpty(defns) || !Array.isArray(defns))
                return;
            var definitionIds = [];
            for (var i = 0; i < defns.length; i++) {
                var defn = defns[i];
                if (defn.count_type == "Usage")
                    definitionIds.push(defn.definition_id);
            }
            if (definitionIds.length == 0)
                return;

            gs.info("Deleting ua_stats_defn defintion ids " + definitionIds);
            var gr = new GlideRecord("ua_stats_defn");
            gr.addQuery("definition_id", "IN", definitionIds.join(","));
            gr.query();
            gr.deleteMultiple();
        }
    },

    correctCTIReferenceAndDelete: function(subEntSysIdToRemove, subEntSysId, licCustGr, allotmentType) {
        var uaCustTblGr = new GlideRecord('ua_custom_table_inventory');
        uaCustTblGr.addQuery('subscription_entitlement', subEntSysIdToRemove);
        uaCustTblGr.query();
        uaCustTblGr.setWorkflow(false);

        while (uaCustTblGr.next()) {
            // Check the table scope is Global or non-Global (sys_app or sys_store_app)
            var scope = uaCustTblGr.getElement('table_ref.sys_scope.scope');

            if (scope == 'global') {
                uaCustTblGr.setValue('subscription_entitlement', subEntSysId);
                uaCustTblGr.setValue('allotment_type', allotmentType);
                uaCustTblGr.update();
            } else {
                var sysId = uaCustTblGr.getElement('table_ref.sys_scope.sys_id');
                var sysClassName = uaCustTblGr.getElement('table_ref.sys_scope.sys_class_name');

                if (sysClassName == 'sys_store_app') {
                    var dbQuery = new GlideDBQuery(sysClassName); // sysClassName = sys_app/sys_store_app
                    dbQuery.addQuery('sys_id', sysId);

                    var dbUpdate = new GlideDBUpdate(sysClassName);
                    dbUpdate.setQuery(dbQuery);
                    dbUpdate.setValue('subscription_entitlement', subEntSysId);

                    dbUpdate.executeAndReturnException();
                    dbUpdate.close();
                    dbQuery.close();
                } else {
                    var sysScopeGR = new GlideRecord(sysClassName); // sysClassName = sys_app/sys_store_app
                    sysScopeGR.addQuery('sys_id', sysId);
                    sysScopeGR.query();
                    sysScopeGR.setWorkflow(false);

                    if (sysScopeGR.next()) {
                        sysScopeGR.setValue('subscription_entitlement', subEntSysId);
                        sysScopeGR.update();
                    }
                }

                var ctiGr = new GlideRecord('ua_custom_table_inventory');
                ctiGr.addQuery('table_ref.sys_scope', sysId);
                ctiGr.query();
                ctiGr.setWorkflow(false);

                while (ctiGr.next()) {
                    ctiGr.setValue('subscription_entitlement', subEntSysId);
                    ctiGr.setValue('allotment_type', allotmentType);
                    ctiGr.update();
                }
            }
        }

        licCustGr.deleteRecord();
    },

    deleteGR: function(gr, isDeleteMultiple) {
        if (isDeleteMultiple)
            gr.deleteMultiple();
        else {
            if (gr.next())
                gr.deleteRecord();
        }
    },

    /**
     * 
     * @param {String} name of the table
     * @returns Array{String} list of tables in the heirarchy
     * Example, given "incident" this will return incident, task
     */
    getExtendedTables: function(tableName) {
        return Array.from(GlideDBObjectManager.getTables(tableName));
    },

    reloadEntitledCustomTables: function() {
        SNC.UACTScriptUtils.reloadEntitledCustomTbls();
    },

    type: 'LicensingEngineGlobalHelper'
};
