var SubAccountsDiscoveryAjax = Class.create();

SubAccountsDiscoveryAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	ajaxFunction_triggerMemberAccountsDiscovery: function() {
		try {
			var credentialSysId = this.getParameter('sysparm_service_account_credential_sys_id'),
				serviceAccountId = this.getParameter('sysparm_service_account_id'),
				datacenterType = this.getParameter('sysparm_service_account_datacenter_type'),
				serviceAccountSysId = this.getParameter('sysparm_service_account_sys_id'),
				datacenterUrl = this.getParameter('sysparm_service_account_datacenter_url'),
				answerObject = {};

			var cloudProvider = "",
				subAccountsDiscoveryPatternSysId = "" ;
			if (datacenterType == 'cmdb_ci_aws_datacenter')
				cloudProvider = 'AWS';
			else if (datacenterType == 'cmdb_ci_azure_datacenter')
				cloudProvider = 'Azure';
			else if (datacenterType == 'cmdb_ci_google_datacenter')
				cloudProvider = 'Google';
			else {
				answerObject.errorMessage = gs.getMessage('Please select a valid cloud provider.');
				return JSON.stringify(answerObject);
			}

			// Shouldn't happen
			if (!serviceAccountId) {
				answerObject.errorMessage = gs.getMessage('Missing account id');
				return JSON.stringify(answerObject);
			}

            var invocationContext = {};
            invocationContext['service_account_id'] = serviceAccountId;

			var midServerSysId = (new CloudMidSelectionApi()).selectMid('Discovery', cloudProvider, '', JSON.stringify(invocationContext));
			var midServerGlideRecord = new GlideRecord('ecc_agent');

			if (!midServerSysId || !midServerGlideRecord.get(midServerSysId)){
				answerObject.errorMessage = gs.getMessage('No MID found');
				return JSON.stringify(answerObject);
			}
			var preExecutionDataObject = new SNC.PrePatternExecutionData(),
				discoveryStatus = this.createDiscoveryStatus(),
				probeParams = { agent_correlator: discoveryStatus },
				probeValues = { ecc_high_priority: true },
				patternLauncher = new SNC.PatternLauncherManager();


			if (cloudProvider == 'AWS') {
				subAccountsDiscoveryPatternSysId = 'ff9b1a44672703008ec4a4db2685ef68';  //Pattern - Amazon AWS Organization
				preExecutionDataObject.addString('serviceAccountId', serviceAccountId);
				preExecutionDataObject.addString('credentialSysId', credentialSysId);
				preExecutionDataObject.addString('datacenter_url', datacenterUrl);
			} else if (cloudProvider == 'Azure') {
				subAccountsDiscoveryPatternSysId = '361bdd2c531b001046dfddeeff7b1271'; // Pattern - Azure Subscriptions Discovery For Management group
				this._buildPPE(serviceAccountId,preExecutionDataObject);
			} else if (cloudProvider == 'Google') {
				subAccountsDiscoveryPatternSysId = 'ee00609867d0001022646c706785efe0'; // Pattern - Google Cloud Platform (GCP) - Discover Related Projects
				this._buildPPE(serviceAccountId,preExecutionDataObject);
			}

			patternLauncher.launchPattern(discoveryStatus, '', midServerGlideRecord.name + '', 'No Source', subAccountsDiscoveryPatternSysId, probeParams, probeValues, preExecutionDataObject);
			answerObject.discoveryStatus = discoveryStatus;
			answerObject.inputEccQueueSysId = this.getInputEccQueueSysId(discoveryStatus);
			answerObject.agent = midServerGlideRecord.name + '';
			answerObject.cloudProvider = cloudProvider;
			return JSON.stringify(answerObject);
		} catch (e) {
			answerObject.errorMessage = e.message;
			return JSON.stringify(answerObject);
		}
	},

	_buildPPE: function(serviceAccountId,ppe) {
		if (serviceAccountId) {
			var gr = new GlideRecord("cmdb_ci_cloud_service_account");
			gr.addQuery('account_id', serviceAccountId);
			gr.query();
			if (gr.next()) {
				ppe.addGlideRecordEntry("service_account", gr);    //Add GlideRecord as a Table of the SA
				ppe.addString('service_account_id', String(serviceAccountId));
			}
		}
	},

	getInputEccQueueSysId: function(discoveryStatus) {
		var eccQueueGlideRecord = new GlideRecord('ecc_queue');

		eccQueueGlideRecord.addQuery('agent_correlator', discoveryStatus);
		eccQueueGlideRecord.query();
		eccQueueGlideRecord.next();

		return eccQueueGlideRecord.getUniqueValue();
	},

	createDiscoveryStatus: function(preExecutionJson) {
		var discoveryStatusGlideRecord = new GlideRecord('discovery_status');

		discoveryStatusGlideRecord.setValue('state', 'Starting');
		discoveryStatusGlideRecord.setValue('discover', 'CIs');

		return discoveryStatusGlideRecord.insert();
	},

	ajaxFunction_cancelDiscovery: function() {
		var discoveryStatusSysId = this.getParameter('sysparm_discovery_status_sys_id'),
			discoveryStatusGlideRecord = new GlideRecord('discovery_status');

		if (!discoveryStatusGlideRecord.get(discoveryStatusSysId))
			return;

		if (discoveryStatusGlideRecord.state != 'Completed')
			(new SncDiscoveryCancel()).cancelAll(discoveryStatusSysId);
	},

	ajaxFunction_parsePatternResult: function() {
		var ecc_sys_id = this.getParameter('sysparm_ecc_sys_id'),
			eccQueueGlideRecord = new GlideRecord('ecc_queue'),
			XMLUtil = GlideXMLUtil,
			xmlDocument,
			xmlRootElement,
			patternPayload;

		eccQueueGlideRecord.get(ecc_sys_id);
		if (eccQueueGlideRecord.payload && eccQueueGlideRecord.payload.includes("see_attachment")) 
            xmlDocument = XMLUtil.parse(new GlideSysAttachment().get(eccQueueGlideRecord, 'payload'));
        else 
            xmlDocument = XMLUtil.parse(eccQueueGlideRecord.payload);
		xmlRootElement = xmlDocument.getDocumentElement();
		patternPayload = JSON.parse(XMLUtil.getElementValueByTagName(xmlRootElement, 'output'));
		//check service account mandatory field has value or not
		if(patternPayload.results && patternPayload.results.items && patternPayload.results.items.length) {
            //code to refresh the datacenters
            if (patternPayload.status == 'SUCCEED') {
                var data = patternPayload.results.items;
                var scheduleConfig = new CloudDiscoveryScheduleConfig();
                for (i = 0; i < data.length; i++) {
                    var obj = data[i].values;
                    if (obj["is_master_account"] == "0" && !JSUtil.nil(obj["account_id"])) { // is_master_account = 0 indicates the account is member account 
                        var subAccGr = new GlideRecord("cmdb_ci_cloud_service_account");
                        subAccGr.addQuery("account_id", obj["account_id"]);
                        subAccGr.query();
                        if (subAccGr.next()) {
                            var accountSysId = subAccGr.getValue('sys_id') + '';
                            var result = {};
                            try {
                                result = scheduleConfig.discoverDatacenters(accountSysId);
                                if (result.datacentersList.length == 0) {
                                    gs.warn("SubAccountsDiscoveryAjax datacenter not discovered for accountSysId: " + JSON.stringify(result));
                                }
                            } catch (err) {
                                gs.error("SubAccountsDiscoveryAjax error in datacenter discovery for accountSysId: " + err);
                            }
                        }
                    }
                }
            }
            var mandatoryFieldsNotEmpty = this.findMandatoryFieldsNotEmpty(patternPayload.results.items);
            return (patternPayload.status == 'SUCCEED' && mandatoryFieldsNotEmpty) ? 'success' : 'mandatory_field_empty';
        }
        return (patternPayload.status == 'SUCCEED') ? 'success' : 'failed';
    },

	checkMid: function(agent) {
		if (JSUtil.notNil(agent)) {
			// If MID Server is down, bail
			var mid = MIDServer.getByName(agent);

			if (!mid)
				return 'error:Could not find MID Server: ' + agent;

			if (mid.status == 'Down' || mid.status == 'Upgrade Failed')
				return 'error:MID Server: ' + agent + ' is not up';

			if (!JSUtil.toBoolean(mid.validated))
				return 'error:MID Server: ' + agent + ' is not validated';

			return 'processing';
		} else {
			return 'error:Could not find MID Server';
		}
	},

	ajaxFunction_checkProgress: function() {
		var ecc_sys_id = this.getParameter('sysparm_ecc_sys_id'),
			eccQueueGlideRecord = new GlideRecord('ecc_queue');

		eccQueueGlideRecord.addQuery('response_to', ecc_sys_id);
		eccQueueGlideRecord.query();

		if (!eccQueueGlideRecord.next())
			return this.checkMid(this.getParameter('sysparm_agent'));

		if (eccQueueGlideRecord.state == 'processed' ||
			eccQueueGlideRecord.state == 'error')
			return eccQueueGlideRecord.sys_id;
		else
			return 'processing';
	},

	getServiceAccMandatoryFields: function() {
		var mandatoryFields=[];
		var grSysDictionary = new GlideRecord('sys_dictionary');
		grSysDictionary.addQuery('name', 'cmdb_ci_cloud_service_account');
		grSysDictionary.query();

		while(grSysDictionary.next())
		{
			if(grSysDictionary.mandatory)
				mandatoryFields.push(grSysDictionary.element.toString());
		}
		return mandatoryFields;
	},

	findMandatoryFieldsNotEmpty: function(memberAccList) {
		var mandatoryFieldNotEmpty = true;
		var serviceAccMandatoryFields = this.getServiceAccMandatoryFields();
		//ignoring company dictionary, as this becomes manadatory in case of domain separated environment.
		serviceAccMandatoryFields = serviceAccMandatoryFields.filter(function(e){return e !== 'company';});
		if(serviceAccMandatoryFields.length) {
			for(var i= 0; i < memberAccList.length; i++) {
				for(var j= 0; j < serviceAccMandatoryFields.length; j++) {
					var fieldName = serviceAccMandatoryFields[j] + '';
					if(JSUtil.nil(memberAccList[i].values[serviceAccMandatoryFields[j]])) {
						mandatoryFieldNotEmpty = false;
						break;
					}
				}
			}
		}
		return mandatoryFieldNotEmpty;
	},

	ajaxFunction_getMandatoryFieldErrorMessage: function() {
		var discoveryStatusSysId = this.getParameter('sysparm_discovery_status_sys_id');
		var discoveryLogGlideRecord = new GlideRecord('discovery_log');
		discoveryLogGlideRecord.addQuery('level', 2);
		discoveryLogGlideRecord.addQuery('status', discoveryStatusSysId);
		discoveryLogGlideRecord.orderBy('sys_created_on');
		discoveryLogGlideRecord.query();
		if (discoveryLogGlideRecord.next())
			return discoveryLogGlideRecord.getValue('short_message');
	},

	type: 'SubAccountsDiscoveryAjax'
});
