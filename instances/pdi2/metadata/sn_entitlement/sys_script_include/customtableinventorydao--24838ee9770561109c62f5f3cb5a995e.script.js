var CustomTableInventoryDAO = Class.create();
CustomTableInventoryDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.loggingEnabled = this.logger.isEntitlementLoggingEnabled();
    },

    // returns true if table is present in CTI and allotment type is not grandfather
    isLicensableCustomTable: function(tableName) {
        var ctiGR = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        if (ctiGR.isValid() && ctiGR.isValidField(LicensingEngineDBConstants.TABLE_NAME)) {
            ctiGR.addQuery(LicensingEngineDBConstants.TABLE_NAME, tableName);
            ctiGR.query();
            if (ctiGR.next()) {
                if (LicensingEngineDBConstants.ALLOTMENT_TYPE_GRANDFATHER != ctiGR.getValue(LicensingEngineDBConstants.ALLOTMENT_TYPE))
                    return true;
            }
        }
        return false;
    },

    // returns sys_id of the active subscription associated with the given custom table
    getActiveSubscriptionSysId: function(tableName) {
        var ctiGR = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        // As part of EPIC1061693, a new field called 'subscription_entitlement' has been added to the ua_custom_table_inventory which serves as the reference
        // of subscription_entitlement table, thus using the field 'subscription_entitlement' to get the associated subscription_entitlement record
        if (ctiGR.isValid() && ctiGR.isValidField(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT) && ctiGR.isValidField(LicensingEngineDBConstants.TABLE_NAME)) {
            ctiGR.addQuery(LicensingEngineDBConstants.TABLE_NAME, tableName);
            var subscriptionStatusField = LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.STATUS);
            ctiGR.addQuery(subscriptionStatusField, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
            ctiGR.query();

            if (ctiGR.next())
                return ctiGR.getValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);

            if (this.logger.isEntitlementLoggingEnabled()) {
                const conditionsString = LicensingEngineDBConstants.TABLE_NAME.concat(LicensingEngineConstants.COMMA).concat(tableName).concat(LicensingEngineConstants.COMMA)
                    .concat(subscriptionStatusField).concat(LicensingEngineConstants.COMMA).concat(LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK.join());
                this.logger.logRecordDoesNotExists(LicensingEngineConstants.CUSTOM_TABLE_INVENTORY_DAO, LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY, conditionsString);
            }
        }
        return null;
    },

    /**
     * @returns Array{objects} returns array of objects with sys_id of UA Unmapped custom table records in global scope and no subscription attached
     */
    getUnmappedGlobalCustomTables: function() {
        const ctiGR = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        ctiGR.addQuery(LicensingEngineDBConstants.TABLE_REF_DOT_SYS_SCOPE, LicensingEngineDBConstants.GLOBAL_SCOPE);
        ctiGR.addNullQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        ctiGR.query();
        const result = [];
        while (ctiGR.next()) {
            result.push({
                'custom_table_inventory_sys_id': ctiGR.getUniqueValue(),
                'table_sys_db_object_id': ctiGR.table_ref.toString(),
                'table_name': ctiGR.table_ref.name.toString()
            });
        }
        return result;
    },

    /**
     * @returns Array{objects} returns array of unmapped custom applications
     */
    getUnmappedCustomApplicationDetails: function() {
        const ctiGR = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        ctiGR.addNotNullQuery(LicensingEngineDBConstants.APP_NAME);
        ctiGR.addNotNullQuery(LicensingEngineDBConstants.TABLE_REF);
        ctiGR.addNullQuery(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT);
        ctiGR.addNullQuery(LicensingEngineDBConstants.TABLE_REF_DOT_SYS_SCOPE_DOT_SUBSCRIPTION_ENTITLEMENT);
        ctiGR.addQuery(LicensingEngineDBConstants.TABLE_REF_DOT_SYS_SCOPE, '!=', LicensingEngineDBConstants.GLOBAL_SCOPE);
        ctiGR.query();
        const result = {};
        while (ctiGR.next()) {
            const scope_sys_id = ctiGR.table_ref.sys_scope.sys_id.toString();
            if (!result.hasOwnProperty(scope_sys_id)) {
                result[scope_sys_id] = [];
            }
            const table_name = ctiGR.table_ref.name.toString();
            result[scope_sys_id].push(table_name);
        }
        return result;
    },

    /**
     *
     * @returns {string} returns the subscription_entitlement details for given table
     */
    getSubscriptionIdByTableName: function(tableName) {
        const ctiGR = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        ctiGR.addQuery(LicensingEngineDBConstants.TABLE_REF_DOT_NAME, tableName);
        ctiGR.query();
        if (ctiGR.next()) {
            return ctiGR.subscription_entitlement.sys_id.toString();
        }
    },

    /**
     *
     * @param {guid} subEntSysId The subscription_entitlement.sys_id to retrieve allocated tables count
     * @returns {number} returns the aggregated table count for the given subscription_entitlement record
     */
    getAllocatedTableCount: function(subEntSysId) {
        const ctiGA = new GlideAggregate(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        if (ctiGA.isValid() && !ctiGA.isValidField(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT))
            return 0;

        const subscriptionEntPrefix = LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT.concat(LicensingEngineConstants.DOT);

        const subscriptionStatusField = subscriptionEntPrefix.concat(LicensingEngineDBConstants.STATUS);
        ctiGA.addQuery(subscriptionStatusField, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);

        const subscriptionEntSysIdField = subscriptionEntPrefix.concat(LicensingEngineDBConstants.SYS_ID);
        ctiGA.addQuery(subscriptionEntSysIdField, subEntSysId);

        ctiGA.addAggregate('COUNT');
        ctiGA.query();

        if (ctiGA.next()) {
            const count = parseInt(ctiGA.getAggregate('COUNT'));
            return !Number.isInteger(count) ? 0 : Number(count);
        }

        return 0;
    },

    /**
     * Used in data migration for mapping license_details reference to subscription_entitlement
     * Multiple tables can be mapped to a single subscription, mapping product code to list of custom tables
     * Load all product_code from ua_custom_table_inventory.license for global scope and for scope which is not global get from table_ref.sys_scope.license
     *
     * @returns {object} returns the product_code to list of custom tables map
     */
    getLicenseProductCodeToCustTblListMap: function() {
        const productCodeToCustTblListObj = {};
        const ctiGR = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        ctiGR.addNotNullQuery(LicensingEngineDBConstants.LICENSE);
        ctiGR.addNotNullQuery(LicensingEngineDBConstants.TABLE_REF_DOT_NAME).addOrCondition(LicensingEngineDBConstants.ALLOTMENT_TYPE, "=", LicensingEngineDBConstants.ALLOTMENT_TYPE_GRANDFATHER);
        ctiGR.query();

        while (ctiGR.next()) {
            let licenseSysId = ctiGR.getValue(LicensingEngineDBConstants.LICENSE);
            let productCode = ctiGR.getElement(LicensingEngineDBConstants.LICENSE.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.PRODUCT_CODE));
            if (global.LicensingScriptUtil.nil(productCode)) // In case!!!
                continue;

            let custTbl = {
                'uaCustTblSysId': ctiGR.getUniqueValue(),
                'licenseSysId': licenseSysId
            };
            if (productCode in productCodeToCustTblListObj) {
                productCodeToCustTblListObj[productCode].push(custTbl);
            } else {
                productCodeToCustTblListObj[productCode] = [];
                productCodeToCustTblListObj[productCode].push(custTbl);
            }
        }
        return productCodeToCustTblListObj;
    },

    /**
     * Updates a ua_custom_table_inventory record's subscription_entitlement field
     *
     * @param {guid} productId - the subscription_entitlement sys_id to set the reference field to
     * @param {guid} customTableId - the sys_id of the ua_custom_table_inventory record to update
     * @returns {guid} the sys_id of the udpated record or null
     */
    updateSubscriptionValueBySysId: function(productId, customTableId) {
        const gr = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        if (!gr.get(customTableId))
            return null;

        gr.setValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT, productId);
        return gr.update();
    },

    /**
     * Used in custom table inventory cleanup job
     * @param {Object} "ua_exempted_oob_table" DAO object
     * @returns {Object} map of oob table name to sys id
     */

    getOOBTablesToCleanup: function(exemptedOOBTableDAO) {
        const oobTableNameSysIdMap = new Map();
        const gr = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        gr.addNotNullQuery(LicensingEngineDBConstants.TABLE_REF_ID);
        gr.query();
        while (gr.next()) {
            const tableName = gr.getValue(LicensingEngineDBConstants.TABLE_NAME);
            const tableRefId = gr.getValue(LicensingEngineDBConstants.TABLE_REF_ID);
            const appScope = gr.getValue(LicensingEngineDBConstants.APP_SCOPE);
            if (exemptedOOBTableDAO.isTableToExempt(tableName, appScope, true))
                oobTableNameSysIdMap.set(tableName, tableRefId);
        }
        return oobTableNameSysIdMap;
    },

    /**
     * @param {String} name of the table
     * @param {guid} sys id of the table
     * @param {Object} license_cust_table_allotment DAO
     * @param {Object} sys_db_object DAO
     * @returns {Object} details of the CTI record
     * {'table_name'} == name of the table
     * {'table_ref'} == sys id of the table (sys_db_object)
     * {'table_created_on'} == sys_created_on value of the table
     * {'app_scope'} == app scope of the table
     * {'app_name'} == name of the application
     * {'subscription_entitlement'} == subscription mapped to table if any
     * {'allotment_type'} == allotment type of subscription mapped
     */
    getCtiObject: function(tableName, tableRefId, licenseCustTableAllotmentDAO, sysDbObjectDAO) {
        const scopeObj = sysDbObjectDAO.getScopeDetailsByTable(tableName);
        const subscriptionSysId = scopeObj[LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT];
        const allotmentType = licenseCustTableAllotmentDAO.getAllotmentTypeBySubscriptionSysId(subscriptionSysId);

        const ctiObject = {};
        ctiObject[LicensingEngineDBConstants.TABLE_NAME] = tableName;
        ctiObject[LicensingEngineDBConstants.TABLE_REF] = tableRefId;
        ctiObject[LicensingEngineDBConstants.TABLE_CREATED_ON] = scopeObj[LicensingEngineDBConstants.SYS_CREATED_ON];
        ctiObject[LicensingEngineDBConstants.APP_SCOPE] = scopeObj[LicensingEngineDBConstants.SCOPE];
        ctiObject[LicensingEngineDBConstants.APP_NAME] = scopeObj[LicensingEngineDBConstants.NAME];
        ctiObject[LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT] = subscriptionSysId;
        ctiObject[LicensingEngineDBConstants.ALLOTMENT_TYPE] = allotmentType;

        return ctiObject;
    },

    /**
     * @param {Object} CTI record object with field,value
     * @retuens {Object} error object if any
     */
    insertCustomTableInventoryRecord: function(ctiObject) {
        const tableName = ctiObject[LicensingEngineDBConstants.TABLE_NAME];
        const tableSysId = ctiObject[LicensingEngineDBConstants.TABLE_REF];
        const tableCreatedOn = ctiObject[LicensingEngineDBConstants.TABLE_CREATED_ON];
        const applicationName = ctiObject[LicensingEngineDBConstants.APP_NAME];
        const applicationScope = ctiObject[LicensingEngineDBConstants.APP_SCOPE];
        const subscriptionSysId = ctiObject[LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT];
        const allotmentType = ctiObject[LicensingEngineDBConstants.ALLOTMENT_TYPE];

        const gr = new GlideRecord(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY);
        gr.addNotNullQuery(LicensingEngineDBConstants.TABLE_REF_ID);
        gr.addQuery(LicensingEngineDBConstants.TABLE_REF_ID, tableSysId);
        gr.query();
        if (gr.next())
            return true;

        try {
            gr.initialize();
            gr.setValue(LicensingEngineDBConstants.TABLE_NAME, tableName);
            gr.setValue(LicensingEngineDBConstants.TABLE_REF, tableSysId);
            gr.setValue(LicensingEngineDBConstants.TABLE_REF_ID, tableSysId);
            gr.setValue(LicensingEngineDBConstants.TABLE_CREATED_ON, tableCreatedOn);
            gr.setValue(LicensingEngineDBConstants.APP_NAME, applicationName);
            gr.setValue(LicensingEngineDBConstants.APP_SCOPE, applicationScope);
            if (!global.JSUtil.nil(subscriptionSysId))
                gr.setValue(LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT, subscriptionSysId);
            if (!global.JSUtil.nil(allotmentType))
                gr.setValue(LicensingEngineDBConstants.ALLOTMENT_TYPE, allotmentType);
            if (!gr.insert()) {
                if (this.loggingEnabled)
                    this.logger.logError(LicensingEngineConstants.CUSTOM_TABLE_INVENTORY_DAO, LicensingEngineConstants.INSERT_CUSTOM_TABLE_INVENTORY_RECORD, LicensingEngineConstants.FAILED_INSERT_ATTEMPT_CUSTOM_TABLE_INVENTORY + tableName);
                return false;
            }
            return true;
        } catch (e) {
            if (this.loggingEnabled) {
                const errorMsg = LicensingEngineConstants.FAILED_INSERT_ATTEMPT_CUSTOM_TABLE_INVENTORY + tableName + " " + error + " \n " + error.stack;
                this.logger.logError(LicensingEngineConstants.CUSTOM_TABLE_INVENTORY_DAO, LicensingEngineConstants.INSERT_CUSTOM_TABLE_INVENTORY_RECORD, errorMsg);
            }
            return false;
        }
    },

    type: 'CustomTableInventoryDAO'
};
