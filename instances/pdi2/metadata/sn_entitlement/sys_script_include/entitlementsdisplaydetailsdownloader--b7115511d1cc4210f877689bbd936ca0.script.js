var EntitlementsDisplayDetailsDownloader = Class.create();
EntitlementsDisplayDetailsDownloader.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.arrayUtil = new global.LicensingScriptUtil();
        this.entitlementEngineUtils = new sn_lef.EntitlementEngineUtils();
        this.instanceId = gs.base64Encode(gs.getProperty(LicensingEngineConstants.INSTANCE_ID));
        this.instanceName = gs.base64Encode(gs.getProperty(LicensingEngineConstants.INSTANCE_NAME));
        this.response;
        this._leUtil = new LicensingEngineCommonUtil();

        //error code names
        this.HTTP_ERROR = 2008;
        this.HTTP_NULL_RESPONSE = 2009;
    },

    downloadAndProcessEntitlementsDisplayDetails: function() {
        try {
            if (this._skipDownload())
                return;

            this._download();
            this._process();
        } catch (e) {
            this.logger.logErrorWithoutAudit(this.type, "downloadAndProcessEntitlementsDisplayDetails", e + " \n " + e.stack);
        }
        this._postProcess();
    },

    /**
     * ToDO: Add more error handling
     */
    processEntitlementsDisplayDetails: function(sysAttachmentRecordSysID) {
        let result = this._leUtil.processedSuccessfully();
        try {
            const attachmentContent = new EntitlementAttachmentReader().getAttachmentContent(sysAttachmentRecordSysID);
            if (!global.LicensingScriptUtil.isEmpty(attachmentContent)) {
                const entitlementDisplayResponse = attachmentContent.payload;
                this.response = JSON.parse(entitlementDisplayResponse).result;
            }
            result = this._process();
        } catch (e) {
            this.logger.logErrorWithoutAudit(this.type, this.type, "processEntitlementsDisplayDetails", e + " \n " + e.stack);
            result = this._leUtil.processedWithFailure(e.message);
        }
        this._postProcess();
        return result;
    },

    _skipDownload: function() {
        //skip download for on-perm instances
        if (new sn_entitlement.InstanceInfoUtil().isSelfHostedInstance()) {
            this.logger.logInfo(this.type, '_skipDownload', 'Skipping entitlements display details download since the instance is self-hosted');
            return true;
        }
        // skip download if surf routing is enabled
        if (gs.getProperty("glide.entitlement.surf.routing", "true") != "false") {
            this.logger.logInfo(this.type, '_skipDownload', 'Skipping entitlements display details download since the instance is using surf routing');
            return true;
        }
        return false;
    },

    _download: function() {
        const endPointURL = LicensingEngineConstants.ENTITLEMENTS_DISPLAY_DETAILS_DOWNLOAD_SERVICE_URL + this.instanceId + "/" + this.instanceName;
        const restMethod = "GET";
        const authorization = this.entitlementEngineUtils.getAuthHeader();
        const headers = {
            'Authorization': authorization,
            'Accept': "application/json"
        };
        const queryParameters = {
            'instance_name': this.instanceName,
            'instance_id': this.instanceId
        };
        const restObject = {
            'end_point': endPointURL,
            'headers': headers,
            'query_parameters': queryParameters,
            'rest_method': restMethod
        };

        var resp = null;
        var mesg = null;
        try {
            const licDownloaderUtils = new LicensingDownloaderUtils();
            resp = licDownloaderUtils.executeRESTAPI(restObject);
        } catch (error) {
            mesg = 'Unexpected error while downloading entitlements display details: ${error} \n ${error.stack}';
            this.logger.logError(this.type, "_download", mesg, this.HTTP_NULL_RESPONSE, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_DISPLAY_DETAILS_DOWNLOAD);
        }

        if (global.LicensingScriptUtil.nil(resp)) {
            mesg = LicensingEngineConstants.LICENSING_ERROR_CODES[this.HTTP_NULL_RESPONSE] + "Instance ID: " + this.instanceId + ", Instance Name : " + this.instanceName;
            this.logger.logError(this.type, "_download", mesg, this.HTTP_NULL_RESPONSE, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_DISPLAY_DETAILS_DOWNLOAD);
            return;
        }

        var httpStatus = resp.getStatusCode();
        if (global.LicensingScriptUtil.notNil(httpStatus) && httpStatus == LicensingEngineConstants.STATUS_OK)
            this.response = JSON.parse(resp.getBody()).result;
        else if (httpStatus in LicensingEngineConstants.HTTP_STATUS_CODES) {
            const errorCode = LicensingEngineConstants.HTTP_STATUS_CODES[httpStatus];
            const errorMesg = LicensingEngineConstants.LICENSING_ERROR_CODES[errorCode] + resp.getErrorMessage();
            this.logger.logError(this.type, "_download", errorMesg, errorCode, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_DISPLAY_DETAILS_DOWNLOAD);
        } else
            this.logger.logError(this.type, "_download", LicensingEngineConstants.LICENSING_ERROR_CODES[this.HTTP_ERROR] + resp.getErrorMessage(), this.HTTP_ERROR, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_DISPLAY_DETAILS_DOWNLOAD);
    },

    _process: function() {
        if (global.LicensingScriptUtil.nil(this.response)) {
            const msg = "Entitlements display details payload from central is empty";
            this.logger.logInfo(this.type, "_process", msg);
            return this._leUtil.processedWithFailure(msg);
        }
        new sn_sub_man.FeatureEnablementProcessor().processFeatureEnablementFlags(this.response.feature_enablement_flags);
        new CloudEntitlementProcessor().populateInstanceLevelEntitlements(this.response.cloud);
        new GlobalConfigMetadataProcessor().processMetadata(this.response.mdm_product_data);
        this.populateNowAssistDisplayEntitlements(this.response.now_assist);
        new EntitlementConfigurationProcessor().processEntitlementConfiguration(this.response.sn_entitlement_configuration);
        return this._leUtil.processedSuccessfully();
    },

    _postProcess: function() {
        gs.eventQueue("sn_storage.calculate_usage", null, null, null);
    },

    /**
     * populate sn_entitlement_account_nowassist_purchased table
     */
    populateNowAssistDisplayEntitlements: function(entitlementList) {
        var entitlementsReceived = []; //maintain the received entitlements to identify any orphan entitlement

        if (global.LicensingScriptUtil.nil(entitlementList) || global.LicensingScriptUtil.isEmpty(entitlementList)) {
            this.logOrphanNowAssistDisplayEntitlements(entitlementsReceived);
            return;
        }

        for (var i in entitlementList) {
            var entitlementObj = entitlementList[i];
            if (global.LicensingScriptUtil.nil(entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_ID]))
                continue;

            //Identify entitlement type and replace entitlement_model_name attribute
            entitlementObj[LicensingEngineDBConstants.ENTITLEMENT_TYPE] = this.getEntitlementModel(entitlementObj.entitlement_model_name);
            delete entitlementObj.entitlement_model_name;

            const existingGR = new GlideRecord(LicensingEngineDBConstants.ACCOUNT_NOWASSIST_PURCHASED);
            existingGR.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, entitlementObj.entitlement_id);
            existingGR.query();
            if (existingGR.next())
                this._createEntitlementGR(existingGR, entitlementObj, false);
            else {
                const newGR = new GlideRecord(LicensingEngineDBConstants.ACCOUNT_NOWASSIST_PURCHASED);
                this._createEntitlementGR(newGR, entitlementObj, true);
            }

            entitlementsReceived.push(entitlementObj.entitlement_id);
        }

        this.logOrphanNowAssistDisplayEntitlements(entitlementsReceived);
    },

    getEntitlementModel: function(entitlementModel) {

        if (global.LicensingScriptUtil.nil(entitlementModel))
            return '0';

        if (this.arrayUtil.contains(LicensingEngineConstants.EMS_ENTITLEMENT_MODELS.SUBSCRIPTION, entitlementModel))
            return '0';
        else if (this.arrayUtil.contains(LicensingEngineConstants.EMS_ENTITLEMENT_MODELS.TRANSACTION, entitlementModel))
            return '1';

        return '0';
    },

    _createEntitlementGR: function(gr, entitlementObj, isNew) {
        for (var key in entitlementObj)
            gr.setValue(key, entitlementObj[key]);

        if (isNew)
            gr.insert();
        else
            gr.update();
    },

    /**
     * The function logs & inactivates existing Now Assist display entitlements (sn_entitlement_account_nowassist_purchased) in  which are not part of the payload
     */
    logOrphanNowAssistDisplayEntitlements: function(entitlementsReceived) {
        var gr = new GlideRecord(LicensingEngineDBConstants.ACCOUNT_NOWASSIST_PURCHASED);
        gr.addQuery(LicensingEngineDBConstants.ENTITLEMENT_ID, 'NOT IN', entitlementsReceived);
        gr.addQuery(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.NOW_ASSIST_STATUS_TO_CHECK);
        gr.query();

        var orphanEntitlementIds = [];
        while (gr.next()) {
            //Mark Orphan entitlements as inactive
            gr.setValue(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.NOW_ASSIST_ENTITLEMENT_STATUS.INACTIVE);
            gr.update();

            orphanEntitlementIds.push(gr.getValue(LicensingEngineDBConstants.ENTITLEMENT_ID));
        }

        if (global.LicensingScriptUtil.notNil(orphanEntitlementIds) && !global.LicensingScriptUtil.isEmpty(orphanEntitlementIds))
            this.logger.logWarn(this.type, "logOrphanNowAssistDisplayEntitlements", "Orphan Now Assist Display Entitlement(s) marked inactive with entitlement Id(s) : " + orphanEntitlementIds);
    },

    type: 'EntitlementsDisplayDetailsDownloader'
};
