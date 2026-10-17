var CustomTableInventoryCleanupProcessor = Class.create();
CustomTableInventoryCleanupProcessor.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.customTableInventoryDAO = new CustomTableInventoryDAO();
        this.licensingEngineGlideRecordHelper = new LicensingEngineGlideRecordHelper();
        this.exemptedTableInventoryDAO = new ExemptedTableInventoryDAO();
        this.exemptedOOBTableDAO = new sn_entitlement.PassThroughCache(new ExemptedOOBTableDAO());
        this.licenseCustTableAllotmentDAO = new LicenseCustTableAllotmentDAO();
        this.platLicExemptionDAO = new PlatLicExemptionDAO();
        this.sysDBObjectDAO = new SysDBObjectDAO();
        this.licensingEngineGlobalHelper = new global.LicensingEngineGlobalHelper();
        this._entitlementUtils = new sn_lef.EntitlementEngineUtils();
        this.loggingEnabled = this.logger.isEntitlementLoggingEnabled();
        this.needToReloadCache = false;
    },

    /**
     * This method manually exempt oob tables present in CTI and removes manually exempt custom tables present in ETI
     * We also have a UI Action implementation of this logic which leverages Glide code. 
     * This implementation is similar to the glide flow.
     * In glide, the flow only ran when the current session user had maint role. While this flow would execute for system
     * user without the maint role.
     */
    run: function() {
        //clean-up entries from CTI
        this.manuallyExemptCustomTable();
        //clean-up entries from ETI
        this.removeManuallyExemptedCustomTable();
        //reload cache
        if (this.needToReloadCache)
            this.licensingEngineGlobalHelper.reloadEntitledCustomTables();
        //delete references to loaded maps
        this.deleteMapReferences();
    },

    manuallyExemptCustomTable: function() {
        //get oob table name to sys id map to cleanup
        const ctiTablesToCleanupMap = this.customTableInventoryDAO.getOOBTablesToCleanup(this.exemptedOOBTableDAO);
        const tables = Array.from(ctiTablesToCleanupMap.keys());

        if (this.loggingEnabled)
            this.logger.logInfo(LicensingEngineConstants.CUSTOM_TABLE_INVENTORY_CLEANUP_PROCESSOR, LicensingEngineConstants.MANUALLY_EXEMPT_CUSTOM_TABLE, tables.length + " " + LicensingEngineConstants.OOB_TABLES_FOUND_IN_CTI + tables);

        if (!ctiTablesToCleanupMap.size)
            return;

        //exempt the oob tables
        this.exemptOOBTables(ctiTablesToCleanupMap);
        this.needToReloadCache = true;
    },

    exemptOOBTables: function(ctiTablesToCleanupMap) {
        let transactionSuccess = false;
        const tablesList = [];

        //insert record of the oob tables into ua_exempted_table_inventory
        for (const [tableName, sysId] of ctiTablesToCleanupMap) {
            if (global.JSUtil.nil(sysId))
                continue;

            transactionSuccess = this.exemptedTableInventoryDAO.insertExemptedTableInventoryRecord(tableName, sysId, LicensingEngineDBConstants.MANUALLY_EXEMPTED_TABLE, tableName, LicensingEngineConstants.MANUAL_EXEMPTION_ADDITIONAL_DETAILS);

            if (transactionSuccess)
                tablesList.push(sysId);
        }

        //delete records of the oob tables from CTI 
        const queryParamsList = [];
        const queryParamObj = {};
        queryParamObj[LicensingEngineDBConstants.FIELD] = LicensingEngineDBConstants.TABLE_REF_ID;
        queryParamObj[LicensingEngineDBConstants.VALUE] = tablesList;
        queryParamObj[LicensingEngineDBConstants.OPERATOR] = LicensingEngineDBConstants.IN;
        queryParamsList.push(queryParamObj);

        this.licensingEngineGlideRecordHelper.deleteTableRecordHelper(LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY, queryParamsList, true);
    },

    removeManuallyExemptedCustomTable: function() {
        //get custom table name to sys id map to cleanup
        const etiTablesToCleanupMap = this.exemptedTableInventoryDAO.getCustomTablesToCleanup(this.exemptedOOBTableDAO, this.platLicExemptionDAO, this.sysDBObjectDAO);
        const tables = Array.from(etiTablesToCleanupMap.keys());

        if (this.loggingEnabled)
            this.logger.logInfo(LicensingEngineConstants.CUSTOM_TABLE_INVENTORY_CLEANUP_PROCESSOR, LicensingEngineConstants.REMOVE_MANUALLY_EXEMPT_CUSTOM_TABLE, tables.length + " " + LicensingEngineConstants.CUSTOM_TABLES_FOUND_IN_ETI + tables);

        if (!etiTablesToCleanupMap.size)
            return;

        //unexempt custom tables
        this.unExemptCustomTables(etiTablesToCleanupMap);
        this.needToReloadCache = true;
    },

    unExemptCustomTables: function(etiTablesToCleanupMap) {
        let transactionSuccess = false;
        const tablesList = [];
        //insert record of the custom tables into ua_custom_table_inventory
        for (const [tableName, sysId] of etiTablesToCleanupMap) {
            if (global.JSUtil.nil(sysId))
                continue;

            const ctiObject = this.customTableInventoryDAO.getCtiObject(tableName, sysId, this.licenseCustTableAllotmentDAO, this.sysDBObjectDAO);
            transactionSuccess = this.customTableInventoryDAO.insertCustomTableInventoryRecord(ctiObject);

            if (transactionSuccess)
                tablesList.push(sysId);
        }

        //delete records of the custom tables from ua_exempted_table_inventory
        var queryParamsList = [];
        var queryParamObj = {};
        queryParamObj[LicensingEngineDBConstants.FIELD] = LicensingEngineDBConstants.TABLE_REF_ID;
        queryParamObj[LicensingEngineDBConstants.VALUE] = tablesList;
        queryParamObj[LicensingEngineDBConstants.OPERATOR] = LicensingEngineDBConstants.IN;
        queryParamsList.push(queryParamObj);

        this.licensingEngineGlideRecordHelper.deleteTableRecordHelper(LicensingEngineDBConstants.UA_EXEMPTED_TABLE_INVENTORY, queryParamsList, true);
    },

    deleteMapReferences: function() {
        delete this.exemptedOOBTableDAO.tableExemptMap;
        delete this.platLicExemptionDAO.nameToTypeMap;
        delete this.licenseCustTableAllotmentDAO.subscriptionAllotmentMap;
    },

    type: 'CustomTableInventoryCleanupProcessor'
};
