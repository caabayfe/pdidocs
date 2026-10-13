var SubnetAcceleratorManager = Class.create();

SubnetAcceleratorManager.addMidToSelectedList = function(midSysId, accelRunSysId) {
	var selectedMidGlideRecord = new GlideRecord('subnet_accel_mid');

	selectedMidGlideRecord.addQuery('mid', midSysId + '');
	selectedMidGlideRecord.addQuery('subnet_accel_run', accelRunSysId + '');
	selectedMidGlideRecord.query();

	if (!selectedMidGlideRecord.next()) {
		selectedMidGlideRecord.initialize();
		selectedMidGlideRecord.mid = midSysId + '';
		selectedMidGlideRecord.subnet_accel_run = accelRunSysId + '';
		selectedMidGlideRecord.insert();
	}
};

SubnetAcceleratorManager.removeMidIfNeeded = function(midSysId, accelRunSysId) {
	if (hasApplication(midSysId, 'Discovery'))
		return;
	
	//MID server does not has Discovery application hence remove this mid server
	var selectedMidGlideRecord = new GlideRecord('subnet_accel_mid');
	selectedMidGlideRecord.addQuery('mid', midSysId + '');
	selectedMidGlideRecord.addQuery('subnet_accel_run', accelRunSysId + '');
	selectedMidGlideRecord.deleteMultiple();
	

	//Function to check if MID server has requested application
	function hasApplication(midSysId, application) {
		var appList = [];
		//Get the sys ID of requested applicaiton
		var appGr = new GlideRecord('ecc_agent_application');
		appGr.addQuery("name",application);
		appGr.query();
		if(appGr.next()) {
			appList.push(appGr.getUniqueValue());
		}
		
		//Get the sys ID of ALL application
		if(!!appGr.included_in_app_all) {
			appGr = new GlideRecord('ecc_agent_application');
			appGr.addQuery("name","ALL");
			appGr.query();
			if(appGr.next()) {
				appList.push(appGr.getUniqueValue());
			}
		}
		
		//Check if any record exist in ecc_agent_application_m2m table with requested application
		//or ALL application
		var eccAppGr = new GlideRecord('ecc_agent_application_m2m');
		eccAppGr.addQuery('agent',midSysId);
		eccAppGr.addQuery('application','IN',appList);
		eccAppGr.query();
		return eccAppGr.next();
	}
};

