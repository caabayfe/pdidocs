var ExemptedTableInventoryDAO = Class.create();
ExemptedTableInventoryDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.loggingEnabled = this.logger.isEntitlementLoggingEnabled();
    },

    /**
     * Used in custom table inventory cleanup job
     * @param {Object} "ua_exempted_oob_table" DAO
     * @param {Object} "plat_lic_exemption" DAO
     * @param {Object} "sys_db_object" DAO
     * @returns {Object} map of custom tables names to sys id
     */
    getCustomTablesToCleanup: function(exemptedOOBTableDAO, platLicExemptionDAO, sysDBObjectDAO) {
        const customTableNameSysIdMap = new Map();

        const gr = new GlideRecord(LicensingEngineDBConstants.UA_EXEMPTED_TABLE_INVENTORY);
        gr.addQuery(LicensingEngineDBConstants.EXEMPT_TYPE, LicensingEngineDBConstants.MANUALLY_EXEMPTED_TABLE);
        gr.addNotNullQuery(LicensingEngineDBConstants.TABLE_REF_ID);
        gr.query();
        while (gr.next()) {
            const tableName = gr.getValue(LicensingEngineDBConstants.TABLE_NAME);
            const scope = gr.getElement(LicensingEngineDBConstants.TABLE_REF_DOT_SYS_SCOPE_DOT_SCOPE);
            const tableRefId = gr.getValue(LicensingEngineDBConstants.TABLE_REF_ID);

            //check if table is unexempted, not exempted by base table, scope, not a remote table
            if (exemptedOOBTableDAO.isTableToExempt(tableName, scope, false) && !platLicExemptionDAO.isExemptedByBaseTable(tableName) && !platLicExemptionDAO.isExemptedByScope(tableName) && !sysDBObjectDAO.isScriptableTable(tableName))
                customTableNameSysIdMap.set(tableName, tableRefId);
        }
        return customTableNameSysIdMap;
    },

    insertExemptedTableInventoryRecord: function(tableName, tableRef, exemptType, exemptName, additionalDetails) {
        const gr = new GlideRecord(LicensingEngineDBConstants.UA_EXEMPTED_TABLE_INVENTORY);
        gr.addNotNullQuery(LicensingEngineDBConstants.TABLE_REF_ID);
        gr.addQuery(LicensingEngineDBConstants.TABLE_REF_ID, tableRef);
        gr.query();
        if (gr.next())
            return true;
        try {
            gr.initialize();
            gr.setValue(LicensingEngineDBConstants.TABLE_NAME, tableName);
            gr.setValue(LicensingEngineDBConstants.TABLE_REF, tableRef);
            gr.setValue(LicensingEngineDBConstants.TABLE_REF_ID, tableRef);
            gr.setValue(LicensingEngineDBConstants.EXEMPT_TYPE, exemptType);
            gr.setValue(LicensingEngineDBConstants.EXEMPT_NAME, exemptName);
            gr.setValue(LicensingEngineDBConstants.ADDITIONAL_DETAILS, additionalDetails);
            if (!gr.insert()) {
                if (this.loggingEnabled)
                    this.logger.logError(LicensingEngineConstants.EXEMPTED_TABLE_INVENTORY_DAO, LicensingEngineConstants.INSERT_EXEMPTED_TABLE_INVENTORY_RECORD, LicensingEngineConstants.FAILED_INSERT_ATTEMPT_EXEMPTED_TABLE_INVENTORY + tableName);
                return false;
            }
            return true;
        } catch (error) {
            if (this.loggingEnabled) {
                const errorMsg = LicensingEngineConstants.FAILED_INSERT_ATTEMPT_EXEMPTED_TABLE_INVENTORY + tableName + error + " \n " + error.stack;
                this.logger.logError(LicensingEngineConstants.EXEMPTED_TABLE_INVENTORY_DAO, LicensingEngineConstants.INSERT_EXEMPTED_TABLE_INVENTORY_RECORD, errorMsg);
            }
            return false;
        }
    },

    type: 'ExemptedTableInventoryDAO'
};
