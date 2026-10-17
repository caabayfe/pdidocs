var EntitlementDownloader = Class.create();
EntitlementDownloader.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.entitlementEngineUtils = new sn_lef.EntitlementEngineUtils();
        this.error = false;
        this.instanceId = gs.base64Encode(gs.getProperty(LicensingEngineConstants.INSTANCE_ID));
        this.instanceName = gs.base64Encode(gs.getProperty(LicensingEngineConstants.INSTANCE_NAME));
        this.subscriptionEntitlementsService = new SubscriptionEntitlementsService();
        this._leUtil = new LicensingEngineCommonUtil();

        //error code names
        this.HTTP_ERROR = "LIC2008";
        this.HTTP_NULL_RESPONSE = "LIC2009";

        // constants
        this.FILE_NAME = 'EntitlementPayload.txt';
        this.ENTITLEMENT_IMPORTED_DATA = "sn_entitlement_imported_data";
    },

    downloadEntitlements: function() {
        try {
            //check for on-perm instances
            if (new sn_entitlement.InstanceInfoUtil().isSelfHostedInstance()) {
                this.logger.logInfo(this.type, 'downloadEntitlement', 'Skipping entitlement download since the instance is self-hosted');
                return;
            }

            // check if surf routing is enabled, and if so, then exit
            if (gs.getProperty("glide.entitlement.surf.routing", "true") != "false") {
                this.logger.logInfo(this.type, 'downloadEntitlement', 'Skipping entitlement download since the instance is using surf routing');
                return;
            }
            this.entitlementEngineUtils.downloadInstInfo();
            this.entitlementEngineUtils.downloadAppFamily();
            this.entitlementEngineUtils.downloadEventRegistry();
            this._downloadSubscriptionEntitlements();
        } catch (e) {
            this.logger.logErrorWithoutAudit(this.type, "downloadEntitlements", e + " \n " + e.stack);
        } finally {
            const cacheDataHandler = new CacheDataHandler();
            cacheDataHandler.flushAndReloadLicensingCacheCatalog();
        }
    },

    processEntitlements: function(attachmentSysId) {
        try {

            this._storePayload(attachmentSysId);
            const result = this._process();
            this._postProcess(result);
            if (result[LicensingEngineDBConstants.STATUS] == LicensingEngineDBConstants.STATUS_VALUE.PROCESSED)
                return this._leUtil.processedSuccessfully();
            else
                return this._leUtil.processedWithFailure(result[LicensingEngineDBConstants.ERROR])
        } catch (e) {
            this.logger.logErrorWithoutAudit(this.type, "processEntitlements", e + " \n " + e.stack);
            return this._leUtil.processedWithFailure(e.message);
        } finally {
            const cacheManager = new CacheDataHandler();
            cacheManager.flush(LicensingEngineConstants.LICENSING_CACHE_CATALOG);
            cacheManager.reloadAllCache();
        }
    },

    _downloadSubscriptionEntitlements: function() {
        this._download();
        var result = this._process();
        this._postProcess(result);
    },

    _download: function() {
        //create record in entitlement data to add the payload attachment
        var endPointURL = LicensingEngineConstants.ENTITLEMENT_DOWNLOAD_SERVICE_URL + this.instanceId + "/" + this.instanceName;
        var restMethod = "GET";

        var authorization = this.entitlementEngineUtils.getAuthHeader();
        var headers = {
            'Authorization': authorization
        };

        var queryParameters = {
            'instance_name': this.instanceName,
            'instance_id': this.instanceId
        };

        var restObject = {
            'end_point': endPointURL,
            'headers': headers,
            'query_parameters': queryParameters,
            'rest_method': restMethod
        };

        var resp = null;
        var mesg = null;
        try {
            var licDownloaderUtils = new LicensingDownloaderUtils();
            resp = licDownloaderUtils.executeRESTAPI(restObject);
        } catch (error) {
            mesg = `Unexpected error while downloading entitlements: ${error} \n ${error.stack}`;
            this.setEntitlementDataStatusAndLog(mesg, LicensingEngineDBConstants.STATUS_VALUE.ERROR, recordSysId, this.type, "_download", this.HTTP_NULL_RESPONSE, LicensingEngineConstants.LICENSING_ERROR_TYPES.SUBSCRIPTION_DOWNLOAD_JOB);
        }

        if (global.LicensingScriptUtil.nil(resp)) {
            mesg = LicensingEngineConstants.LICENSING_ERROR_CODES[this.HTTP_NULL_RESPONSE] + "Instance ID: " + this.instanceId + ", Instance Name : " + this.instanceName;
            this.setEntitlementDataStatusAndLog(mesg, LicensingEngineDBConstants.STATUS_VALUE.ERROR, recordSysId, this.type, "_download", this.HTTP_NULL_RESPONSE, LicensingEngineConstants.LICENSING_ERROR_TYPES.SUBSCRIPTION_DOWNLOAD_JOB);
            this.error = true;
            return;
        }

        var httpStatus = resp.getStatusCode();
        if (global.LicensingScriptUtil.notNil(httpStatus) && httpStatus == LicensingEngineConstants.STATUS_OK) {
            var recordSysId = this.createEntitlementDataRecord();
            var recordAttributes = {
                'table_name': LicensingEngineDBConstants.ENTITLEMENT_DATA,
                'record_sys_id': recordSysId,
                'attachment_name': this.FILE_NAME,
            };
            this.savePayload(recordAttributes, resp);
            this.setEntitlementDataStatusAndLog("", LicensingEngineDBConstants.STATUS_VALUE.READY, recordSysId, "", "", "", "");
        } else if (httpStatus in LicensingEngineConstants.HTTP_STATUS_CODES) {
            const errorCode = LicensingEngineConstants.HTTP_STATUS_CODES[httpStatus];
            const errorMesg = LicensingEngineConstants.LICENSING_ERROR_CODES[errorCode] + resp.getErrorMessage();
            this.setEntitlementDataStatusAndLog(errorMesg, LicensingEngineDBConstants.STATUS_VALUE.ERROR, recordSysId, this.type, "download", errorCode, LicensingEngineConstants.LICENSING_ERROR_TYPES.SUBSCRIPTION_DOWNLOAD_JOB);
            this.error = true;
        } else {
            this.setEntitlementDataStatusAndLog(LicensingEngineConstants.LICENSING_ERROR_CODES[this.HTTP_ERROR] + resp.getErrorMessage(), LicensingEngineDBConstants.STATUS_VALUE.ERROR, recordSysId, this.type, "download", this.HTTP_ERROR, LicensingEngineConstants.LICENSING_ERROR_TYPES.SUBSCRIPTION_DOWNLOAD_JOB);
            this.error = true;
        }
    },

    savePayload: function(attributes, response) {
        var payload = response.getBody();
        if (typeof this.entitlementEngineUtils.saveAttachmentFromString == 'function') {
            var contentType = response.getHeader("Content-Type");
            this.entitlementEngineUtils.saveAttachmentFromString(attributes.record_sys_id, attributes.table_name, attributes.attachment_name, contentType, payload);
        } else {
            var gr = new GlideRecord(LicensingEngineDBConstants.ENTITLEMENT_DATA);
            var sysId = attributes.record_sys_id;
            if (gr.get(sysId)) {
                var compressedPayload = new global.LicensingEngineGlobalHelper().compressToBytes(payload);
                gr.setValue("payload", compressedPayload);
                gr.update();
            }
        }
    },

    _storePayload: function(attachmentSysId) {
        var attachment = new GlideSysAttachment();

        var recordSysId = this.createEntitlementDataRecord();
        var gr = new GlideRecord(LicensingEngineDBConstants.ENTITLEMENT_DATA);
        if (!gr.get(recordSysId))
            throw new Error("Entitlement Data record not found");


        var contentType = "text/plain";
        var inputStream = attachment.getContentStream(attachmentSysId);

        attachment.writeContentStream(
            gr,
            this.FILE_NAME,
            contentType,
            inputStream);

        this.setEntitlementDataStatusAndLog("", LicensingEngineDBConstants.STATUS_VALUE.READY, recordSysId, "", "", "", "");
    },

    _process: function() {
        if (this.error)
            return;

        var processor = new EntitlementProcessor();
        return processor.processEntitlementPayload();
    },

    _postProcess: function(result) {
        if (this.error)
            return;

        var status = result[LicensingEngineDBConstants.STATUS];
        var errorMesg = result[LicensingEngineDBConstants.ERROR];
        var recSysID = result[LicensingEngineDBConstants.SYS_ID];
        this.setEntitlementDataStatusAndLog(errorMesg, status, recSysID, result[LicensingEngineConstants.CLASS_NAME], result[LicensingEngineConstants.METHOD_NAME], result[LicensingEngineDBConstants.ERROR_CODE], result[LicensingEngineDBConstants.ERROR_TYPE]);

        var propertyValue = this.entitlementEngineUtils.getEntitlementEnginePropValue(LicensingEngineConstants.PROP_GLIDE_ENTITLEMENT_EMS_DATA_AVAILABLE);
        if (status == LicensingEngineDBConstants.STATUS_VALUE.PROCESSED && propertyValue != LicensingEngineConstants.TRUE)
            this.entitlementEngineUtils.setEntitlementEngineProp(LicensingEngineConstants.PROP_GLIDE_ENTITLEMENT_EMS_DATA_AVAILABLE, LicensingEngineConstants.TRUE);

        //TODO remove old records or add table cleaner for entitlement_data table - TBD

        const subscriptionList = this.subscriptionEntitlementsService.getEntitlementDetails(LicensingEngineConstants.INTEGRATIONHUBPOOL);
        subscriptionList.forEach(subscription => {
            this.entitlementEngineUtils.creatIHUsageCountCfg(subscription.name, subscription.subscription_identifier, LicensingEngineConstants.INTEGRATIONHUBPOOL);
        });

        //TODO to move definition creation for IH and IDR to a new post process function
        this.entitlementEngineUtils.subscriptionDownloadPostProcess(); //this includes all post process activities that has dependency on glide/legacy code
    },

    createEntitlementDataRecord: function() {
        var gr = new GlideRecord(LicensingEngineDBConstants.ENTITLEMENT_DATA);
        gr.setValue(LicensingEngineDBConstants.TYPE, LicensingEngineDBConstants.INSTANCE_LEVEL);
        gr.setValue(LicensingEngineDBConstants.STATUS, LicensingEngineDBConstants.STATUS_VALUE.NOT_READY);
        return gr.insert();
    },

    setEntitlementDataStatusAndLog: function(errorMesg, status, sysId, className, methodName, errorCode, errorType) {
        var gr = new GlideRecord(LicensingEngineDBConstants.ENTITLEMENT_DATA);
        if (gr.get(sysId)) {
            gr.setValue(LicensingEngineDBConstants.STATUS, status);
            gr.setValue(LicensingEngineDBConstants.ERROR_MESSAGE, errorMesg);
            gr.update();
        }

        if (status == LicensingEngineDBConstants.STATUS_VALUE.ERROR)
            this.logger.logError(className, methodName, errorMesg, errorCode, errorType);
    },

    type: 'EntitlementDownloader'
};
