var SysDBObjectDAO = Class.create();
SysDBObjectDAO.prototype = {
    initialize: function() {
        this.logger = new sn_entitlement.LoggingUtil();
    },

    // returns sys_id of the package assoicated with the table
    getPackageByTable: function(tableName) {
        var dbObjGR = new GlideRecord(LicensingEngineDBConstants.SYS_DB_OBJECT);
        if (dbObjGR.isValid() && dbObjGR.isValidField(LicensingEngineDBConstants.SYS_PACKAGE) && dbObjGR.isValidField(LicensingEngineDBConstants.NAME)) {
            dbObjGR.addQuery(LicensingEngineDBConstants.NAME, tableName);
            dbObjGR.query();
            if (dbObjGR.next())
                return dbObjGR.getValue(LicensingEngineDBConstants.SYS_PACKAGE);

            if (this.logger.isEntitlementLoggingEnabled()) {
                const conditionsString = LicensingEngineDBConstants.NAME.concat(LicensingEngineConstants.COMMA).concat(tableName);
                this.logger.logRecordDoesNotExists(LicensingEngineConstants.SYS_DB_OBJECT_DAO, LicensingEngineDBConstants.SYS_DB_OBJECT,
                    conditionsString);
            }
        }
        if (this.logger.isEntitlementLoggingEnabled()) {
            this.logger.logCouldNotDetermine(LicensingEngineConstants.SYS_DB_OBJECT_DAO, LicensingEngineConstants.GET_PACKAGE_BY_TABLE,
                LicensingEngineConstants.PACKAGE_ASSOCIATED_WITH_TABLE + " tableName :  " + tableName);
        }
        return null;
    },

    /**
     * @param {String} name of the table
     * @returns {Object} obj containing scope, name, subscription info
     */
    getScopeDetailsByTable: function(tableName) {
        const _grHelper = new sn_entitlement.LicensingEngineGlideRecordHelper();
        const scopeObj = {};
        var dbObjGR = new GlideRecord(LicensingEngineDBConstants.SYS_DB_OBJECT);
        dbObjGR.addQuery(LicensingEngineDBConstants.NAME, tableName);
        dbObjGR.query();
        _grHelper.addExtraField(dbObjGR, LicensingEngineDBConstants.SYS_SCOPE_DOT_SCOPE);
        _grHelper.addExtraField(dbObjGR, LicensingEngineDBConstants.SYS_SCOPE_DOT_NAME);
        _grHelper.addExtraField(dbObjGR, LicensingEngineDBConstants.SYS_SCOPE_DOT_SUBSCRIPTION_ENTITLEMENT);
        if (dbObjGR.next()) {
            scopeObj[LicensingEngineDBConstants.SCOPE] = dbObjGR[LicensingEngineDBConstants.SYS_SCOPE][LicensingEngineDBConstants.SCOPE];
            scopeObj[LicensingEngineDBConstants.NAME] = dbObjGR[LicensingEngineDBConstants.SYS_SCOPE][LicensingEngineDBConstants.NAME];
            scopeObj[LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT] = dbObjGR[LicensingEngineDBConstants.SYS_SCOPE][LicensingEngineDBConstants.SUBSCRIPTION_ENTITLEMENT];
            scopeObj[LicensingEngineDBConstants.SYS_CREATED_ON] = dbObjGR.getValue(LicensingEngineDBConstants.SYS_CREATED_ON);
        }
        return scopeObj;
    },

    isScriptableTable: function(tableName) {
        var dbObjGR = new GlideRecord(LicensingEngineDBConstants.SYS_DB_OBJECT);
        dbObjGR.addQuery(LicensingEngineDBConstants.NAME, tableName);
        dbObjGR.query();
        if (dbObjGR.next())
            return dbObjGR.getValue(LicensingEngineDBConstants.SCRIPTABLE_TABLE) == '1';
        return false;
    },

    type: 'SysDBObjectDAO'
};
