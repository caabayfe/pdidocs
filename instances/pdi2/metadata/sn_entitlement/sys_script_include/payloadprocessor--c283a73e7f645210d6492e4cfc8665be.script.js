var PayloadProcessor = Class.create();
PayloadProcessor.prototype = {
    initialize: function() {
        this.logMessages = {
            // initialized based on user's locale using gs.getMessage()

            //validation log messages
            'VALID_REQUEST': gs.getMessage('Input request is valid. The request can be processed.'),
            'FILE_NAME_OF_PAYLOAD_MISSING': gs.getMessage('The processors cannot be invoked because the file name is empty'),            
        };

        this.entitlementPayloadProcessorMap = {
            //Entitlement Payload
            [LicensingEngineConstants.FILE_NAMES.ENTITLEMENT_DISPLAY_DETAILS]: (sysID) => new EntitlementsDisplayDetailsDownloader().processEntitlementsDisplayDetails(sysID),
            [LicensingEngineConstants.FILE_NAMES.EXEMPTION_INFO]: (sysID) => new CustomTableInventoryProcessor().processExemptedEntities(sysID),
            [LicensingEngineConstants.FILE_NAMES.SUBSCRIPTION_ENTITLEMENT]: (sysID) => new EntitlementDownloader().processEntitlements(sysID),
            [LicensingEngineConstants.FILE_NAMES.INSTANCE_INFO]: (sysID) => new sn_lef.SelfHostedInstanceAPIProcessor().processInstanceInfo(sysID),
            [LicensingEngineConstants.FILE_NAMES.APP_LINEAGE]: (sysID) => new sn_lef.SelfHostedInstanceAPIProcessor().processAppFamilies(sysID),
            [LicensingEngineConstants.FILE_NAMES.EVENT_REGISTRY]: (sysID) => new sn_lef.SelfHostedInstanceAPIProcessor().processEventRegistryInfo(sysID),
            [LicensingEngineConstants.FILE_NAMES.LICENSING_ROLES]: (sysID) => new sn_lef.SelfHostedInstanceAPIProcessor().processRoleInfo(sysID),

            //Usage Payload
            [LicensingEngineConstants.FILE_NAMES.GCF_DEFINITION]: (sysID) => this.processGcfDefinition(sysID),
            [LicensingEngineConstants.FILE_NAMES.TABLE_STATS_DEFINITION]: (sysID) => this.processTableStatsDefinition(sysID),

			// others
            [LicensingEngineConstants.FILE_NAMES.METADATA]: (sysID) => sysID
        };
    },

    processPayloadAndGenerateProcessSummary: function(fileName, sysAttachmentRecordSysID) {
        try {
            const logObject = this._validateInputAndCreateLogObject(fileName, sysAttachmentRecordSysID);
            if (logObject.status === 'error')
                return logObject;
            return this._invokeEntitlementProcessorsAndLog(fileName, sysAttachmentRecordSysID);
        } catch (ex) {
            return this._createLogObject('error', gs.getMessage('An exception occurred while processing file {0}. Exception - {1}', [fileName, ex.message + " " + ex.stack]));
        }
    },

    _validateInputAndCreateLogObject: function(fileName, sysAttachmentRecordSysID) {
        if (global.LicensingScriptUtil.nil(fileName)) {
            return this._createLogObject('error', this.logMessages['FILE_NAME_OF_PAYLOAD_MISSING']);
        }

        if (global.LicensingScriptUtil.nil(sysAttachmentRecordSysID)) {
            return this._createLogObject('error', gs.getMessage('Unable to find attachment with file name: {0}', [fileName]), [fileName]);
        }

        return this._createLogObject('success', this.logMessages['VALID_REQUEST']);
    },

    _invokeEntitlementProcessorsAndLog: function(fileName, sysAttachmentRecordSysID) {
        const payloadProcessor = this.entitlementPayloadProcessorMap[fileName];
        if (payloadProcessor)
            return payloadProcessor(sysAttachmentRecordSysID);
        return this._createLogObject('error', gs.getMessage('No processor found for file name: {0}', [fileName]));
    },

    processGcfDefinition: function(sysAttachmentRecordSysID) {
        if (new sn_lef.SelfHostedInstanceAPIProcessor().processGCFDefn) {
            return new sn_lef.SelfHostedInstanceAPIProcessor().processGCFDefn(sysAttachmentRecordSysID);
        }

        const gcfDefinitionMap = new EntitlementAttachmentReader().getAttachmentContent(sysAttachmentRecordSysID);
        if (!gs.nil(gcfDefinitionMap)) {
            var gcfDownloader = new sn_gcf_ns.GCFDefinitionDownloader();
            gcfDownloader.processLicensingGCFDefn(gcfDefinitionMap.payload);
            // processLicensingGCFDefn is void function. Its not possible to capture if there has been any failure with gcf definition import
        } else {
            return new LicensingEngineCommonUtil().processedWithFailure("GCF Definition payload is empty.");
        }
        return new LicensingEngineCommonUtil().processedSuccessfully();
    },

    processTableStatsDefinition: function(sysAttachmentRecordSysID) {
        if (new sn_lef.SelfHostedInstanceAPIProcessor().processTableStatsDefn) {
            return new sn_lef.SelfHostedInstanceAPIProcessor().processTableStatsDefn(sysAttachmentRecordSysID);
        }
        const tableStatsDefinition = new EntitlementAttachmentReader().getAttachmentContent(sysAttachmentRecordSysID);
        if (!gs.nil(tableStatsDefinition) && !gs.nil(tableStatsDefinition.payload)) {
            new global.LicensingEngineGlobalHelper().processLicensingStatsDefn(tableStatsDefinition.payload);
            // processLicensingStatsDefn is void function. Its not possible to capture if there has been any failure with gcf definition import
        } else {
            return new LicensingEngineCommonUtil().processedWithFailure("TableStats Definition payload is empty.");
        }
        return new LicensingEngineCommonUtil().processedSuccessfully();
    },

    _createLogObject: function(status, message) {
        const newLogObj = {
            'status': status,
            'message': message
        };
        return newLogObj;
    },

    type: 'PayloadProcessor'
};
