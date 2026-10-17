var EntitlementService = Class.create();
EntitlementService.prototype = {
    initialize: function() {
        this.requestProcessorFactory = new EntitlementProcessorFactory();
        this.logger = new LoggingUtil();
        this.cacheManager = new LicensingCacheManager();
        this.cacheDataHandler = new CacheDataHandler();
    },

    isEntitledForArtifact: function(artifactType, artifactId, ignoreOpenCheck, deepCheckAppEntitlement) {

        // Use getter method with local copy pattern to avoid race condition
        // On cache miss: loads data locally, populates cache for other threads, returns local copy (immune to concurrent cache flush)
        // instanceInfoObject = {open_instance:true/false}
        let instanceInfoObject = new InstanceInfoUtil().getInstanceInfo();
        if (!gs.nil(instanceInfoObject) && instanceInfoObject.open_instance == true && !ignoreOpenCheck)
            return true;
        const entitlementRequestProcessor = this.requestProcessorFactory.getEntitlementRequestProcessor(artifactType);
        return entitlementRequestProcessor.isEntitled(artifactId, deepCheckAppEntitlement);
    },

    isLicenseCheckRequiredForArtifact: function(artifactType, artifactId) {
        const entitlementRequestProcessor = this.requestProcessorFactory.getEntitlementRequestProcessor(artifactType);
        return entitlementRequestProcessor.isLicenseCheckRequired(artifactId);
    },

    isTableLicensedForArtifact: function(artifactType, artifactId, tableName, ignoreOpenCheck) {

        let customTableProcessor = new CustomTableEntitlementProcessor();
        let appEntitlementProcessor = new AppEntitlementProcessor();
        let arrayUtil = new global.LicensingScriptUtil();
        let tablesSchemaHelper = new TablesSchemaHelper();

        try {
            if (new InstanceInfoUtil().isOpenInstance() && !ignoreOpenCheck)
                return true;

            if (!tablesSchemaHelper.isvalidTable(tableName))
                return this.isEntitledForArtifact(artifactType, artifactId, ignoreOpenCheck);

            const entitlementRequestProcessor = this.requestProcessorFactory.getEntitlementRequestProcessor(artifactType);
            const artifactSubscriptionIds = entitlementRequestProcessor.getActiveSubscriptionSysIds(artifactId);
            const isLicenseCheckRequiredForArtifact = entitlementRequestProcessor.isLicenseCheckRequired(artifactId);

            // Handles the case if given table is a custom table - exempted / licensed.
            if (customTableProcessor.isCustomTable(tableName)) {
                let ctiSubscriptonIds;
                const isLicensableCustomTable = customTableProcessor.isLicensableCustomTable(tableName);
                if (isLicensableCustomTable)
                    ctiSubscriptonIds = customTableProcessor.getActiveSubscriptionSysId(tableName);

                if (!isLicensableCustomTable && isLicenseCheckRequiredForArtifact)
                    return !gs.nil(artifactSubscriptionIds) && artifactSubscriptionIds.length > 0;
                else if (isLicensableCustomTable && !isLicenseCheckRequiredForArtifact)
                    return !gs.nil(ctiSubscriptonIds) && ctiSubscriptonIds.length > 0;
                else if (isLicensableCustomTable && isLicenseCheckRequiredForArtifact)
                    return arrayUtil.contains(artifactSubscriptionIds, ctiSubscriptonIds);
                // Exempted custom table and free artifacts
                return true;
            }

            // Handles the case if the given table is not a custom table.
            const tablePackage = new SysDBObjectDAO().getPackageByTable(tableName);
            const appId = new SysPackageDAO().getAppIdByPackage(tablePackage);
            if (gs.nil(appId))
                return this.isEntitledForArtifact(artifactType, artifactId, ignoreOpenCheck);
            let appSubscriptionIds;
            const isLicenseCheckRequiredForApp = appEntitlementProcessor.isLicenseCheckRequired(appId);
            if (isLicenseCheckRequiredForApp)
                appSubscriptionIds = appEntitlementProcessor.getActiveSubscriptionSysIds(appId);

            if (!isLicenseCheckRequiredForApp && isLicenseCheckRequiredForArtifact)
                return !gs.nil(artifactSubscriptionIds) && artifactSubscriptionIds.length > 0;
            else if (isLicenseCheckRequiredForApp && !isLicenseCheckRequiredForArtifact)
                return !gs.nil(appSubscriptionIds) && appSubscriptionIds.length > 0;
            else if (isLicenseCheckRequiredForApp && isLicenseCheckRequiredForArtifact) {
                for (let i = 0; i < appSubscriptionIds.length; i++) {
                    if (arrayUtil.contains(artifactSubscriptionIds, appSubscriptionIds[i]))
                        return true;
                }
                return false;
            }
            // Free table  and free artifacts
            return true;

        } catch (error) {
            const errorMsg = "An error has occured for artifact: " + artifactType + " id : " + artifactId + " table : " + tableName + +" Error : " + error + " \n " + error.stack;
            this.logger.logErrorWithoutAudit(LicensingEngineConstants.ENTITLEMENT_SERVICE, LicensingEngineConstants.TABLE_LICENSED_FOR_ARTIFACT, errorMsg);
            return LicensingEngineConstants.UNABLE_TO_DETERMINE_ENTITLEMENT;
        }
    },

    /* returns object with key: value pairs as isUserEntitlementNeeded: boolean (determines if user entitlement is needed),
     *	artifactType: string (type of artifact which should be used to check entitlement),
     *	artifactId: string (id of the artifact which should be used to check entitlement)
     */
    getTableEntitlementInfo: function(tableName) {
        var result = {
            isUserEntitlementNeeded: true,
            artifactType: null,
            artifactId: null
        };
        try {
            if (new InstanceInfoUtil().isOpenInstance()) {
                result.isUserEntitlementNeeded = false;
                return result;
            }
            // using default access type as CHECK
            let userAccessCheckType = LicensingEngineConstants.CHECK;

            // if table is present in sys_custom_db_object, then checks are performed for custom_table artifact type,
            // else app associated with the table is fetched and checks are performed on the retrieved app_id
            var customTableProcessor = new CustomTableEntitlementProcessor();
            if (customTableProcessor.isCustomTable(tableName)) {
                result.artifactType = LicensingEngineConstants.CUSTOM_TABLE;
                result.artifactId = tableName;

                // if the given table is a non-licensable custom table (gf table or an exempted table)
                // then user entitlement is not needed, we return from here only
                // else for a licensable custom table, system will fetch the associated subscription and get the
                // userAccessCheckType to determine if user entitlement is needed
                if (!customTableProcessor.isLicensableCustomTable(tableName)) {
                    result.isUserEntitlementNeeded = false;
                    return result;
                }

            } else {
                result.artifactType = LicensingEngineConstants.APP_ID;
                var tablePackage = new SysDBObjectDAO().getPackageByTable(tableName);
                if (gs.nil(tablePackage)) {
                    this.logger.logCouldNotFind(LicensingEngineConstants.ENTITLEMENT_SERVICE, LicensingEngineConstants.GET_TABLE_ENTITLEMENT_INFO,
                        LicensingEngineConstants.ASSOCIATED_PACKAGE_FOR_TABLE);
                    return result;
                }

                result.artifactId = new SysPackageDAO().getAppIdByPackage(tablePackage);
                if (gs.nil(result.artifactId)) {
                    this.logger.logCouldNotFind(LicensingEngineConstants.ENTITLEMENT_SERVICE, LicensingEngineConstants.GET_TABLE_ENTITLEMENT_INFO,
                        LicensingEngineConstants.ASSOCIATED_APP_FOR_PACKAGE);
                    return result;
                }
            }
            //  call will go to the respective entitlement processor to get the userAccessCheckType for the given artifact using associated subscriptions
            const entitlementRequestProcessor = this.requestProcessorFactory.getEntitlementRequestProcessor(result.artifactType);
            userAccessCheckType = entitlementRequestProcessor.getUserAccessCheckType(result.artifactId);
            this.logger.logInfo(LicensingEngineConstants.ENTITLEMENT_SERVICE, LicensingEngineConstants.GET_TABLE_ENTITLEMENT_INFO,
                LicensingEngineConstants.USER_ACCESS_CHECK_TYPE_FOR_THE_TABLE_.concat(tableName).concat(LicensingEngineConstants.COLON).concat(userAccessCheckType));

            // if userAccessCheckType is set to ALLOW, then user entitlement is not needed for the table
            if (LicensingEngineConstants.ALLOW.equals(userAccessCheckType))
                result.isUserEntitlementNeeded = false;

            return result;

        } catch (error) {
            this.logger.logErrorInDetermining(LicensingEngineConstants.ENTITLEMENT_SERVICE, LicensingEngineConstants.GET_TABLE_ENTITLEMENT_INFO,
                LicensingEngineConstants.USER_ACCESS_CHECK_TYPE, error);
            return result;
        }
    },

    // returns true if user is entitled to perform role on the given artifact
    isUserEntitledForRoleOnArtifact: function(userSysId, role, artifactType, artifactId) {
        if (new InstanceInfoUtil().isOpenInstance())
            return true;
        const entitlementRequestProcessor = this.requestProcessorFactory.getEntitlementRequestProcessor(artifactType);
        return entitlementRequestProcessor.isUserEntitledForRole(userSysId, role, artifactId);
    },

    getLicenseDetailsForArtifact: function(artifactType, artifactId) {
        var entitlementRequestProcessor = this.requestProcessorFactory.getEntitlementRequestProcessor(artifactType);
        return entitlementRequestProcessor.getLicenseDetailsForArtifact(artifactId);
    },

    getLicenseDetailsForArtifacts: function(artifactType, artifactIdList) {
        let entitlementRequestProcessor = this.requestProcessorFactory.getEntitlementRequestProcessor(artifactType);
        return entitlementRequestProcessor.getLicenseDetailsForArtifacts(artifactIdList);
    },

    type: 'EntitlementService'
};
