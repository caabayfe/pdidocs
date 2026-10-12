var CodeSigningUtil = Class.create();

var SIGNING_JOB_TABLE = 'sys_signing_job';
var REMOTE_UPDATE_SET_TABLE = 'sys_remote_update_set';
var UPDATE_PREVIEW_PROBLEM_TABLE = 'sys_update_preview_problem';
var SYS_UPDATE_SET = "sys_update_set";

var NAME = 'name';

var STARTSWITH = 'STARTSWITH';
var ENDSWITH = 'ENDSWITH';
var IN = 'IN';

var MIGRATION_JOB_PREFIX = 'Migrate Specific';

var TYPE = 'type';
var STATE = 'state';
var NEW = 'new';
var WORKING = 'working';
var PAUSING = 'pausing';
var STATES_TO_BE_CANCELLED = [NEW, WORKING, 'quiescent', PAUSING, 'paused'];
var CANCELLED = 'cancelled';

var CODE_SIGNING_SOURCE = 'Code Signing';
var CODE_SIGNING_OPT_IN_PROPERTY = 'com.snc.kmf.signature.validation.optin';

var CODESIGNING_ENTERPRISE_APPLICATION_SYSID = 'ef80b6f7771031108287cffbae5a9928';
var CODESIGNING_CONFIGURATION_BATCH_UPDATE_SET_NAME = 'Codesigning configuration';
var MIGRATIONJOB_SYSID_FROM_UIB = 'migrationJobSysIdFromUIB'; // name used to persist migration job sys id from UIB in codesigning metadata table
var CERT_TYPE_SERVICENOW = 'ServiceNow';
var CERT_TYPE_THIRDPARTY = '3rd Party';
var CERT_STATUS_VALID = 'Valid';
var CERT_STATUS_INVALID = 'Invalid';
var CERT_STATUS_EXPIRED = 'Expired';
var CERT_STATUS_EXPIRING_SOON = 'Expiring soon';

