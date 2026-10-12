var SysPackageDAO = Class.create();
SysPackageDAO.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
    },

    // returns associated app_id for the package
    getAppIdByPackage: function(packageSysId) {
        var packageGR = new GlideRecord(LicensingEngineDBConstants.SYS_PACKAGE);
        let errorDueToStore = LicensingEngineConstants.FALSE;
        if (packageGR.isValid()) {
            if (packageGR.get(packageSysId)) {
                const className = packageGR.getValue(LicensingEngineDBConstants.SYS_CLASS_NAME);
                if (className == LicensingEngineConstants.SYS_STORE_APP) {
                    let appStoreDAO = new LicensingEngineDAO(LicensingEngineConstants.SYS_STORE_APP);
                    const appID = appStoreDAO.getCodeFromStore(packageSysId);
                    if (!gs.nil(appID))
                        return appID;
                    errorDueToStore = LicensingEngineConstants.TRUE;
                }
                if (className == LicensingEngineConstants.SYS_PLUGINS)
                    return packageGR.getValue(LicensingEngineDBConstants.SOURCE);
            }

            if (this.logger.isEntitlementLoggingEnabled() && errorDueToStore == LicensingEngineConstants.FALSE) {
                var conditionsString = LicensingEngineDBConstants.SYS_ID.concat(LicensingEngineConstants.COMMA).concat(packageSysId);
                this.logger.logRecordDoesNotExists(LicensingEngineConstants.SYS_PACKAGE_DAO, LicensingEngineDBConstants.SYS_PACKAGE,
                    conditionsString);
            }
        }
        if (this.logger.isEntitlementLoggingEnabled()) {
            this.logger.logCouldNotDetermine(LicensingEngineConstants.SYS_PACKAGE_DAO, LicensingEngineConstants.GET_APP_ID_BY_PACKAGE,
                LicensingEngineConstants.APP_ASSOCIATED_WITH_PACKAGE + " packageSysId : " + packageSysId);
        }
        return null;
    },

    type: 'SysPackageDAO'
};
