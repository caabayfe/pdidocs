var CustomTableInventoryProcessor = Class.create();
CustomTableInventoryProcessor.prototype = {
    initialize: function(entitlementIdToCustAllotmentObj) {
        this.logger = new LoggingUtil();
        this.entitlementIdToCustAllotmentMap = entitlementIdToCustAllotmentObj;
        this._leUtil = new LicensingEngineCommonUtil();
        this._entitlementUtils = new sn_lef.EntitlementEngineUtils();

    },

    /**
     * Input: 'validSubscriptionFamilies' (Format: key = subscription entitlement ID, value = list of family IDs)
     *
     * Invoke the Central endpoint (getExemptedTablesAndScopes) and populates the plat_lic_exemption table
     */
    downloadAndProcessExemptedEntities: function(validSubscriptionFamilies) {
        const familyIdsSet = new Set();
        if (global.LicensingScriptUtil.notNil(validSubscriptionFamilies)) {
            for (const entitlementNo in validSubscriptionFamilies) {
                const familyIds = validSubscriptionFamilies[entitlementNo];
                familyIdsSet.add(familyIds);
            }
        } else
            this.logger.logInfo(this.type, "downloadAndProcessExemptedEntities", "SubscriptionFamilies is null/empty");

        // Convert to Array and flatten it
        const familyIdsArr = Array.from(familyIdsSet);
        const familyIdsList = [].concat.apply([], familyIdsArr);

        const payload = this._downloadExemptedEntities(familyIdsList);

        this._process(payload);
    },

    _process: function(payload) {

        if (global.LicensingScriptUtil.nil(payload)) {
            this.logger.logError(this.type, "_process", "No exemption information was found for the customer instance.");
            return this._leUtil.processedWithFailure("Payload is empty");
        }

        const exemptedScopes = payload.exemptedScopes;
        // add additional exempted scopes for AppStore
        if (global.LicensingScriptUtil.notNil(payload.families.data)) {
            this.logger.logInfo(this.type, "_process", "Check if the EntitlementId for the remaining Families is a Paid AppStore, then exempt it");
            const subscriptionHasFamilyDAO = new SubscriptionHasFamilyDAO();
            const paidStoreAppFamilies = subscriptionHasFamilyDAO.getPaidStoreAppSubscriptionsByFamilies(payload.families.data);
            exemptedScopes.push.apply(exemptedScopes, paidStoreAppFamilies);
        }

        const platLicExemptionDAO = new PlatLicExemptionDAO();
        platLicExemptionDAO.insertExemptedEntities(payload.exemptedBaseTables, LicensingEngineConstants.BASE_TABLE);
        platLicExemptionDAO.insertExemptedEntities(exemptedScopes, LicensingEngineConstants.SCOPE);

        if (global.LicensingScriptUtil.notNil(payload.exemptedOobTables))
            new ExemptedOOBTableDAO().insertOrUpdateExemptedOobTableRecords(payload.exemptedOobTables);

        if (global.LicensingScriptUtil.notNil(payload.enforceEntitlementCheckApps))
            new UAAppInfoDAO().insertOrUpdateUAAppData(payload.enforceEntitlementCheckApps);

        return this._leUtil.processedSuccessfully();
    },


    processExemptedEntities: function(sysAttachmentRecordSysID) {
        try {
            const attachmentContent = new EntitlementAttachmentReader().getAttachmentContent(sysAttachmentRecordSysID);
            if (!global.LicensingScriptUtil.isEmpty(attachmentContent)) {
                const payloadString = attachmentContent.payload;
                const payload = JSON.parse(payloadString).result;
                this._preProcess(payload);
                const result = this._process(payload);

                // Add/Remove entries to/from ua_custom_table_inventory/ua_exempted_table_inventory and reload the cache
                this._entitlementUtils.platLicPostProcess();

                return result;
            } else {
                return this._leUtil.processedWithFailure("No attachment content");
            }
        } catch (e) {
            this.logger.logErrorWithoutAudit(this.type, "processExemptedEntities", e + " \n " + e.stack);
            return this._leUtil.processedWithFailure(e.message);
        }
    },

    _downloadExemptedEntities: function(familyIds) {
        const endPointURL = LicensingEngineConstants.V3_EXEMPTED_TABLES_AND_SCOPES_SERVICE_URL;
        const restMethod = "POST"; // We are using post to pass the FamilyIds List as the length will be more to accomodate in a path param, although the API does only GET operation

        const authorization = new sn_lef.EntitlementEngineUtils().getAuthHeader();
        const headers = {
            'Authorization': authorization,
            'Accept': "application/json",
            'Content-Type': 'application/json'
        };

        const payload = {
            'famIdList': familyIds,
            'instanceId': gs.getProperty(LicensingEngineConstants.INSTANCE_ID)
        };

        const restObject = {
            'end_point': endPointURL,
            'rest_method': restMethod,
            'headers': headers,
            'request_body': this._buildJSON(payload)
        };

        const licDownloaderUtils = new LicensingDownloaderUtils();
        const resp = licDownloaderUtils.executeRESTAPI(restObject);
        const httpStatus = resp.getStatusCode();

        if (httpStatus == 200) {
            return JSON.parse(resp.getBody()).result;
        } else {
            this.logger.logInfo(this.type, "_downloadExemptedEntities", "Failed with status code (" + resp.getStatusCode() + ") due to : " + resp.getErrorCode() + " - " + resp.getErrorMessage());
        }
        return null;
    },

    _buildJSON: function(data) {
        var json = "";
        try {
            json = new global.JSON().encode(data);
        } catch (ex) {
            this.logger.logInfo(this.type, "_buildJSON", "Error forming JSON Object");
            json = null;
        }

        return json;
    },

    // Populates license_cust_table_allotment and ua_cust_tbl_entitlement
    populateCTAllotmentAndEntitlement: function() {
        const supportedAllotmentTypes = [];
        var licenseCustTableAllotmentDAO = new LicenseCustTableAllotmentDAO();
        for (const entitlementNo in this.entitlementIdToCustAllotmentMap) {
            const entitlementNoToCustAllotment = this.entitlementIdToCustAllotmentMap[entitlementNo];
            const allotmentType = this._getAllotmentTypeByName(entitlementNoToCustAllotment.allotmentType);
            if (supportedAllotmentTypes.indexOf(allotmentType) < 0)
                supportedAllotmentTypes.push(allotmentType);
            licenseCustTableAllotmentDAO.insertOrUpdate(entitlementNoToCustAllotment.sysId, entitlementNoToCustAllotment.numberOfTables, allotmentType);
        }
        this.logger.logInfo(this.type, "populateCTAllotmentAndEntitlement", "SupportedAllotmentTypes: " + supportedAllotmentTypes);
        const uaInstanceStateDAO = new UAInstanceStateDAO();
        if (uaInstanceStateDAO.isProductionInstance()) {
            const uaCustTblEntitlementDAO = new UACustTblEntitlementDAO();
            uaCustTblEntitlementDAO.insert(supportedAllotmentTypes);
        }
    },

    _getAllotmentTypeByName: function(allotmentTypeName) {
        switch (allotmentTypeName) {
            case LicensingEngineConstants.ALLOTMENT_TYPES.APP_ENGINE:
                return LicensingEngineDBConstants.ALLOTMENT_TYPE_APP_ENGINE;
            case LicensingEngineConstants.ALLOTMENT_TYPES.GRANDFATHER:
                return LicensingEngineDBConstants.ALLOTMENT_TYPE_GRANDFATHER;
            case LicensingEngineConstants.ALLOTMENT_TYPES.TABLE_BUNDLE:
                return LicensingEngineDBConstants.ALLOTMENT_TYPE_TABLE_BUNDLE;
            default:
                return null;
        }
    },

    _preProcess: function(payload) {
        this._preProcessExemptedScopes(payload);
    },

    _preProcessExemptedScopes: function(payload) {
        const exemptedScopes = payload.exemptedScopes;
        const subscriptionHasFamilyDAO = new SubscriptionHasFamilyDAO();
        const subscribedAppFamiliesScope = subscriptionHasFamilyDAO.getSubscribedAppFamilies(exemptedScopes);
        payload.exemptedScopes = subscribedAppFamiliesScope;
    },

    type: 'CustomTableInventoryProcessor'
};