var ACTION_ACCEPT_REMOTE = '43d7d01a97b00100f309124eda2975e4';
CodeSigningUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    getSignatureConfigFilter: function(table) {
        var configFilter = [];
        var config = new GlideRecord("sn_kmf_signature_configuration");
        config.addQuery("table_name", table);
        config.addQuery("sign_attachment", false);
        config.query();
        while (config.next()) {
            configFilter.push(config.getValue("signature_gen_filter"));
        }
        if (configFilter.length > 1) {
            //in case of multiple configuration records for a given table, OR the configFilters, then remove ^EQ from every filter and append it at the end
            configFilter = configFilter.join("^OR");
            configFilter = configFilter.replaceAll("^EQ", "") + "^EQ";
        }
        return configFilter;
    },
    getNumberOfRecordsInSlushBucketProperty: function() {
        return new SNC.CodeSigningSlushBucketPropertyUtility().getNumberOfRecordsInSlushBucket();
    },
    getRecordsForSigning: function() {
        var gp = [];
        var tableName = this.getParameter("sysparm_table_name");
        var condition = this.getParameter("sysparm_conditions");
        if (gs.nil(tableName))
            return;
        var configFilter = this.getSignatureConfigFilter(tableName);
        var gr = new GlideRecord(tableName);
		gr.addEncodedQuery("sys_class_name=" + tableName + "^EQ");
        if (!gs.nil(configFilter))
            gr.addEncodedQuery(configFilter);
        if (!gs.nil(condition))
            gr.addEncodedQuery(condition + "^EQ");
        var numberOfRecordsLimit = parseInt(this.getNumberOfRecordsInSlushBucketProperty());
        gr.setLimit(numberOfRecordsLimit);
        gr.query();
        while (gr.next()) {
            gp.push(this.getRecordJSON(gr));
        }
        var result = this.newItem("result");
        result.setAttribute("record", JSON.stringify(gp));
    },
    getRecordJSON: function(gr) {
        var record = {};
        record.displayValue = gr.getDisplayValue();
        record.sys_id = gr.getValue("sys_id");

        if (gs.nil(record.displayValue))
            record.displayString = "{no_display_value} [{0}]".replace("{0}", record.sys_id);
        else
            record.displayString = gs.getMessage("{0} [{1}]", [record.displayValue, record.sys_id]);

        return record;
    },

    isAttestModuleCertificatePresent: function() {
        var activeAttestCertSysId = new global.CodeSigningSignatureMigrationAPI().getActiveKMFVerifyCertSysId("75bdd8c2c70111109d59fa49f4c26031");
        if (gs.nil(activeAttestCertSysId))
            return false;
        return true;
    },

    isModuleCertificateValid: function(moduleSysId) {
        var activeModuleCertSysId = new global.CodeSigningSignatureMigrationAPI().getActiveKMFVerifyCertSysId(moduleSysId);
        if (gs.nil(activeModuleCertSysId))
            return false;
        return new SNC.CertificateValidator().checkModuleCertificateValidity(moduleSysId, activeModuleCertSysId);
    },

    isServiceNowRootOfTrustDisabled: function() {
        return gs.getProperty("com.snc.csf.servicenow_root_of_trust.disabled");
    },
    isServiceNowRoTDisableWithRequiredCerts: function() {
        var obj = {};
        obj.rot = this.isServiceNowRootOfTrustDisabled();
        obj.attestModuleCertificatePresent = this.isAttestModuleCertificatePresent();
        // checks validity of cm_code_attest module certificate
        obj.attestModuleCertificateValid = this.isModuleCertificateValid("75bdd8c2c70111109d59fa49f4c26031");
        obj.codeSigningModuleCertificatePresent = this.isCodeSigningModuleCertificatePresent();
        // checks validity of cm_code_signing module certificate
        obj.codeSigningModuleCertificateValid = this.isModuleCertificateValid("a3123fddc32310101109046f5e40dd3e");
        obj.isCodeSigningEnabled = this.isCodeSigningEnabled();
        return JSON.stringify(obj);
    },
    isCodeSigningModuleCertificatePresent: function() {
        var activeCodeSigningCertSysId = new global.CodeSigningSignatureMigrationAPI().getActiveKMFVerifyCertSysId("a3123fddc32310101109046f5e40dd3e");
        if (gs.nil(activeCodeSigningCertSysId))
            return false;
        return true;
    },

    verifyCertTrusted: function(certGr) {
        if (gs.nil(certGr)) {
            gs.info("The certificate record cannot be null");
            return false;
        }

        return new SNC.CertificateValidator().verifyCertTrusted(certGr);
    },

    isCodeSigningEnabled: function() {
        return gs.getProperty('com.snc.kmf.signature.validation.flag') === 'true';
    },

    isCodeSigningOpted: function() {
        return gs.getProperty(CODE_SIGNING_OPT_IN_PROPERTY) === 'true';
    },

    cancelAllNewMigrationJobs: function() {
        var signingJobGr = new GlideRecord(SIGNING_JOB_TABLE);
        signingJobGr.addQuery(NAME, STARTSWITH, MIGRATION_JOB_PREFIX);
        signingJobGr.addQuery(STATE, IN, STATES_TO_BE_CANCELLED);
        signingJobGr.query();
        var numberOfUncancelledJobs = 0;
        // if a job is working or pausing, let it finish
        // numberOfUncancelledJobs will be the number of migration jobs that weren't successfully cancelled
        while (signingJobGr.next()) {
            if (signingJobGr.getValue(STATE) == WORKING || signingJobGr.getValue(STATE) == PAUSING) {
                gs.error(gs.getMessage('Unable to cancel running signature migration job with sys id {0}', signingJobGr.getUniqueValue()), CODE_SIGNING_SOURCE);
                numberOfUncancelledJobs++;
                continue;
            }
            signingJobGr.setValue(STATE, CANCELLED);
            var updateId = signingJobGr.update();
            if (updateId == null) {
                gs.error(gs.getMessage('Unable to cancel existing signature migration job'), CODE_SIGNING_SOURCE);
                numberOfUncancelledJobs++;
            } else
                gs.log(gs.getMessage('Cancelled signature migration job with sys id: {0}', updateId), CODE_SIGNING_SOURCE);
        }
        return numberOfUncancelledJobs;
    },

    getStateOfSignatureMigrationJob: function(jobSysId) {
        var signingJobGr = new GlideRecord(SIGNING_JOB_TABLE);
        if (!signingJobGr.get(jobSysId))
            return null;
        return signingJobGr.getValue(STATE);
    },

    startAllNewSignatureMigrationJobs: function() {
        var startedJobSysIds = [];
        var signingJobGr = new GlideRecord(SIGNING_JOB_TABLE);
        signingJobGr.addQuery(NAME, STARTSWITH, MIGRATION_JOB_PREFIX);
        signingJobGr.addQuery(STATE, NEW);
        signingJobGr.query();

        while (signingJobGr.next()) {
            new SNC.MassEncryptionJob().start(signingJobGr);
            startedJobSysIds.push(signingJobGr.getUniqueValue());
            gs.log(gs.getMessage('Started signature migration job with sys id: {0}', signingJobGr.getUniqueValue()), CODE_SIGNING_SOURCE);
        }
        return startedJobSysIds;
    },

    shouldDisplayKnownConflictsActionUI: function(updateSetName) {
        return this.isCodeSigningOpted() && (updateSetName.contains("configuration") || updateSetName.contains("SigUpSet"));
    },

    resolveCSKnownConflicts: function(updateSetSysId) {
        var remoteGrParent = new GlideRecord(REMOTE_UPDATE_SET_TABLE);
        if (!remoteGrParent.get(updateSetSysId)) {
            gs.error(gs.getMessage("Unable to find the remote update set with sys_id: {0}.", [updateSetSysId]));
            return;
        }
        var parentUpdateSetName = remoteGrParent.getValue('name');

        // get all the child update sets
        var remoteGr = new GlideRecord(REMOTE_UPDATE_SET_TABLE);
        remoteGr.addQuery('parent', updateSetSysId);
        remoteGr.setWorkflow(false);
        remoteGr.query();

        // collect all the update set sys ids for resolving conflicts
        var updateSetsSysIds = [];
        updateSetsSysIds.push(updateSetSysId); // parent update set
        while (remoteGr.next()) {
            updateSetsSysIds.push(remoteGr.getValue('sys_id'));
        }

        var gr = new GlideRecord(UPDATE_PREVIEW_PROBLEM_TABLE);
        gr.addQuery("remote_update_set", IN, updateSetsSysIds);
        gr.addNullQuery("status");
        gr.setWorkflow(false);
        gr.query();

        var action = new GlideAction(ACTION_ACCEPT_REMOTE); // accept remote updates

        var knownIssuesCount = 0;
        var totalCount = gr.getRowCount();

        while (gr.next()) {
            // accept remote changes for wild card purpose for the record signature table
            if (gr.getValue("type") == "error" && gr.getValue("status") == null &&
                gr.getValue("missing_item_table") == "sn_kmf_signature_purpose" && gr.getValue("missing_item") == "wild_card_purpose") {
                var ppa = new GlidePreviewProblemAction(action, gr);
                ppa.ignoreProblem();
                knownIssuesCount += 1;
            }
        }

      var message = "";
      if (knownIssuesCount > 0)
          message = gs.getMessage("Resolved all the known Code Signing merge conflicts. Please refer to KB0555767 for more details.");

      if (totalCount == knownIssuesCount)
          message += gs.getMessage(" Please proceed to commit the update set, '{0}'.", parentUpdateSetName);

      gs.log(message, CODE_SIGNING_SOURCE);
      return message;
    },

	shouldDisplayScanSignaturesActionUI: function() {
        return this.isCodeSigningOpted();
    },

	scanUpdateSetForSignatures: function(updateSetSysId, tableName) {
		var tracker = SNC.GlideExecutionTracker.getLastRunning();
		tracker.updateMessage(gs.getMessage('Scanning..'));
		tracker.incrementPercentComplete(25);
		//gs.sleep(1000);

		new sn_cs_ns.CodeSigningAPI().scanUpdateSetForSignatures(updateSetSysId, tableName);

		tracker.incrementPercentComplete(100);
		tracker.success( gs.getMessage("Signature scan completed"));
	},

    createAndDownloadBatchUpdateSet: function(updateSets, actionType) {
        try {
            var result = {
                'succeeded': false,
                'redirectURL': '',
                'error_message': ''
            };

            if (gs.nil(updateSets) || updateSets.length == 0)
                throw new Error('Empty/Null update sets to create batch update set');

            //get migration job update sets
			if (actionType !== 'turn_off_cs') {
				var migrationJobUpdateSets = this._getMigrationJobUpdateSets();
				if (migrationJobUpdateSets.length != 0)
					updateSets = updateSets.concat(migrationJobUpdateSets);
			}

            var parentUpdateSetSysId = this._createParentUpdateSet();
            if (gs.nil(parentUpdateSetSysId))
                throw new Error('Failed to create codesigning configuration update set');

            this._setParentUpdateSysId(parentUpdateSetSysId, updateSets);

            // mark parent update set as complete
            var gr = new GlideRecord(SYS_UPDATE_SET);
            if (gr.get(parentUpdateSetSysId)) {
                gr.setValue(STATE, 'complete');
                if (gs.nil(gr.update()))
                    throw new Error("Failed to mark Codesigning configuration update set with sysid: " + parentUpdateSetSysId + " as complete");
            }

            //export and download batch update set
            var updateSetExport = new UpdateSetExport();
            var sysid = updateSetExport.exportHierarchy(gr);

			//delete the update set prefix so it won't be picked up again
			new sn_cse.CodeSigningConfigurationUtil().deleteTrustedTaskUpdateSetPrefix();
            
			result.redirectURL = "export_base_update_set.do?sysparm_sys_id=" + sysid + "&sysparm_delete_when_done=true&sysparm_is_remote=false&sysparm_ck=" + gs.getSessionToken();
            result.succeeded = true;
        } catch (e) {
            gs.error('Error occurred while creating batch update set: ' + e.toString(), CODE_SIGNING_SOURCE);
            result.error_message = e.toString();
        }
        return result;
    },

    _getMigrationJobUpdateSets: function() {
        var migrationJobUpdateSets = [];
        var updateSetPrefix = new sn_cse.CodeSigningConfigurationUtil().getTrustedTaskUpdateSetPrefix();
		if(updateSetPrefix == '') {
			return migrationJobUpdateSets;
		}
        
		var gr = new GlideRecord(SYS_UPDATE_SET);
        gr.addQuery(NAME, STARTSWITH, updateSetPrefix);
        gr.query();
        while(gr.next()) {
			migrationJobUpdateSets.push(gr.getValue(NAME));
		}
        
		return migrationJobUpdateSets;
    },

    _createParentUpdateSet: function() {
        var gr = new GlideRecord(SYS_UPDATE_SET);
        gr.initialize();
        gr.setValue(NAME, CODESIGNING_CONFIGURATION_BATCH_UPDATE_SET_NAME);
        gr.setValue('application', CODESIGNING_ENTERPRISE_APPLICATION_SYSID);
        return gr.insert();
    },

    _setParentUpdateSysId: function(parentUpdateSetSysId, childNames) {
        var grChild = new GlideRecord(SYS_UPDATE_SET);
        grChild.addQuery(NAME, IN, childNames);
        grChild.query();
        while (grChild.next()) {
            // Set the parent field of the child update set to the sys_id of the parent update set
            grChild.parent = parentUpdateSetSysId;
            if (gs.nil(grChild.update()))
                throw new Error('Failed to update child update set: ' + grChild.getValue('name') + 'with parent updatesetSysId: ' + parentUpdateSetSysId);
        }
    },

	fetchCertificateUsedToSignCoTJob: function(jobSysId) {
		if (gs.nil(jobSysId)) {
			gs.error("fetchCertificateUsedToSignCoTJob: jobSysId is null", CODE_SIGNING_SOURCE);
			return null;
		}

		return new SNC.CertificateValidator().getCertificateUsedToSignCOTJob(jobSysId);
	},

	installTrustedCSCertificate: function(certGR) {
		if (gs.nil(certGR)) {
			gs.error("installTrustedCSCertificate: certGR is null", CODE_SIGNING_SOURCE);
			return null;
		}

		var certificateValidatorApi = new SNC.CertificateValidator();

		// before installing the certificate, check if it's already installed as trusted CS certificate
		var res = JSON.parse(certificateValidatorApi.validateCircleOfTrustCert(certGR));
		if (res.success === 'true') {
			gs.debug(gs.getMessage("Cerificate with id: {0} is already installed as a trusted CS cert", [certGR.getValue('sys_id')]), CODE_SIGNING_SOURCE);
			return JSON.stringify(res);
		}

		return certificateValidatorApi.installCircleOfTrustCert(certGR);
	},

	isCertificateReadyForCodeSigning: function(certSysId) {
		if (gs.nil(certSysId))
			gs.error(gs.getMessage('CodeSigningUtil.isCertificateReadForCodeSigning executed on null id.'), CODE_SIGNING_SOURCE);
		var verifierApi = new SNC.CertificateValidator();
		return verifierApi.isCircleOfTrustCert(certSysId) && verifierApi.isValidatedCodeSigningLeafCert(certSysId);
	},

    //This method is used to get the certificate type(ServiceNow/3rd Party) for a codesigning certificate
	getCertificateType: function(cryptoModules, issuer) {
        var certType = "";
		if(cryptoModules.length > 0 || !issuer) {
			certType = CERT_TYPE_THIRDPARTY;
		} else {
			//issuer can have the value: OU=ServiceNow KMF or CN=DigiCert Trusted G4 Code Signing RSA4096 SHA384 2021 CA1, O="DigiCert, Inc.", C=US
			var fields = issuer.split(",");
			for(var i = 0; i < fields.length; i++) {
				var tokens = fields[i].split("=");
				if(!tokens && tokens.length < 2) {
					continue;
				}
				var name = tokens[0];
				var value = tokens[1];

				if(name == "OU" && value.includes("ServiceNow")) {
					certType = CERT_TYPE_SERVICENOW;
					break;
				} else if(name == "CN" && (value.includes("ServiceNow") || value.includes("DigiCert"))) {
					certType = CERT_TYPE_SERVICENOW;
					break;
				}
			}

			if(certType == "") {
				certType = CERT_TYPE_THIRDPARTY;
			}
    	}
		
		return certType;
	},

    //This method is used to get the associated crypto modules for a codesigning certificate
	getCryptoModulesForCertificate: function(certId) {
		var cryptoModules = [];
		var cryptoModuleId = "";
		var cryptoModuleName = "";

		var moduleKeyGr = new GlideRecord("sys_kmf_module_key");
		moduleKeyGr.addQuery("certificate", certId);
		moduleKeyGr.addQuery("key_lifecycle_state", "active");
		moduleKeyGr.query();

		while (moduleKeyGr.next()) {
			cryptoModuleId = moduleKeyGr.getValue("crypto_module");
			var crytoGr = new GlideRecord("sys_kmf_crypto_module");
			crytoGr.addQuery("sys_id", cryptoModuleId);
			crytoGr.query();
			if (crytoGr.next()) {
				cryptoModuleName = crytoGr.getValue("name");
				var cryptoModule = {
					name: cryptoModuleName,
					id: cryptoModuleId
				};
				cryptoModules.push(cryptoModule);
			}
		}

    	return cryptoModules;
	},

    //This method is used to get the status(Valid/Invalid/Expird/Expiring soon) for a codesigning certificate
	getCertificateStatus: function(certificateGR) {
		var certStatus = "";
		var isActive = certificateGR.getValue("active");
		
		if(isActive == "false") {
			certStatus = CERT_STATUS_INVALID;
		} else {
			var expiresInDays = certificateGR.getValue("expires_in_days");
			var warnInDaysToExpire = certificateGR.getValue("warn_in_days_to_expire");
			if(expiresInDays && warnInDaysToExpire) {
				var daysToExpire = 	parseInt(expiresInDays) - parseInt(warnInDaysToExpire);
				if(expiresInDays <= 0) {
					certStatus = CERT_STATUS_EXPIRED;	
				} else if(daysToExpire <= 0) {
					certStatus = CERT_STATUS_EXPIRING_SOON;	
				} else {
					certStatus = CERT_STATUS_VALID;
				}
			} else {
				certStatus = CERT_STATUS_VALID;
			}
		}

		return certStatus;
	},

	processUpdateSets: function (batchUpdateSetIds) {
		var redirectionList = [];
		batchUpdateSetIds.forEach(function(id) {
			var updateSetGr = new GlideRecord(SYS_UPDATE_SET);
			if (updateSetGr.get(id)) {
				var updateSetExport = new UpdateSetExport();
				var sysid = updateSetExport.exportHierarchy(updateSetGr);
				redirectionList.push("export_base_update_set.do?sysparm_sys_id=" + sysid + "&sysparm_delete_when_done=true&sysparm_is_remote=false&sysparm_ck=" + gs.getSessionToken());
			}
		});

		return redirectionList;
	},

    type: 'CodeSigningUtil'
});
