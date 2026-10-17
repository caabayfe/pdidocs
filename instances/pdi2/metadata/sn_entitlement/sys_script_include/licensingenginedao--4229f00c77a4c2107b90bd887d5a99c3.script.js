var LicensingEngineDAO = Class.create();
LicensingEngineDAO.prototype = {
    initialize: function(tableName) {
        this.tableName = tableName;
        this.logger = new LoggingUtil();
    },

    getCodeFromStore: function(recordSysID) {
        let storeGR = new GlideRecord(this.tableName);
        storeGR.addQuery(LicensingEngineDBConstants.SYS_ID, recordSysID);
        storeGR.query();
        if (storeGR.next())
            return storeGR.getValue(LicensingEngineDBConstants.SYS_CODE);

        if (this.logger.isEntitlementLoggingEnabled()) {
            var conditionsString = LicensingEngineDBConstants.SYS_ID.concat(LicensingEngineConstants.COMMA).concat(recordSysID);
            this.logger.logRecordDoesNotExists(LicensingEngineConstants.LICENSING_ENGINE_DAO, LicensingEngineConstants.SYS_STORE_APP,
                conditionsString);
        }
        return null;
    },

    type: 'LicensingEngineDAO'
};
