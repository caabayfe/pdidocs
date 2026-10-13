var ChangeRequestDiscoverySNC = Class.create();
ChangeRequestDiscoverySNC.prototype = {
    //Discovery State Values
	DISCO_IN_PROGRESS: "in_progress",
	DISCO_SUCCESSFUL: "successful",
	DISCO_SUCCESSFUL_WARN: "warning",
	DISCO_ERROR: "error",
	DISCO_CANCEL: "canceled",
	DISCO_NA: "not_applicable",
	PLUGIN_SVC_MAPPING: "com.snc.service-mapping",

	//Discovery State Icons
	DISCO_ICONS: {
		"in_progress": {"color": "#278EFC", "icon": "icon-activity-circle"},
		"successful": {"color": "#71E279", "icon": "icon-success-circle"},
		"warning": {"color": "#F95050", "icon": "icon-success-circle"},
		"error": {"color": "#F95050", "icon": "icon-error-circle"},
		"canceled": {"color": "#000000", "icon": "icon-error-circle"},
		"not_applicable": {"color": "#000000", "icon": "icon-delete"}
	},

	initialize: function() {
    },

	canManuallyTriggerDiscovery: function(taskSysId) {
		var propertyValue = gs.getProperty('com.snc.change_request.auto.discovery', 'off');
		var propertyStates = gs.getProperty('com.snc.change_request.disco.manual.state', '');

		//Check if the property is valid for a manual trigger
		var validProperty = propertyValue === 'manual' || propertyValue === 'both';

		return validProperty && this._canTriggerDiscovery(taskSysId, propertyStates, false);
	},

	canAutoTriggerDiscovery: function(taskSysId) {
		var propertyValue = gs.getProperty('com.snc.change_request.auto.discovery', 'off');
		var propertyStates = gs.getProperty('com.snc.change_request.disco.auto.state', '');

		var validProperty = propertyValue === 'automatic' || propertyValue === 'both';

		return validProperty && this._canTriggerDiscovery(taskSysId, propertyStates, false);
	},
	
	canTriggerTopDownDiscovery: function(taskSysId) {
		if (!GlidePluginManager.isActive(this.PLUGIN_SVC_MAPPING))
			return false;

		var propertyStates = gs.getProperty('com.snc.change_request.disco.topdown.state', '');
		return this._canTriggerDiscovery(taskSysId, propertyStates, true);
	},

	_updateTaskCI: function(taskCI, isManual) {
		var ipAddress = this._getCIAddress(taskCI.ci_item);
		if (ipAddress !== '') {
			try {
				var statusSysId = sn_discovery.DiscoveryAPI.discoverIpAddress(ipAddress);
				if (statusSysId) {
					taskCI.setValue('discovery', statusSysId);
					taskCI.setValue('discovery_result', this.DISCO_IN_PROGRESS);
					taskCI.setValue('discovery_log_url', this.generateDiscoveryStatusLink(statusSysId));
					taskCI.setValue('discovery_last_updated', gs.nowGlideDateTime());
					taskCI.setValue('discovery_manually_triggered', isManual);
				}
			} catch (err) {
				gs.error('Discovery Error: ' + err.message + ' for CI: ' + taskCI.ci_item + ' (' + ipAddress + ')');
				taskCI.setValue('discovery_result', this.DISCO_ERROR);
				taskCI.setValue('discovery_last_updated', gs.nowGlideDateTime());
			}
		} else {
			taskCI.setValue('discovery_result', this.DISCO_NA);
			taskCI.setValue('discovery_last_updated', gs.nowGlideDateTime());
		}
		taskCI.update();
	},

	triggerDiscovery: function(taskSysId, isManual) {
		var changeRequestGR = new GlideRecord('change_request');
		if ((!taskSysId) || !changeRequestGR.get(taskSysId)) {
			gs.warn('[ChangeRequestDiscovery - triggerDiscovery] Unable to retrieve change record for sys id: ' + taskSysId);
			return false;
		}

		gs.eventQueue("change_request.trigger.discovery", changeRequestGR, isManual);
		if (isManual)
			gs.addInfoMessage(gs.getMessage("Discovery has been initiated on the Affeced CIs"));
	},

	triggerDiscoveryFromEvent: function(taskSysId, isManual) {
		if (!taskSysId)
			return;

		var taskCI = new GlideRecord('task_ci');
		taskCI.addQuery('task', taskSysId);
		if (!isManual)
			taskCI.addQuery('discovery_manually_triggered', false);
		taskCI.query();

		while (taskCI.next())
			this._updateTaskCI(taskCI, isManual);

	},

	triggerBatchDiscovery: function(taskSysId, isManual) {
		var changeRequestGR = new GlideRecord('change_request');
		if ((!taskSysId) || !changeRequestGR.get(taskSysId)) {
			gs.warn('[ChangeRequestDiscovery - triggerDiscovery] Unable to retrieve change record for sys id: ' + taskSysId);
			return false;
		}

		var discoveryBatchSize = parseInt(gs.getProperty('com.snc.change_request.discovery.batch_size', 100));

		var obj = {};
		var taskCiList = [];
		obj.isManual = isManual;
	
		var taskCI = new GlideRecord('task_ci');
		taskCI.addQuery('task', taskSysId);
		if (!isManual)
			taskCI.addQuery('discovery_manually_triggered', false);
		taskCI.query();

		while (taskCI.next()) {
			taskCiList.push(taskCI.getUniqueValue());
			if (taskCiList.length === discoveryBatchSize) {
				obj.list = taskCiList;
				gs.eventQueue("change_request.batch.discovery", changeRequestGR, JSON.stringify(obj));
				taskCiList = [];
			}
		}
		//Process any left over in the list
		if (taskCiList.length > 0) {
			obj.list = taskCiList;
			gs.eventQueue("change_request.batch.discovery", changeRequestGR, JSON.stringify(obj));
		}

		if (isManual)
			gs.addInfoMessage(gs.getMessage("Discovery has been initiated on the Affeced CIs"));
	},

	processBatchTaskCI: function(batchData) {
		var data = JSON.parse(batchData);
		for (var i = 0; i < data.list.length; i++) {
			var item = data.list[i];
			var taskCiGr = new GlideRecord('task_ci');
			if (taskCiGr.get(item))
				this._updateTaskCI(taskCiGr, data.isManual);
		}
	},

	_setValuesTaskCI: function(taskCI, returnedStatus, discoverySysId) {
		var status = returnedStatus.getCiOperationStatus() + '';
		var issueCount = returnedStatus.getIssues();
		if (status !== 'Successful') {
			taskCI.setValue('discovery_result', this.DISCO_ERROR);
			taskCI.setValue('discovery_log_url', this.generateDiscoveryIssuesLink(returnedStatus.getIssuesLink()));
		} else {
			if (issueCount > 0) {
				taskCI.setValue('discovery_result', this.DISCO_SUCCESSFUL_WARN);
				taskCI.setValue('discovery_log_url', this.generateDiscoveryIssuesLink(returnedStatus.getIssuesLink()));
			} else {
				taskCI.setValue('discovery_result', this.DISCO_SUCCESSFUL);
				taskCI.setValue('discovery_log_url', this.generateDiscoveryStatusLink(discoverySysId));
			}
		}
		taskCI.setValue('discovery_last_updated', gs.nowGlideDateTime());
		return taskCI;
	},

	updateDiscoveryState: function(taskCISysId, discoverySysId, isTopDown) {
		if (isTopDown) {
			var serviceCI = new GlideRecord('task_cmdb_ci_service');
			if (!serviceCI.get(taskCISysId))
				return;

			serviceCI.setValue('discovery_result', this.DISCO_SUCCESSFUL);
			serviceCI.setValue('discovery_log_url', this.generateDiscoveryStatusLink(discoverySysId));
			serviceCI.update();
		} else {
			var taskCI = new GlideRecord('task_ci');
			if (!taskCI.get(taskCISysId))
				return;

			try {
				var statusArr = sn_discovery.DiscoveryAPI.reportCiStatus(discoverySysId);
				for (var i = 0; i < statusArr.length; i++) {
					taskCI = this._setValuesTaskCI(taskCI, statusArr[i], discoverySysId);
					taskCI.update();
				}
			} catch (err) {
				taskCI.setValue('discovery_result', this.DISCO_ERROR);
				taskCI.setValue('discovery_log_url', this.generateDiscoveryLogLink(discoverySysId));
				taskCI.setValue('discovery_last_updated', gs.nowGlideDateTime());
				taskCI.update();
			}
		}
	},

	generateDiscoveryIssuesLink: function(link) {
		if (!link || link.indexOf("href") < 0)
			return "";

		return link.match(/href="([^"]*)/)[1];
	},

	generateDiscoveryStatusLink: function(targetSysId) {
		if (!targetSysId)
			return '';
		
		return "discovery_status.do?sys_id=" + targetSysId;
	},

	generateDiscoveryLogLink: function(targetSysId) {
		return "discovery_log_list.do?sysparm_query=status=" + targetSysId + "^level!=0";
	},

	generateDiscoveryStateLink: function(taskCiGr) {
		var stateLink = "";

		if (!taskCiGr)
			return stateLink;

		var discoResult = taskCiGr.getDisplayValue("discovery_result");
		if (!discoResult)
			return stateLink;

		var discoLogURL = taskCiGr.getValue("discovery_log_url");

		stateLink = "[code]";
		var title = gs.getMessage("See log for details...");

		// Add the icon first if we've got one defined for this state
		var discoIcon = this.DISCO_ICONS[taskCiGr.getValue("discovery_result")];
		
		if (discoIcon) {
			if (discoLogURL)
				stateLink += '<a title="' + title + '" style="padding-right:7px;" class="linked" href="' + discoLogURL + '"><span class="' + discoIcon.icon + '" style="color:' + discoIcon.color + ';"></span></a>';
			else
				stateLink += '<span class="' + discoIcon.icon + '" style="margin-right:10px; color:' + discoIcon.color + ';"></span>';
		}

		// Now we can add the discovery result text e.g. Completed Successfully
		if (discoLogURL)
			stateLink += '<a title="' + title + '" class="linked" href="' + discoLogURL + '">' + discoResult + '</a>';
		else
			stateLink += '<span>' + discoResult + '</span>';

		return stateLink;
	},

	_getCIAddress: function(sysId) {
		var disco = new Discovery();
		var ipAddress = disco.getIPsInCI(sysId);
		//Check that we do have IP Addresses
		if (!Array.isArray(ipAddress) || ipAddress.length === 0)
			return '';

		if (ipAddress.length === 1) //If we only have 1 IP Address then return
			return ipAddress[0];
		else { //If there are multiple then find one that is in a schedule
			var params = disco.getScheduleContainingAnyIP(ipAddress, sysId, true); //ipAddress, cmdb, device history only
			if (params)
				return params.ip;
			else { //If ip is not in a schedule, default to what the ip is on the ci
				var ci = new GlideRecord('cmdb_ci');
				if (ci.get(sysId) && !ci.ip_address.nil())
					return ci.getValue('ip_address');
			}
		}
		return '';
	},

	_isStateMatches: function(propertyStates, changeRequestGR) {
		if (propertyStates !== '') {
			var triggerStates = propertyStates.split(',');
			for (var i = 0; i < triggerStates.length; i++) {
				var state = triggerStates[i].trim();
				if ((this._isNumeric(state) && changeRequestGR.state + 0 === parseInt(state)) || (changeRequestGR.getDisplayValue('state') === state))
					return true;
			}
			return false;
		}
		return true;  //Default to true if the property does not have any states defined.
	},


	_canTriggerDiscovery: function(taskSysId, propertyStates, isTopDown) {
		var changeRequestGR = new GlideRecord('change_request');
		if ((!taskSysId) || !changeRequestGR.get(taskSysId))
			return false;

		var taskCI;

		if (isTopDown)
			taskCI = new GlideRecord('task_cmdb_ci_service');
		else
			taskCI = new GlideRecord('task_ci');

		taskCI.initialize();
		taskCI.task = taskSysId;
		taskCI.task.setRefRecord(changeRequestGR);
		if (!taskCI.canWrite())
			return false;

		var stateMatches = this._isStateMatches(propertyStates, changeRequestGR);
		if (!stateMatches)
			return false;


		//Exit for top down discovery as we do not need to validate address
		if (isTopDown) 
			return true;

		var disco = new Discovery();
		taskCI.initialize();
		taskCI.addQuery('task', taskSysId);
		taskCI.query();
		while (taskCI.next()) {
			var ipAddress = disco.getIPsInCI(taskCI.ci_item);
			//Check that we do have IP Addresses
			if (Array.isArray(ipAddress) && ipAddress.length > 0)
				return true;
		}
		return false;
	},
	
	triggerTopDownDiscovery: function(taskSysId) {
		if (GlidePluginManager.isActive(this.PLUGIN_SVC_MAPPING)) {
			if (!taskSysId)
				return false;

			var taskCI = new GlideRecord('task_cmdb_ci_service');
			taskCI.addQuery('task', taskSysId);
			taskCI.query();

			var ciSysIds = [];
			while(taskCI.next())
				ciSysIds.push(taskCI.getValue('cmdb_ci_service'));

			if (ciSysIds.length > 0) {
				try {
					var additionalData = new SNC.TopDownAPIAdditionalDataJS();
					additionalData.setCallerId(taskSysId);
					additionalData.setCallerClass('change_request');
					var context = new SNC.TopDownDiscoveryAPI().discoverApplications(ciSysIds, additionalData);
					this._updateTopDownCIs(context.getDiscoveryStatus(), context.getValidCisToDiscover(), taskSysId);
					this._updateTopDownCIs('', context.getInvalidCisToDiscover(), taskSysId);
					return true;
				} catch (err) {
					gs.addErrorMessage(gs.getMessage('Discovery Error: {0}', err.message));
				}
			}
		}
		return false;
	},
	
	_updateTopDownCIs: function(statusSysId, ciSysIds, taskSysId) {
		if (!ciSysIds || !taskSysId)
			return;
 
		var taskCI = new GlideRecord('task_cmdb_ci_service');
		taskCI.addQuery('cmdb_ci_service', 'IN', ciSysIds);
		taskCI.addQuery('task', taskSysId);
		taskCI.query();

		if (statusSysId) {
			taskCI.setValue('discovery', statusSysId);
			taskCI.setValue('discovery_result', this.DISCO_IN_PROGRESS);
		} else
			taskCI.setValue('discovery_result', this.DISCO_NA);

		taskCI.setValue('discovery_log_url', this.generateDiscoveryStatusLink(statusSysId));
		taskCI.setValue('discovery_last_updated', gs.nowGlideDateTime());
		taskCI.updateMultiple();
	},
	
	getApplicationsByChangeId: function(chgId) {
		var applications = [];
		
		if (!chgId)
			return applications;
		
		var aUtils = new ArrayUtil();
		
		var taskCiGr = new GlideRecord('task_ci');
		taskCiGr.addQuery('task', chgId);
		taskCiGr.addQuery('ci_item.sys_class_name', GlideDBObjectManager.get().getAllExtensions("cmdb_ci_appl"));
		taskCiGr.query();
		while (taskCiGr.next())
			applications.push(taskCiGr.getValue("ci_item"));
 
		var cmdbRelCiGr = new GlideRecord("cmdb_rel_ci");
		cmdbRelCiGr.addQuery("type", "60bc4e22c0a8010e01f074cbe6bd73c3"); //Runs on
		cmdbRelCiGr.addQuery('JOINcmdb_rel_ci.child=task_ci.ci_item!task=' + chgId);
		cmdbRelCiGr.query();
		while (cmdbRelCiGr.next())
			applications.push(cmdbRelCiGr.getValue("parent"));
		
		return applications;
	},

	_isNumeric: function (val) {
		return !isNaN(parseFloat(val)) && isFinite(val);
	},

    type: 'ChangeRequestDiscoverySNC'
};
