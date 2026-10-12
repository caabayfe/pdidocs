var PayloadOrchestratorService = Class.create();
PayloadOrchestratorService.prototype = {
    initialize: function() {
        this._logger = new LoggingUtil();
        this.payloadProcessor = new PayloadProcessor();
        this.entitlementAttachmentReader = new EntitlementAttachmentReader();
        this.licDebugLog = gs.getProperty(LicensingEngineConstants.PROP_COM_GLIDE_LICENSING_DEBUG, false);
        this._instanceInfoUtil = new InstanceInfoUtil();
        this.orderedListOfValidEntitlementPayloadFiles = [
            LicensingEngineConstants.FILE_NAMES.METADATA,
            LicensingEngineConstants.FILE_NAMES.TABLE_STATS_DEFINITION,
            LicensingEngineConstants.FILE_NAMES.GCF_DEFINITION,
            LicensingEngineConstants.FILE_NAMES.INSTANCE_INFO,
            LicensingEngineConstants.FILE_NAMES.APP_LINEAGE,
            LicensingEngineConstants.FILE_NAMES.EVENT_REGISTRY,
            LicensingEngineConstants.FILE_NAMES.SUBSCRIPTION_ENTITLEMENT,
            LicensingEngineConstants.FILE_NAMES.ENTITLEMENT_DISPLAY_DETAILS,
            LicensingEngineConstants.FILE_NAMES.LICENSING_ROLES,
            // Process custom table exemption information payload after entitlement processing as preProcessing requires subscription_has_family information
            LicensingEngineConstants.FILE_NAMES.EXEMPTION_INFO
        ];
        this.logMessages = {
            // initialized based on user's locale using gs.getMessage()

            //Exception or error messages
            'INVALID_ATTACHMENT_PAYLOAD': gs.getMessage('No valid attachments found.'),
            'SKIP_IMPORT': gs.getMessage('No entitlement data will be imported.')

        };

        // initialized based on user's locale using gs.getMessage()
        this.doNotImportReasons = {};
        this.doNotImportReasons[LicensingEngineConstants.DONOT_IMPORT_REASONS.NOT_SELF_HOSTED] = gs.getMessage("This instance is not a self-hosted instance.");
        this.doNotImportReasons[LicensingEngineConstants.DONOT_IMPORT_REASONS.NOT_MAINT] = gs.getMessage("This instance is not self-hosted instance, and user does not have sufficient privileges.");
        this.doNotImportReasons[LicensingEngineConstants.DONOT_IMPORT_REASONS.NOT_SMV2] = gs.getMessage("This instance is still using Subscription Management v1 and has not migrated to Subscription Management v2.");
    },

    processPayloadAndReturnSummary: function(entitlementImportedDataRecordSysID) {
        return this._processPayloadAndGenerateStatusSummary(entitlementImportedDataRecordSysID);
    },

    _translateDoNotImportReason: function(reason) {
        const r = this.doNotImportReasons[reason];
        if (!r)
            return reason;
        return r;
    },

    _processPayloadAndGenerateStatusSummary: function(entitlementImportedDataRecordSysID) {
        let payloadProcessStatusSummary = [];

        const importDecision = new LicensingEngineCommonUtil().shouldImportLicensingDataAndReturnReason();
        if (importDecision.shouldImport === false) {
            const message = this.logMessages['SKIP_IMPORT'] + " " + this._translateDoNotImportReason(importDecision.reason);
            payloadProcessStatusSummary.push(this._createLogObject('error', message));
            return payloadProcessStatusSummary;
        }

        try {
            payloadProcessStatusSummary = this._processEntitlementPayloadSequentially(entitlementImportedDataRecordSysID);
            this._logIfDebuggingSetToTrue('_processPayloadAndGenerateStatusSummary', 'Summary after processing the entitlement payload process for on-prem instance: ', JSON.stringify(payloadProcessStatusSummary));
            return payloadProcessStatusSummary;
        } catch (ex) {
            this._logger.logError(this.type, '_processPayloadAndGenerateStatusSummary', "Exception occurred while importing data " + ex.message + " " + ex.stack);
            payloadProcessStatusSummary.push(this._createLogObject('error', gs.getMessage("An exception occurred while the importing data - {0}", [ex.message + " " + ex.stack])));
        }

        return payloadProcessStatusSummary;
    },

    validateRequestAndCaptureLogOnFailure: function() {
        if (!new LicensingEngineCommonUtil().shouldImportLicensingData()) {
            const message = this.logMessages['INVALID_REQUEST'];
            this._logger.logInfo(this.type, "validateRequestAndCaptureLogOnFailure", message);
            return false;
        }
        return true;
    },

    validateMetadataInformationAndThrowErrorOnFailure: function(attachmentInfo) {
        const fileName = LicensingEngineConstants.FILE_NAMES.METADATA;
        const sysAttachmentRecordSysID = attachmentInfo[fileName];
        if (gs.nil(sysAttachmentRecordSysID)) {
            throw new Error(gs.getMessage('Unable to find attachment with file name: {0}', [fileName]));
        }

        const metadata = new EntitlementAttachmentReader().getAttachmentContent(sysAttachmentRecordSysID);
        const {
            instanceName,
            instanceId,
            releaseName
        } = JSON.parse(metadata.payload || "{}");

        const metadataValues = [instanceName, instanceId, releaseName];
        const metadataValuesCount = metadataValues.length;

        // check for falsey values like null and undefined
        if (metadataValues.filter(Boolean).length < metadataValuesCount) {
            throw new Error(gs.getMessage('instanceName: {0}, instanceId: {1} and releaseName {2} cannot be null or undefined', metadataValues));
        }

        const targetInstanceName = this._instanceInfoUtil.getInstanceName();
        const targetInstanceId = this._instanceInfoUtil.getInstanceId();
        let targetReleaseName = this._instanceInfoUtil.getInstanceReleaseName();

        const paramsToBeChecked = [
            [instanceName, targetInstanceName, gs.getMessage("Entitlement data being imported is for a different instance based on the instance_name. This instance has {0} but the data was exported for {1}.", [targetInstanceName, instanceName])],
            [instanceId, targetInstanceId, gs.getMessage("Entitlement data being imported is for a different instance based on the instance_id. This instance has {0} but the data was exported for {1}.", [targetInstanceId, instanceId])]
        ];

        // check only if not disabled by sys_properties
        if (!this._isInstanceReleaseNameCheckDisabled()) {
            // ignore check for internal instance, ie. no value or release name starts with HEAD
            if (!(!targetReleaseName || targetReleaseName.startsWith("HEAD"))) {
                paramsToBeChecked.push([releaseName, targetReleaseName, gs.getMessage("Entitlement data being imported is for {0} release family but this instance is on {1} release family.", [releaseName, targetReleaseName])]);
            }
        }

        paramsToBeChecked.forEach(function([source, target, message]) {
            const matched = String(source).toLowerCase() === String(target).toLowerCase();
            if (!matched) {
                throw new Error(message);
            };
        });
    },

    _logIfDebuggingSetToTrue: function(methodName, logMessage, logObject) {
        if (this.licDebugLog == 'true')
            this.logger.logInfo(this.type, methodName, logMessage + JSON.stringify(logObject));
    },

    _processEntitlementPayloadSequentially: function(entitlementImportedDataRecordSysID) {
        let consolidatedPayloadProcessSummary = [];
        const attachmentInfo = this.entitlementAttachmentReader.retrieveAttachmentInfoForFiles(entitlementImportedDataRecordSysID, this.orderedListOfValidEntitlementPayloadFiles);

        if (global.LicensingScriptUtil.isEmpty(attachmentInfo)) {
            consolidatedPayloadProcessSummary.push(this._createLogObject('error', this.logMessages['INVALID_ATTACHMENT_PAYLOAD']));
            return consolidatedPayloadProcessSummary;
        }

        try {
            this.validateMetadataInformationAndThrowErrorOnFailure(attachmentInfo);
        } catch (e) {
            const errorMessage = e.message;
            this._logger.logError(this.type, '_processEntitlementPayloadSequentially', errorMessage);

            consolidatedPayloadProcessSummary.push(this._createLogObject('error', errorMessage));

            return consolidatedPayloadProcessSummary;
        }

        this.orderedListOfValidEntitlementPayloadFiles.forEach(fileName => {
            try {
                const sysAttachmentRecordSysID = attachmentInfo[fileName];
                const attachmentProcessResult = this.payloadProcessor.processPayloadAndGenerateProcessSummary(fileName, sysAttachmentRecordSysID);

                if (gs.nil(attachmentProcessResult)) {
                    consolidatedPayloadProcessSummary.push(this._createLogObject('error', gs.getMessage('The attachment data cannot be processed for attachment file name: {0} attachmentSysId: {1}.', [fileName, sysAttachmentRecordSysID])));
                }
                consolidatedPayloadProcessSummary.push(attachmentProcessResult);
            } catch (ex) {
                this._logger.logError(this.type, '_processEntitlementPayloadSequentially', "Exception occurred while importing file name " + fileName + " " + ex.message + " " + ex.stack);
                consolidatedPayloadProcessSummary.push(this._createLogObject('error', gs.getMessage("An exception occurred while importing the file {0}. Exception {1}", [fileName, ex.message + " " + ex.stack])));
            }
        });

        return consolidatedPayloadProcessSummary;
    },

    _createLogObject: function(status, message) {
        const newLogObj = {
            'status': status,
            'message': message
        };
        return newLogObj;
    },

    _isInstanceReleaseNameCheckDisabled: function() {
        return gs.getProperty("sn_entitlement.importer.release_name_check.disabled") === "true";
    },

    type: 'PayloadOrchestratorService'
};
