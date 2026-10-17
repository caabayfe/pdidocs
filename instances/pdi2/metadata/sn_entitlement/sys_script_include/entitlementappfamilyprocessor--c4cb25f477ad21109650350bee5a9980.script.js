var EntitlementAppFamilyProcessor = Class.create();
EntitlementAppFamilyProcessor.prototype = {
    initialize: function(subscriptionAppFamList) {
        this.logger = new LoggingUtil();
        this.licDebugLog = gs.getProperty(LicensingEngineConstants.PROP_COM_GLIDE_LICENSING_DEBUG, false);
        this.arrayUtil = new global.LicensingScriptUtil();

        //key = subscription entitlement ID, value = list of application entitlement objects
        this.subAppFamilyList = subscriptionAppFamList;
        //key = subscription entitlement ID, value = list of licensable_app sys IDs
        this.validSubscriptionApps = {};
        //key = subscription entitlement ID, value = list of family IDs
        this.validSubscriptionFamilies = {};
        //key = subscription entitlement ID, value = list of family IDs
        this.installableFamilies = {};
        //key = subscription entitlement ID, value = list of family IDs
        this.notInstallableFamilies = {};

        this._explicitEntitlementsBuilder = new ExplicitEntitlementBuilder();
    },

    processApplicationEntitlements: function() {
        if (global.LicensingScriptUtil.nil(this.subAppFamilyList) || global.LicensingScriptUtil.isEmpty(this.subAppFamilyList)) {
            this.logger.logInfo(this.type, "processApplicationEntitlements", "There are no application entitlements in the payload.");
            return;
        }

        for (var subEntitleID in this.subAppFamilyList)
            this._populateAppFamily(subEntitleID, this.subAppFamilyList[subEntitleID]);

        this._cleanNotInstallableFamilies();
        this._cleanOrphanedSubscriptionFamilyMappings();
    },

    /**
     * populate licensable_app, subscription_has_app and subscription_has_family table
     */
    _populateAppFamily: function(subEntitleID, appObjList) {
        if (global.LicensingScriptUtil.nil(subEntitleID) || global.LicensingScriptUtil.nil(appObjList) || global.LicensingScriptUtil.isEmpty(appObjList))
            return;

        for (var i = 0; i < appObjList.length; i++) {
            var appObj = appObjList[i];
            var famID = appObj[LicensingEngineDBConstants.FAMILY_ID];
            var famName = appObj[LicensingEngineDBConstants.FAMILY_NAME];
            var displayType = appObj[LicensingEngineDBConstants.DISPLAY_TYPE];

            var installable = this._explicitEntitlementsBuilder.getInstallableStatus(appObj[LicensingEngineDBConstants.INSTALLABLE]);
            const explicitEntitlementDetails = {
                [LicensingEngineDBConstants.ENTITLED_ROLE_TYPES]: this._explicitEntitlementsBuilder.getUniqueRoleTypes(appObj[LicensingEngineDBConstants.ENTITLED_ROLE_TYPES]),
                [LicensingEngineDBConstants.UNRESTRICTED_ROLE_TYPES]: this._explicitEntitlementsBuilder.getUniqueRoleTypes(appObj[LicensingEngineDBConstants.UNRESTRICTED_ROLE_TYPES]),
                [LicensingEngineDBConstants.INSTALLABLE]: installable
            };

            //only populate subscription application families if the family associated with those application is installable
            if (global.LicensingScriptUtil.toBoolean(installable)) {
                this._populateLicensableApp(subEntitleID, famID, famName);
                this.installableFamilies[famID] = famName;
            } else
                this.notInstallableFamilies[famID] = famName;

            this._populateSubscriptionToFamily(subEntitleID, famID, explicitEntitlementDetails, displayType);
        }

        // If any apps entitlement have been removed from the SKU, remove it from the subscription.
        this._cleanRemovedAppEntitlements(subEntitleID);
        this._cleanRemovedFamilyEntitlements(subEntitleID);
    },

    _populateLicensableApp: function(subEntitleID, famID, famName) {
        //get all apps/plugins of given family from ua_app_Family table, this includes apps/plugins of child families as well
        var uaAppFamGR = new GlideRecord(LicensingEngineDBConstants.UA_APP_FAMILY);
        uaAppFamGR.addQuery(LicensingEngineDBConstants.LINEAGE_ID, famID);
        uaAppFamGR.addQuery(LicensingEngineDBConstants.LINEAGE_NAME, famName);
        uaAppFamGR.query();

        while (uaAppFamGR.next()) {
            var uaAppFamSysID = uaAppFamGR.getValue(LicensingEngineDBConstants.SYS_ID);
            var appID = uaAppFamGR.getValue(LicensingEngineDBConstants.APP_ID);
            var appName = uaAppFamGR.getValue(LicensingEngineDBConstants.APP_NAME);

            var licensableAppSysID = "";
            var licensableAppGR = new GlideRecord(LicensingEngineDBConstants.LICENSABLE_APP);
            licensableAppGR.addQuery(LicensingEngineDBConstants.APP_ID, appID);
            licensableAppGR.addQuery(LicensingEngineDBConstants.APP_NAME, appName);
            licensableAppGR.addQuery(LicensingEngineDBConstants.APP_FAMILY_ID, uaAppFamSysID);
            licensableAppGR.query();
            if (licensableAppGR.next()) {
                licensableAppSysID = licensableAppGR.getUniqueValue();
            } else {
                licensableAppGR = new GlideRecord(LicensingEngineDBConstants.LICENSABLE_APP);
                licensableAppGR.initialize();
                licensableAppGR.setValue(LicensingEngineDBConstants.APP_ID, appID);
                licensableAppGR.setValue(LicensingEngineDBConstants.APP_NAME, appName);
                licensableAppGR.setValue(LicensingEngineDBConstants.APP_FAMILY_ID, uaAppFamSysID);
                licensableAppSysID = licensableAppGR.insert();
            }
            this._populateSubscriptionToApp(subEntitleID, licensableAppSysID);
        }
    },

    /**
     * populate subscription_has_app - map application/plugin to the subscription
     */
    _populateSubscriptionToApp: function(subEntitleID, licensableAppSysID) {
        var subHasAppGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_APP);
        subHasAppGR.addQuery(LicensingEngineDBConstants.SUBSCRIPTION, subEntitleID);
        subHasAppGR.addQuery(LicensingEngineDBConstants.APPLICATION, licensableAppSysID);
        subHasAppGR.query();

        if (!subHasAppGR.next()) {
            subHasAppGR = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_APP);
            subHasAppGR.initialize();
            subHasAppGR.setValue(LicensingEngineDBConstants.SUBSCRIPTION, subEntitleID);
            subHasAppGR.setValue(LicensingEngineDBConstants.APPLICATION, licensableAppSysID);
            subHasAppGR.insert();
        }

        //capture current licensable_app sys ID for a subscription to clean up the orphan app mappings
        var validLicAppSysIdList = [];
        if (subEntitleID in this.validSubscriptionApps)
            validLicAppSysIdList = this.validSubscriptionApps[subEntitleID];

        validLicAppSysIdList.push(licensableAppSysID);
        this.validSubscriptionApps[subEntitleID] = validLicAppSysIdList;
    },

    _populateSubscriptionToFamily: function(subEntitleID, famID, explicitEntitlement, displayType) {
        var licFamGR = new GlideRecord(LicensingEngineDBConstants.TABLE_LICENSE_FAMILY);
        licFamGR.addQuery(LicensingEngineDBConstants.FAMILY_ID, famID);
        licFamGR.query();
        if (licFamGR.next()) {
            var gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
            gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION, subEntitleID);
            gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION_FAMILY, famID);
            gr.query();
            let insert = true;
            if (gr.next())
                insert = false;

            gr.setValue(LicensingEngineDBConstants.SUBSCRIPTION, subEntitleID);
            gr.setValue(LicensingEngineDBConstants.SUBSCRIPTION_FAMILY, famID);
            gr.setValue(LicensingEngineDBConstants.DISPLAY_TYPE, displayType);
            Object.entries(explicitEntitlement).forEach(([key, value]) => {
                gr.setValue(key, value);
            });
            if (insert)
                gr.insert();
            else
                gr.update();
        }

        //capture current famIDs for a subscription to clean up the orphan family mappings
        var validLicFamIDList = [];
        if (subEntitleID in this.validSubscriptionFamilies)
            validLicFamIDList = this.validSubscriptionFamilies[subEntitleID];

        validLicFamIDList.push(famID);
        this.validSubscriptionFamilies[subEntitleID] = validLicFamIDList;
    },

    _cleanRemovedAppEntitlements: function(subEntitleID) {
        var gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_APP);
        gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION, subEntitleID);
        gr.query();

        var validAppsList = this.validSubscriptionApps[subEntitleID];
        if (global.LicensingScriptUtil.nil(validAppsList) || global.LicensingScriptUtil.isEmpty(validAppsList)) {
            gr.deleteMultiple();
            return;
        }

        while (gr.next()) {
            var appId = gr.getValue(LicensingEngineDBConstants.APPLICATION);
            if (!this.arrayUtil.contains(validAppsList, appId)) {
                if (gr.deleteRecord() && this.licDebugLog == 'true')
                    this.logger.logInfo(this.type, "cleanRemovedAppEntitlements", "Removed app " + appId + " from subscription " + subEntitleID);
            }
        }
    },

    _cleanRemovedFamilyEntitlements: function(subEntitleID) {
        var gr = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
        gr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION, subEntitleID);
        gr.query();

        var validFamIDList = this.validSubscriptionFamilies[subEntitleID];
        if (global.LicensingScriptUtil.nil(validFamIDList) || global.LicensingScriptUtil.isEmpty(validFamIDList)) {
            gr.deleteMultiple();
            return;
        }

        while (gr.next()) {
            var famId = gr.getValue(LicensingEngineDBConstants.SUBSCRIPTION_FAMILY);
            if (!this.arrayUtil.contains(validFamIDList, famId)) {
                if (gr.deleteRecord())
                    this.logger.logInfo(this.type, "cleanRemovedFamilyEntitlements", "Deleted Record from Licence Has Family since the " + famId + " family was removed from associated product families for " + subEntitleID + " subscription");
            }
        }
    },
    _cleanNotInstallableFamilies: function() {
        if (global.LicensingScriptUtil.nil(this.notInstallableFamilies))
            return;

        if (global.LicensingScriptUtil.nil(this.installableFamilies))
            this.installableFamilies = {};

        const _licensingEngineGlobalHelper = new global.LicensingEngineGlobalHelper();
        Object.entries(this.notInstallableFamilies).forEach(([key, value]) => {
            //only remove family data that are uniquely part of not installable list
            if (!(key in this.installableFamilies && this.installableFamilies[key] == value)) {
                _licensingEngineGlobalHelper.clearLicensableAppRecords(key, value);
				if (this.licDebugLog == 'true'){
					this.logger.logInfo(this.type, "_cleanNotInstallableFamilies", "Deleted Records from licensable app, " + key + " is a non installable family");
				}
            }
        });
    },

    /**
     * Delete records from SUBSCRIPTION_HAS_FAMILY where the referenced subscription_family doesn't exist
     */
    _cleanOrphanedSubscriptionFamilyMappings: function() {
        try {
            // Use GlideAggregate to find subscription_has_family records with invalid family references
            var ga = new GlideAggregate(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
            ga.addAggregate('COUNT');
            ga.groupBy(LicensingEngineDBConstants.LICENSE_FAMILY);
            ga.query();

            var validFamilyIds = {};
            var familyIdsToCheck = [];

            // Collect all unique family IDs from subscription_has_family
            while (ga.next()) {
                var familyId = ga.getValue(LicensingEngineDBConstants.LICENSE_FAMILY);
                familyIdsToCheck.push(familyId);
            }

            if (familyIdsToCheck.length === 0) {
                return; // No records to process
            }

            // Process family IDs in chunks
            var chunkSize = 500;
            for (var i = 0; i < familyIdsToCheck.length; i += chunkSize) {
                var chunk = familyIdsToCheck.slice(i, i + chunkSize);

                // Check which family IDs in this chunk exist in license_family table
                var licenseFamily = new GlideRecord(LicensingEngineDBConstants.TABLE_LICENSE_FAMILY);
                licenseFamily.addQuery('family_id', 'IN', chunk.join(','));
                licenseFamily.query();

                // Track valid family IDs
                while (licenseFamily.next()) {
                    validFamilyIds[licenseFamily.family_id.toString()] = true;
                }
            }

            // Get the list of invalid family IDs
            var invalidFamilyIds = familyIdsToCheck.filter(function(familyId) {
                return !validFamilyIds[familyId];
            });

            if (invalidFamilyIds.length === 0) {
                return; // No invalid families found
            }

            // Delete all records with non-existent family references in one operation
            var subscriptionHasFamily = new GlideRecord(LicensingEngineDBConstants.SUBSCRIPTION_HAS_FAMILY);
            subscriptionHasFamily.addQuery(LicensingEngineDBConstants.LICENSE_FAMILY, "IN", invalidFamilyIds);
            subscriptionHasFamily.query();
            var deletedCount = invalidFamilyIds.length;
            subscriptionHasFamily.deleteMultiple();
            if (deletedCount > 0) {
                this.logger.logInfo(this.type, "cleanOrphanedSubscriptionFamilyMappings",
                    "Deleted " + deletedCount + " orphaned subscription family mapping records");
            }
        } catch (ex) {
            var errorMsg = 'Error cleaning orphaned subscription family mappings: ' + ex.message;
            this.logger.logError(this.type, 'cleanOrphanedSubscriptionFamilyMappings', errorMsg);
        }
    },

    type: 'EntitlementAppFamilyProcessor'
};