SubnetAcceleratorManager.prototype = {
	
    initialize: function() {
    },

	getAcceleratorRunFlowRecord: function() {
		var accelRunGlideRecord = new GlideRecord('subnet_accel_run');

		accelRunGlideRecord.query();
		accelRunGlideRecord.next();

		return accelRunGlideRecord;
	},

	deleteAllRecordsFromTable: function(tableName) {
		var gr = new GlideRecord(tableName);
		gr.query();
		gr.deleteMultiple();
	},

	getSNMPCredentials: function() {
		var snmpCreds = [],
			snmpCredGlideRecord = new GlideRecord('discovery_credentials');

		snmpCredGlideRecord.addQuery('type', 'CONTAINS', 'snmp');
		snmpCredGlideRecord.query();

		while (snmpCredGlideRecord.next()) {
			var snmpCred = {};

			snmpCred.sysId = snmpCredGlideRecord.getUniqueValue() + '';
			snmpCred.type = snmpCredGlideRecord.type + '';
			snmpCred.name = snmpCredGlideRecord.name + '';
			snmpCred.userName = snmpCredGlideRecord.user_name + '';
			snmpCred.sysClassName = snmpCredGlideRecord.sys_class_name + '';
			snmpCred.active = !!snmpCredGlideRecord.active;

			if (snmpCred.type == 'snmpv3') {
				snmpCred.authenticationProtocol = snmpCredGlideRecord.authentication_protocol + '';
				snmpCred.privacyProtocol = snmpCredGlideRecord.privacy_protocol + '';
			}

			snmpCreds.push(snmpCred);
		}

		return snmpCreds;
	},

	getSelectedMidsSysIds: function(isFirstTime, accelRunSysId) {
		var selectedMidsSysIds = {};
		var selectedMidGlideRecord = new GlideRecord('subnet_accel_mid');

		if (isFirstTime) {
			var midList = this._getMidListFromSelector();
			for (var i in midList) {
				SubnetAcceleratorManager.addMidToSelectedList(midList[i], accelRunSysId);
				selectedMidsSysIds[midList[i]] = true;
			}
		} else {
			selectedMidGlideRecord.query();

			while (selectedMidGlideRecord.next())
				selectedMidsSysIds[selectedMidGlideRecord.mid + ''] = true;
		}

		return selectedMidsSysIds;
	},

	getMidToRoutersMap: function() {
		var midRouterGlideRecord = new GlideRecord('ecc_agent_router'),
			midToRoutersMap = {},
			currentTraveresedAgent = '';

		midRouterGlideRecord.query();

		while (midRouterGlideRecord.next()) {
			currentTraveresedAgent = midRouterGlideRecord.agent + '';

			if (!midToRoutersMap[currentTraveresedAgent]) {
				midToRoutersMap[currentTraveresedAgent] = [];
			}

			midToRoutersMap[currentTraveresedAgent].push(midRouterGlideRecord.router + '');
		}

		return midToRoutersMap;
	},
	
	_getMidListFromSelector: function() {
		var mids=[];
		try {
			mids = new SNC.MidSelector().selectUpMidServers("Discovery",null,null);
		} catch( e ) {
			//if no matching MID server found, ignore exception. Accelerator UI
			//will show to configure MID server
		}
		return mids;
	},

	getMids: function(isFirstTime, accelRunSysId) {
		var mids = [],
			selectedMidsSysIds = this.getSelectedMidsSysIds(isFirstTime, accelRunSysId),
			midToRoutersMap = this.getMidToRoutersMap();

		var midList = this._getMidListFromSelector();

		for (var i in midList) {
			var mid = {};
			var midGlideRecord = new GlideRecord('ecc_agent');
			if(!midGlideRecord.get(midList[i]))
				continue;
			
			mid.sysId = midGlideRecord.getUniqueValue() + '';
			mid.name = midGlideRecord.name + '';
			mid.selected = (selectedMidsSysIds[midGlideRecord.getUniqueValue() + ''] || false);
			mid.routers = midToRoutersMap[mid.sysId];

			mids.push(mid);
		}

		return mids;
	},

	getRouters: function() {
		var routers = [],
			accelRouterGlideRecord = new GlideRecord('subnet_accel_router_ip');

		accelRouterGlideRecord.query();

		while (accelRouterGlideRecord.next())
			routers.push(accelRouterGlideRecord.router_ip + '');

		return routers;
	},

	getSchedule: function(accelRunGlideRecord) {
		var scheduleSysId = accelRunGlideRecord.schedule + '';

		if (!scheduleSysId)
			return {};

		var scheduleGlideRecord = new GlideRecord('sysauto_script');

		if (!scheduleGlideRecord.get(scheduleSysId))
			return {};

		return {
			maxRun: accelRunGlideRecord.max_run + '',
			runType: scheduleGlideRecord.run_type + '',
			runDayOfWeek: parseInt(scheduleGlideRecord.run_dayofweek, 10) || 1,
			runDayOfMonth: parseInt(scheduleGlideRecord.run_dayofmonth, 10) || 1,
			runTime: scheduleGlideRecord.run_time + '',
			runPeriod: scheduleGlideRecord.run_period + '',
			runStart: scheduleGlideRecord.run_start + '',
			active: !!scheduleGlideRecord.active
		};
	},

	saveMids: function(selectedMids, accelRunGlideRecord) {
		var errorMessage = '',
			failedMids = [],
			selectedMidGlideRecord = new GlideRecord('subnet_accel_mid');

		this.deleteAllRecordsFromTable('subnet_accel_mid');

		selectedMids.forEach(function(mid){
				selectedMidGlideRecord.initialize();
				selectedMidGlideRecord.mid = mid;
				selectedMidGlideRecord.subnet_accel_run = accelRunGlideRecord.getUniqueValue();

				if (!selectedMidGlideRecord.insert())
					failedMids.push(mid);
			}
		);

		if (failedMids.length > 0) {
			errorMessage = 'Failed to insert MIDs: ' + failedMids.join() + '.\n';
		}

		return errorMessage;
	},

	addRouter: function(router) {
		var errorMessage = '',
			accelRouterGlideRecord = new GlideRecord('subnet_accel_router_ip');

		accelRouterGlideRecord.initialize();
		accelRouterGlideRecord.router_ip = router.ip;
		accelRouterGlideRecord.subnet_accel_run = this.getAcceleratorRunFlowRecord().getUniqueValue();

		if (!accelRouterGlideRecord.insert())
			errorMessage = 'Failed to insert router: ' + router.ip + '.\n';

		return {
			success: (errorMessage == '') ? true : false,
			message: errorMessage
		};
	},

	getFlowData: function() {
		var accelRunSysId,
			isFirstTime = false,
			accelRunGlideRecord = this.getAcceleratorRunFlowRecord();
		if (accelRunGlideRecord.getRowCount() == 0) {
			accelRunGlideRecord.initialize();
			accelRunSysId = accelRunGlideRecord.insert() + '';
			isFirstTime = true;
		} else {
			accelRunSysId = accelRunGlideRecord.getUniqueValue() + '';
		}

		return {
			credentials: this.getSNMPCredentials(),
			mids: this.getMids(isFirstTime, accelRunSysId),
			routers: this.getRouters(),
			schedule: this.getSchedule(accelRunGlideRecord),
			autoSelectNewMids: !!accelRunGlideRecord.auto_include_new_mids,
			sendNotifications: !!accelRunGlideRecord.send_notifications,
			accelRunSysId: accelRunSysId,
			routerAccessTestTimeout: parseInt(gs.getProperty('glide.discovery.accelerator.router_access_test_timeout'), 10) || 300
		};
	},

	createCredentialsTestRun: function() {
		var credentialsTestRunGlideRecord = new GlideRecord('credential_test_run');

		credentialsTestRunGlideRecord.initialize();

		return credentialsTestRunGlideRecord.insert();
	},

	getMidRouterToMidMapping: function() {
		var midRouterGlideRecord = new GlideRecord('ecc_agent_router'),
			midRouterToMidMap = {},
			currentTraveresedRouter = '';

		midRouterGlideRecord.query();

		while (midRouterGlideRecord.next()) {
			currentTraveresedRouter = midRouterGlideRecord.router + '';

			if (!midRouterToMidMap[currentTraveresedRouter])
				midRouterToMidMap[currentTraveresedRouter] = midRouterGlideRecord.agent + '';
		}

		return midRouterToMidMap;
	},

	getMidSysIdToNameMapping: function(midSysIds) {
		var midGlideRecord = new GlideRecord('ecc_agent'),
			midSysIdToNameMap = {},
			currentTraveresedMidSysId;

		midGlideRecord.addQuery('sys_id', 'IN', midSysIds);
		midGlideRecord.query();

		while (midGlideRecord.next()) {
			currentTraveresedMidSysId = midGlideRecord.getUniqueValue() + '';

			if (!midSysIdToNameMap[currentTraveresedMidSysId])
				midSysIdToNameMap[currentTraveresedMidSysId] = midGlideRecord.name + '';
		}

		return midSysIdToNameMap;
	},

	createTestRunResults: function(credentialsTestRunSysId, credentialsDataToCheck) {
		var testResultGlideRecord = new GlideRecord('credential_test_result'),
			credentialInfo;

		credentialsDataToCheck.forEach(function(credentialData){
			credentialInfo = JSON.parse(credentialData.credentialInfo);

			testResultGlideRecord.initialize();
			testResultGlideRecord.credential_test_run = credentialsTestRunSysId + '';
			testResultGlideRecord.credential = credentialInfo.sys_id || '';
			testResultGlideRecord.mid = credentialData.agent + '';
			testResultGlideRecord.target_ip = credentialData.target + '';
			testResultGlideRecord.output_ecc_queue = credentialData.outputEccQueueSysId + '';
			testResultGlideRecord.state = 'active';

			testResultGlideRecord.insert();
		});
	},

	findMatchedInputEccQueue: function(outputEccQueueSysId) {
		var eccQueueGlideRecord = new GlideRecord('ecc_queue');

		eccQueueGlideRecord.addQuery('response_to', outputEccQueueSysId + '');
		eccQueueGlideRecord.query();

		return eccQueueGlideRecord;
	},

	createAffinityRecord: function(credentialsSysId, routerIP, midSysId, type) {
		var credentialsAffinityGlideRecord = new GlideRecord('dscy_credentials_affinity');

		credentialsAffinityGlideRecord.addQuery('agent', midSysId);
		credentialsAffinityGlideRecord.addQuery('credential_id', credentialsSysId);
		credentialsAffinityGlideRecord.addQuery('ip_address', routerIP);
		credentialsAffinityGlideRecord.addQuery('type', type);
		credentialsAffinityGlideRecord.query();
		
		if (!credentialsAffinityGlideRecord.next()) {
			credentialsAffinityGlideRecord.initialize();
			credentialsAffinityGlideRecord.agent = midSysId;
			credentialsAffinityGlideRecord.credential_id = credentialsSysId;
			credentialsAffinityGlideRecord.ip_address = routerIP;
			credentialsAffinityGlideRecord.type = type;

			credentialsAffinityGlideRecord.insert();
		}
	},

	getTestCredentialsResult: function(credTestRunId) {
		var testResultGlideRecord = new GlideRecord('credential_test_result'),
			credentialsParser,
			testsCompleted = 0,
			testsRunning = 0,
			testsResult = {
				results: []
			};

		testResultGlideRecord.addQuery('credential_test_run', credTestRunId + '');
		testResultGlideRecord.query();
		testsRunning = testResultGlideRecord.getRowCount();

		while (testResultGlideRecord.next()) {

			var matchedInputEccQueue = this.findMatchedInputEccQueue(testResultGlideRecord.output_ecc_queue + ''),
				testResultObject = {
					credentialSysId: testResultGlideRecord.credential + '',
					router: testResultGlideRecord.target_ip + ''
				};

			if (!matchedInputEccQueue.next())
				testResultObject.state = 'active';
			else {
				credentialsParser = new CredentialTestParser(matchedInputEccQueue.payload + '');

				if (credentialsParser.getResult() == 'success'){
					testResultObject.state = 'successful';

					if (testResultGlideRecord.credential) {
						this.createAffinityRecord(testResultObject.credentialSysId,
												  testResultObject.router,
												  testResultGlideRecord.mid + '',
												  testResultGlideRecord.credential.type + '');
					}
				}
				else
					testResultObject.state = 'failed';

				testsCompleted++;
			}
			testResultGlideRecord.state = testResultObject.state;
			testResultGlideRecord.update();
			testsResult.results.push(testResultObject);
		}
		testsResult.done = (testsRunning == testsCompleted);

		return testsResult;
	},

	testCredentials: function(credTestData) {
		var createCredentialsObjectToCheck = function(target, midSysId, midName, credentialInfo) {
			var credentialObject = {};

			credentialObject.target = target;
			credentialObject.agent = midSysId;
			credentialObject.agentName = midName;
			credentialObject.credentialInfo = JSON.stringify(credentialInfo);
			credentialObject.port = '161';

			return credentialObject;
		};

		var createCredentialObjectFromSysId = function(credentialSysId) {
			return {sys_id: credentialSysId};
		};

		var credentialsTestRunSysId = this.createCredentialsTestRun(),
			midRouterToMidMapping = this.getMidRouterToMidMapping(),
			midSysIdToNameMapping = this.getMidSysIdToNameMapping(credTestData.mids),
			credentialsDataToCheck = [],
			targetsToDiscover = credTestData.targets,
			midSysIds = credTestData.mids,
			credentialSysIdsToTest = credTestData.credentials,
			credentialsObject = {},
			publicCredential = {
				user_name: 'public',
				password: 'public',
				type: 'snmp'
			},
			routerMidSysId;

		credentialSysIdsToTest.forEach(function(credentialSysId){
			targetsToDiscover.forEach(function(target){
				routerMidSysId = midRouterToMidMapping[target + ''];

				if (routerMidSysId && (midSysIds.indexOf(routerMidSysId) > -1)) {
					credentialsObject = createCredentialsObjectToCheck(target + '',
																	   routerMidSysId,
																	   midSysIdToNameMapping[routerMidSysId] + '',
																	   createCredentialObjectFromSysId(credentialSysId + ''));
					credentialsDataToCheck.push(credentialsObject);
				} else {
					midSysIds.forEach(function(midSysId){
						credentialsObject = createCredentialsObjectToCheck(target + '',
																		   midSysId,
																		   midSysIdToNameMapping[midSysId] + '',
																		   createCredentialObjectFromSysId(credentialSysId + ''));
						credentialsDataToCheck.push(credentialsObject);
					});
				}
			});
		});

		// Additional loop for "public" credential
		// Reason for an additional loop and not using current credential objects from previous loop,
		// is that in case of user not sending credentials from UI, we will at least check the "public" one
		targetsToDiscover.forEach(function(target){
				routerMidSysId = midRouterToMidMapping[target + ''];

				if (routerMidSysId && (midSysIds.indexOf(routerMidSysId) > -1)) {
					credentialsObject = createCredentialsObjectToCheck(target + '',
																	   routerMidSysId,
																	   midSysIdToNameMapping[routerMidSysId] + '',
																	   publicCredential);
					credentialsDataToCheck.push(credentialsObject);
				} else {
					midSysIds.forEach(function(midSysId){
						credentialsObject = createCredentialsObjectToCheck(target + '',
																		   midSysId,
																		   midSysIdToNameMapping[midSysId] + '',
																		   publicCredential);
						credentialsDataToCheck.push(credentialsObject);
					});
				}
			});

		credentialsDataToCheck = JSON.parse(SNC.CredentialTest.testMultipleCredentials(JSON.stringify(credentialsDataToCheck)));
		this.createTestRunResults(credentialsTestRunSysId, credentialsDataToCheck);

		return {
			credentialsTestRunSysId: credentialsTestRunSysId + '',
			credentialsTestResult: this.getTestCredentialsResult(credentialsTestRunSysId + '')
		};
	},

	saveMidSelection: function(stepData) {
		var errorMessage = '',
			accelRunGlideRecord = this.getAcceleratorRunFlowRecord();

		if (accelRunGlideRecord.getRowCount() == 0) {
			errorMessage = 'No accelerator flow record!';
		} else {
			errorMessage += this.saveMids(stepData.selectedMids, accelRunGlideRecord);
			accelRunGlideRecord.auto_include_new_mids = stepData.autoSelectNewMids || false;

			if (!accelRunGlideRecord.update()) {
				errorMessage += 'Failed to update accelerator flow record';
			}
		}

		return {
			success: (errorMessage == '') ? true : false,
			message: errorMessage
		};
	},

	saveSchedule: function(scheduleData) {

		if (scheduleData.runType == 'periodically' && JSUtil.nil(scheduleData.runPeriod)) {
				return {
					success: false,
					message: 'Run period must not be empty'
				};
		}

		var scheduleGlideRecord = new GlideRecord('sysauto_script'),
			accelRunGlideRecord = this.getAcceleratorRunFlowRecord(),
			scheduleSysId = accelRunGlideRecord.schedule + '',
			errorMessage = '';

		if (scheduleSysId) {
			scheduleGlideRecord.get(scheduleSysId);
		} else {
			scheduleGlideRecord.initialize();
			scheduleGlideRecord.setValue('name', 'Subnet Discovery');
			scheduleGlideRecord.setValue('script', '(new SubnetAcceleratorManager()).triggerSubnetDiscovery();');
		}

		scheduleGlideRecord.setValue('run_type',scheduleData.runType);
		scheduleGlideRecord.setValue('active', scheduleData.active);

		if (JSUtil.notNil(scheduleData.runTime))
			scheduleGlideRecord.setValue('run_time', scheduleData.runTime);

		if (JSUtil.notNil(scheduleData.runPeriod))
			scheduleGlideRecord.setValue('run_period', new GlideDateTime(scheduleData.runPeriod));
		else
			scheduleGlideRecord.setValue('run_period', "");

		if (JSUtil.notNil(scheduleData.runStart))
			scheduleGlideRecord.setValue('run_start', scheduleData.runStart);

		if (JSUtil.notNil(scheduleData.runDayOfWeek))
			scheduleGlideRecord.setValue('run_dayofweek', scheduleData.runDayOfWeek);

		if (JSUtil.notNil(scheduleData.runDayOfMonth))
			scheduleGlideRecord.setValue('run_dayofmonth', scheduleData.runDayOfMonth);

		if (JSUtil.notNil(scheduleData.maxRun))
			accelRunGlideRecord.setValue('max_run', new GlideDateTime(scheduleData.maxRun));
		else
			accelRunGlideRecord.setValue('max_run', '');

		if (scheduleSysId) {
			errorMessage = scheduleGlideRecord.update() ? '' : 'Error while updating schedule record. Please check System Log for more information';
		} else {
			scheduleSysId = scheduleGlideRecord.insert();

			if (scheduleSysId)
				accelRunGlideRecord.setValue('schedule', scheduleSysId);
			else
				errorMessage = 'Error while inserting schedule record. Please check System Log for more information';
		}

		errorMessage = accelRunGlideRecord.update() ? '' : 'Error while updating accelerator run record. Please check System Log for more information';

		return {
			success: (errorMessage == '') ? true : false,
			message: errorMessage
		};
	},

	createAutomationStatusSet: function() {
		var selectedMids = this.getSelectedMidsSysIds(false, this.getAcceleratorRunFlowRecord().getUniqueValue() + ''),
			automationStatusSetGlideRecord = new GlideRecord('automation_status_set');

		automationStatusSetGlideRecord.initialize();
		automationStatusSetGlideRecord.mid_server_list = Object.keys(selectedMids).join();
		automationStatusSetGlideRecord.do_subnet_discovery = true;
		automationStatusSetGlideRecord.do_range_assign = true;
		automationStatusSetGlideRecord.insert();

		return automationStatusSetGlideRecord;
	},

	triggerSubnetDiscovery: function() {
		var automationStatusSetGlideRecord = this.createAutomationStatusSet();

		SNC.DiscoveryAccelerator.triggerAutomation(automationStatusSetGlideRecord.getUniqueValue() + '');

		return { result: automationStatusSetGlideRecord.getUniqueValue() };
	},

	getNumReachedRouters: function(automationSetGlideRecord) {
		var subnetQueueGlideRecord = new GlideRecord('subnet_discovery_queue');

		subnetQueueGlideRecord.addQuery('status', automationSetGlideRecord.subnet_discovery_status + '');
		subnetQueueGlideRecord.addQuery('result', 'success');
		subnetQueueGlideRecord.query();

		return subnetQueueGlideRecord.getRowCount();
	},

	getNumUnreachedElements: function(accelRunGlideRecord, automationSetGlideRecord, queueName, statusAttribute, keyAttribute) {
		var unreachedQueueGlideRecord = new GlideAggregate(queueName),
			reachedQueueGlideRecord = new GlideRecord(queueName),
			reachedElements = [];

		reachedQueueGlideRecord.addQuery('result', 'IN', 'success, pending');
		reachedQueueGlideRecord.addQuery('status', automationSetGlideRecord.getValue(statusAttribute));
		reachedQueueGlideRecord.query();

		while (reachedQueueGlideRecord.next()) {
			reachedElements.push(reachedQueueGlideRecord.getValue(keyAttribute));
		}
		unreachedQueueGlideRecord.addQuery('result', 'IN', 'failed, canceled');
		unreachedQueueGlideRecord.addQuery('status', automationSetGlideRecord.getValue(statusAttribute));
		unreachedQueueGlideRecord.addQuery(keyAttribute, 'NOT IN', reachedElements);
		unreachedQueueGlideRecord.groupBy(keyAttribute);
		unreachedQueueGlideRecord.query();

		return unreachedQueueGlideRecord.getRowCount();
	},

	getNumUnreachedRouters: function(accelRunGlideRecord, automationSetGlideRecord) {
		return this.getNumUnreachedElements(accelRunGlideRecord, automationSetGlideRecord,
											'subnet_discovery_queue', 'subnet_discovery_status', 'router_ip_address');
	},

	getNumSubnets: function(automationSetGlideRecord) {
		var subnetToStatusGlideRecord = new GlideRecord('ip_address_subnet_dscy_status_m2m');

		subnetToStatusGlideRecord.addQuery('discovery_status', automationSetGlideRecord.subnet_discovery_status + '');
		subnetToStatusGlideRecord.query();

		return subnetToStatusGlideRecord.getRowCount();
	},

	getNumAssignedRanges: function(automationSetGlideRecord) {
		var midServerAutoConfigGlideRecord = new GlideRecord('mid_server_auto_config_queue');

		midServerAutoConfigGlideRecord.addQuery('status', automationSetGlideRecord.range_assign_status + '');
		midServerAutoConfigGlideRecord.addQuery('result', 'success');
		midServerAutoConfigGlideRecord.query();

		return midServerAutoConfigGlideRecord.getRowCount();
	},

	getNumUnreachedSubnets: function(accelRunGlideRecord, automationSetGlideRecord) {
		return this.getNumUnreachedElements(accelRunGlideRecord, automationSetGlideRecord,
											'mid_server_auto_config_queue', 'range_assign_status', 'ip_collection');
	},

	getLatestAutomationSetRecord: function(){
		var automationSetGlideRecord = new GlideRecord ('automation_status_set');

		automationSetGlideRecord.orderByDesc('sys_created_on');
		automationSetGlideRecord.setLimit(1);
		automationSetGlideRecord.query();

		return (automationSetGlideRecord.next()) ? automationSetGlideRecord : null;
	},

	getDurationForStatus: function(discoveryStatusGlideRecord) {
		if (JSUtil.nil(discoveryStatusGlideRecord)) {
			return new GlideDuration(0);
		} else if (!JSUtil.nil(discoveryStatusGlideRecord.duration)) {
			return new GlideDuration(discoveryStatusGlideRecord.duration.getDurationValue());
		} else {
			var createdOn = discoveryStatusGlideRecord.sys_created_on;
			var updatedOn = discoveryStatusGlideRecord.sys_updated_on;

			return GlideDateTime.subtract(new GlideDateTime(createdOn), new GlideDateTime(updatedOn));
		}
	},

	calculateDiscoveryDuration: function(automationSetGlideRecord) {
		var subnetDiscoveryDuration,
			autoConfigDuration,
			discoveryDuration;

		if (automationSetGlideRecord.state == 'Completed' || automationSetGlideRecord.state == 'Canceled') {
			subnetDiscoveryDuration = this.getDurationForStatus(automationSetGlideRecord.subnet_discovery_status);
			autoConfigDuration = this.getDurationForStatus(automationSetGlideRecord.range_assign_status);
			discoveryDuration = subnetDiscoveryDuration.add(autoConfigDuration);
		} else {
			discoveryDuration = GlideDateTime.subtract(new GlideDateTime(automationSetGlideRecord.sys_created_on), new GlideDateTime());
		}

		return discoveryDuration;
	},

	checkHasRouterCIs: function() {
		var routerGr = new GlideRecord('cmdb_ci_netgear');
		routerGr.addQuery('can_route', true);
		routerGr.query();

		return (routerGr.getRowCount() > 0);
	},

	getSubnetDiscoveryResult: function() {
		var hasRouterCIs = this.checkHasRouterCIs();
		var automationSetGlideRecord = this.getLatestAutomationSetRecord();

		if (!automationSetGlideRecord)
			return {
				'hasRouterCIs': hasRouterCIs,
				'hasResults': false
			};

		var	accelRunGlideRecord = this.getAcceleratorRunFlowRecord();

		return {
			'hasRouterCIs': hasRouterCIs,
			'hasResults': true,
			'numReachedRouters': this.getNumReachedRouters(automationSetGlideRecord),
			'numUnreachedRouters': this.getNumUnreachedRouters(accelRunGlideRecord, automationSetGlideRecord),
			'numSubnets': this.getNumSubnets(automationSetGlideRecord),
			'numAssignedRanges': this.getNumAssignedRanges(automationSetGlideRecord),
			'numUnreachedSubnets': this.getNumUnreachedSubnets(accelRunGlideRecord, automationSetGlideRecord),
			'done': (automationSetGlideRecord.state == 'Completed') ||
				(automationSetGlideRecord.state == 'Canceled'),
			'duration': this.calculateDiscoveryDuration(automationSetGlideRecord) + '',
			'rangeAssignStatusSysId': automationSetGlideRecord.range_assign_status || '',
			'subnetDiscoveryStatusSysId': automationSetGlideRecord.subnet_discovery_status || '',
			'sysCreatedAt': automationSetGlideRecord.sys_created_on + '',
			'automationStatusSetSysId': automationSetGlideRecord.getUniqueValue() + ''
		};
	},

	cancelSubnetDiscovery: function() {
		var automationSetGlideRecord = this.getLatestAutomationSetRecord(),
			discoveryCancel =  new SncDiscoveryCancel();

		if (automationSetGlideRecord.state != 'Starting' && automationSetGlideRecord.state != 'Active') {
			return {
				success: false,
				message: 'Failed cancel discovery.\nState is not "Starting" nor "Active"'
			};
		}

		if (JSUtil.nil(automationSetGlideRecord.range_assign_status) &&
			JSUtil.nil(automationSetGlideRecord.subnet_discovery_status)) {
			automationSetGlideRecord.state = 'Canceled';
			automationSetGlideRecord.update();
		} else if (JSUtil.nil(automationSetGlideRecord.range_assign_status) &&
				   !JSUtil.nil(automationSetGlideRecord.subnet_discovery_status)) {
			discoveryCancel.cancelAll(automationSetGlideRecord.subnet_discovery_status);
		} else if (!JSUtil.nil(automationSetGlideRecord.range_assign_status)){
			discoveryCancel.cancelAll(automationSetGlideRecord.range_assign_status);
		}

		return {
			success: true,
			message: ''
		};
	},

	deleteRouter: function(routerIp) {
		var errorMessage = '',
			accelRouterGlideRecord = new GlideRecord('subnet_accel_router_ip');

		accelRouterGlideRecord.addQuery('router_ip', routerIp);
		accelRouterGlideRecord.query();

		if (!accelRouterGlideRecord.next()) {
			errorMessage = 'Router with IP ' + routerIp + ' not found.\n';
		} else {
			var deleted = accelRouterGlideRecord.deleteRecord();

			if (!deleted)
				errorMessage = 'Error while deleting router. Please check System Log for more information';
		}

		return {
			success: (errorMessage == '') ? true : false,
			message: errorMessage
		};
	},

    type: 'SubnetAcceleratorManager'
};
