var DiscoveryPatternOrchestratorFlowLauncher;

(function() {
	/**********************************************
					  Constants
	***********************************************/
	var FILE_NAME = 'DiscoveryPatternOrchestratorFlowLauncher',
		FILE_NAME_LOG_PREFIX = '[' + FILE_NAME + ']',
		LOG_PREFIX = DiscoveryPatternOrchestratorUtil.LOG_PREFIX + FILE_NAME_LOG_PREFIX,
		INPUT_PARAMETERS_SNAPSHOT_TABLE_NAME = 'sn_discovery_input_parameters_snapshot';

	/**********************************************
				    Local Variables
	***********************************************/

	// discoveryType should be replaced by Discovery.TYPE enum
	var discoveryType = {
			cloudResources: 'Cloud Resources',
			serverless: 'Hostless'
		},
		discoveryTopologyType = {
			serviceAccountDiscovery: 1,
			subAccountsDiscovery: 2,
			datacentersDiscovery: 3
		};
	var nodeLogger = DiscoveryPatternOrchestratorUtil.getNodeLogger();

	/**********************************************
					  Public API
	***********************************************/

	DiscoveryPatternOrchestratorFlowLauncher = {
		discoveryType: discoveryType,
		startDiscovery: startDiscovery,
		startQuickDatacenterDiscovery: startQuickDatacenterDiscovery,
		startQuickDatacenterDiscoveryExistingStatus: startQuickDatacenterDiscoveryExistingStatus
	};

	/*
	 * Based on discovery type - gets information on patterns need to be executed in the beginning
	 * of the flow [Cloud Resources\Serverless] and calls the relevant component in order to
	 * trigger them
	 *
	 * @param statusId - Status sys_id created for the triggered discovery
	 * @param scheduleId - Schedule sys_id
	 * @param discoveryType - The type of the discovery to trigger. Currently supporting 'Cloud Resources'
	 * & 'Serverless'
	 */
	function startDiscovery(statusId, scheduleId, discoveryType) {
		nodeLogger.info(LOG_PREFIX + ' Starting "' + discoveryType + '" discovery');
		
		// If we don't have a status nor a schedule - quit
		if (!scheduleId || !statusId) {
			var message = 'Status or schedule IDs are missing.\nPlease validate to "StartDiscovery" script include is able to aquire the information';
			nodeLogger.error(LOG_PREFIX + ' ' + message);
			DiscoveryLogger.error(message, FILE_NAME);
			return;
		}

		/* 
		 * executionInfoTemplate - A basic JS bject representing a template for our executions
		 * This object will contain ALL relevant information of a SINGLE execution [= a single pattern]
		 * to be used throughout its flow management
		 */
		var executionInfoTemplate = {
				discoveryType: discoveryType,
				status: statusId,
				schedule: scheduleId
			},
			patternsToExecute = [];

		switch (discoveryType) {
			case this.discoveryType.cloudResources:
				/* 
				 * Fetch the service account configured for the schedule
				 * The service account pattern is the starting point for cloud discovery
				 */
				var serviceAccount = new CloudResourceDiscoveryUtil().fetchConfiguredServiceAccountDetailsBySchedule(scheduleId);

				// If we didn't find an account - quit
				if (!serviceAccount) {
					var message = 'No service account found for schedule.\nPlease verify configuration on "Cloud Wizard" or "cmp_discovery_ldc_config" table';
					nodeLogger.error(LOG_PREFIX +  ' ' + message);
					DiscoveryLogger.error(message, FILE_NAME);
					return;
				}

				var cloudTopologyPatternsGlideRecord = DiscoveryPatternOrchestratorUtil.getPatternByDatacenterTypeAndTopology(
					serviceAccount.datacenterType,
					discoveryTopologyType.serviceAccountDiscovery
				);

				// If no patterns exist, return early
				if (cloudTopologyPatternsGlideRecord.getRowCount() == 0) {
				    var unsupportedType = gs.getProperty('glide.discovery.unsupported_pattern_datacenters', 'cmdb_ci_vcenter_datacenter');
				    var typesArray = unsupportedType.split(/\s*,\s*/);
					if (typesArray.indexOf(serviceAccount.datacenterType) === -1) {
						var errorMessage = 'No service account patterns found for account: ' + JSON.stringify(serviceAccount);
						nodeLogger.error(LOG_PREFIX + ' ' + errorMessage);
						DiscoveryLogger.error(errorMessage, FILE_NAME);
					}
					return;
				}

				nodeLogger.info(LOG_PREFIX + ' Running discovery on ' + serviceAccount.accountId);

				/* 
				 * Get a list of execution objects [based on executionInfoTemplate above] for
				 * the patterns need to be executed
				 * In 'Cloud Resources' case it is the service account pattern
				 */
				patternsToExecute = getEntryPointPatternExecutionsByAccount(serviceAccount, executionInfoTemplate);
				break;
			case this.discoveryType.serverless:
				/* 
				 * Get a list of execution objects [based on executionInfoTemplate above] for
				 * the patterns need to be executed
				 * In 'Serverless' case it is all the executions records created for the schedule
				 *
				 * Important Note -
				 * We are using PatternLauncherManager Java class to launch the Serverless schedule
				 * This class DOESN'T need our execution objects and we create them in order for the
				 * Orchestrator to use them
				 */
				patternsToExecute = getServerlessEntryPointPatterns(scheduleId, executionInfoTemplate);
				break;
		}

		/* 
		 * Creating pending execution records and returning only execution
		 * objects that execution records were created successfuly for them
		 */
		var validPatternExecutions = createPendingExecutionRecords(patternsToExecute);
		attachPatternExecutionToInputParamsSnapshot(validPatternExecutions);

		// In case no records were created - quit
		if (!validPatternExecutions || validPatternExecutions.length == 0) {
			var message = LOG_PREFIX + ' No execution records created. Abort discovery';
			nodeLogger.error(message);
			DiscoveryLogger.error(message, FILE_NAME);
			return;
		}
		
		// Trigger the patterns
		switch (discoveryType) {
			case this.discoveryType.cloudResources:
				DiscoveryPatternOrchestratorFlowManager.triggerPatterns(validPatternExecutions);
				break;
			case this.discoveryType.serverless:
				triggerServerlessDiscovery(validPatternExecutions, statusId, scheduleId);
				break;
		}
	}

	/*
	 * Trigger a quick discovery for cloud. CPG use case
	 *
	 * @param datacenterSysId - sys_id of the datacenter to discover
	 * @param serviceAccountSysId - sys_id of the account hosting the datacenter
	 * 
	 * @return The created discovery status
	 */
	function startQuickDatacenterDiscovery(datacenterSysId, serviceAccountSysId /* optional */) {
		return startQuickDatacenterDiscoveryExistingStatus('', datacenterSysId, serviceAccountSysId);
	}

	function startQuickDatacenterDiscoveryExistingStatus(statusId, datacenterSysId, serviceAccountSysId /* optional */) {
		nodeLogger.debug(LOG_PREFIX + ' Prepare for cloud quick discovery. Grabbing datacenter & account information');

		var datacenterObj = getDatacenterDetailsFromSysId(datacenterSysId);
		findAndAddSourceNativeToDatacenterObject(datacenterObj);
		var serviceAccountObj = getServiceAccountDetailsUsingDatacenterAsFallback(serviceAccountSysId, datacenterSysId);

		if (JSUtil.nil(statusId)) {
			var message = gs.getMessage('No status sysid was provided. Creating a new discovery status.');
			nodeLogger.debug(LOG_PREFIX + ' ' + message);
			
			var status = new DiscoveryStatus(new DiscoveryCloudQuickSchedule(),
										 /* description */ 'Cloud quick discovery: ' + serviceAccountObj.object_id + '.' + datacenterObj.object_id, 
										 datacenterObj.name
										);

			if (!status.sysID) {
				var message = gs.getMessage('Couldn\'t create a discovery status.\nCheck system\\node logs for more details');
				nodeLogger.error(LOG_PREFIX + ' ' + message);
				gs.error(message, FILE_NAME);
				throw new Error(message);
			}
			
			statusId = status.sysID;
		}
		
		if (JSUtil.doesNotHave(datacenterObj.source_native_key)) {
			var message = LOG_PREFIX + ' Datacenter with sys_id ' + datacenterObj.sys_id + ' has no source_native_key and may cause patterns to fail.\n \
							Please make sure to run a discovery on the account so the datacenter pattern will populate it.';
			new DiscoveryLogger(statusId).warn(message);
			nodeLogger.warn(message);
		}
		datacenterObj.serviceAccount = serviceAccountObj;

		return triggerQuickDiscoveryOnDatacenterForStatus(datacenterObj, statusId);
	}

	/**********************************************
				Private Helper Functions
	***********************************************/

	function getDatacenterDetailsFromSysId(datacenterSysId) {
		nodeLogger.debug(LOG_PREFIX + ' Grabbing datacenter details for ' + datacenterSysId);
		var datacenterGlideRecord = new GlideRecord('cmdb_ci_logical_datacenter');
	
		if (!datacenterGlideRecord.get('sys_id', datacenterSysId))
			throw new Error(gs.getMessage('Invalid datacenter sysid: {0}', [datacenterSysId]));
	
		return datacenterObj = {
			sys_id: datacenterSysId,
			name: datacenterGlideRecord.name + '',
			object_id: datacenterGlideRecord.object_id + '',
			sys_class_name: datacenterGlideRecord.sys_class_name + ''
		};
	}
	
	function getServiceAccountDetailsUsingDatacenterAsFallback(serviceAccountSysId, datacenterSysId) {
		nodeLogger.debug(LOG_PREFIX + ' Grabbing service account with sys_id ' + serviceAccountSysId + '. If not found, will try to find it using a relation to datacenter ' + datacenterSysId);

		var serviceAccountGlideRecord = new GlideRecord('cmdb_ci_cloud_service_account');
		var accountNotFound = !serviceAccountGlideRecord.get('sys_id', serviceAccountSysId + '');
		
		if (accountNotFound) {
			var relationToAccountGlideRecord = new GlideRecord('cmdb_rel_ci');
			relationToAccountGlideRecord.addQuery('parent', datacenterSysId + '');
			relationToAccountGlideRecord.addQuery('type', '5f985e0ec0a8010e00a9714f2a172815'); // Hosted on
			relationToAccountGlideRecord.addQuery('child.sys_class_name', 'cmdb_ci_cloud_service_account');
			relationToAccountGlideRecord.addQuery('child.install_status', 1);
			relationToAccountGlideRecord.addQuery('child.operational_status', 1);
			relationToAccountGlideRecord.setLimit(1);
			relationToAccountGlideRecord.query();
			
			if (relationToAccountGlideRecord.next())
				serviceAccountSysId = relationToAccountGlideRecord.child + '';
			
			serviceAccountGlideRecord = new GlideRecord('cmdb_ci_cloud_service_account');
			accountNotFound = !serviceAccountGlideRecord.get('sys_id', serviceAccountSysId);
		
			if (accountNotFound)
				throw new Error(gs.getMessage('No service account found. Tried a direct sysid: {0} and fallback by searching a relation to a datacenter {1}', [serviceAccountSysId, datacenterSysId]));
		}
		
		return serviceAccountObj = {
			account_id: serviceAccountGlideRecord.account_id + '',
			datacenter_type: serviceAccountGlideRecord.datacenter_type + '',
			discovery_credentials: serviceAccountGlideRecord.discovery_credentials + '',
			object_id: serviceAccountGlideRecord.object_id + '',
			name: serviceAccountGlideRecord.name + '',
			datacenter_url: serviceAccountGlideRecord.datacenter_url + ''
		};
	}

	function findAndAddSourceNativeToDatacenterObject(datacenterObj) {
		/*
		 * In order for some of the patterns to succeed, we need to bring the source_native_key of the datacenter
		 * The reason is that LP patterns MAY NOT populate the datacenter CI with full identifiers
		 * If the pattern is configured to fetch source_native_key from the parent pattern, the CI can be identified immediately
		 * with source_native_key only
		 */
		var sysObjectSourceGlideRecord = new GlideRecord('sys_object_source');
		sysObjectSourceGlideRecord.addQuery('name', gs.getProperty('glide.discovery.source_name', 'ServiceNow')); // This is discovery source
		sysObjectSourceGlideRecord.addQuery('target_sys_id', datacenterObj.sys_id);
		sysObjectSourceGlideRecord.addQuery('target_table', datacenterObj.sys_class_name);
		// This is the source_native_key
		// For Discovery, 'ServiceNow' is set in case there is no source_native_key in the payload
		sysObjectSourceGlideRecord.addQuery('id', '!=', 'ServiceNow');
		sysObjectSourceGlideRecord.setLimit(1);
		sysObjectSourceGlideRecord.orderByDesc('last_scan');
		sysObjectSourceGlideRecord.query();
		
		if (sysObjectSourceGlideRecord.next())
			datacenterObj.source_native_key = sysObjectSourceGlideRecord.id + '';
	}

	function triggerQuickDiscoveryOnDatacenterForStatus(datacenterObj, statusId){
		var status = new DiscoveryStatus(statusId);
		
		if (!status.getSchedule())
			status.setSchedule(new DiscoveryCloudQuickSchedule());
		var serviceAccountObj = datacenterObj.serviceAccount;
		nodeLogger.debug(LOG_PREFIX + ' Datacenter ' + datacenterObj.name + ' under account ' + serviceAccountObj.name);

		var executionInfo = {
			discoveryType: discoveryType.cloudResources,
			status: statusId,
			name: status.getGlideRecord().getValue('description')
		};

		var cloudTopologyPatternsGlideRecord = DiscoveryPatternOrchestratorUtil.getPatternByDatacenterTypeAndTopology(serviceAccountObj.datacenter_type, discoveryTopologyType.datacentersDiscovery);

		if (cloudTopologyPatternsGlideRecord.getRowCount() == 0) {
			var message = gs.getMessage('No datacenter patterns found for datacenter: {0}. Canceling discovery', [JSON.stringify(datacenterObj)]);
			nodeLogger.error(LOG_PREFIX + ' ' + message);
			DiscoveryLogger.error(message, FILE_NAME);

			var dac =  new global.SncDiscoveryCancel();
			dac.cancelAll(executionInfo.status);

			throw new Error(message);
		}

		// Creating the completed parent execution which is the LDC so it can execute the child patterns
		cloudTopologyPatternsGlideRecord.next();
		setBasicExecutionInfoDetails(executionInfo, {
			patternId: cloudTopologyPatternsGlideRecord.pattern + '',
			patternName: cloudTopologyPatternsGlideRecord.pattern.name + '',
			mainCiType: cloudTopologyPatternsGlideRecord.pattern.ci_type + '',
			globalData: {
				name: '"' + executionInfo.name + '" Global Data',
				runDependentPatterns: true
			},
			inputParametersSnapshotSysIds: DiscoveryPatternOrchestratorUtil.createInputParametersSnapshot(),
			finalState: DiscoveryPatternOrchestratorFlowManager.executionState.completed
		});
		executionInfo.context = JSON.stringify(
			{
				cmdb_ci_cloud_service_account: [PatternPayloadUtil.valuesJsonObjectAsPayloadItem(serviceAccountObj, 'cmdb_ci_cloud_service_account')]
			}
		);


		executionInfo.ciToAttributedToBeUsedMap = DiscoveryPatternOrchestratorUtil.createClassAttributeMap(
			executionInfo, 
			cloudTopologyPatternsGlideRecord.pattern + '', 
			cloudTopologyPatternsGlideRecord.pattern.cpattern_type + ''
		);

		DiscoveryPatternOrchestratorUtil.addLaunchDetailsToExecution(executionInfo, {}, {}, new SNC.PrePatternExecutionData());
		var inputParametersSnapshot = DiscoveryPatternOrchestratorUtil.extractInputParametersFromContext(executionInfo.context.content);
		
		executionInfo.globalData.sysId = 
			DiscoveryPatternOrchestratorUtil.saveGlobalData(executionInfo.globalData);
		executionInfo.inputParametersSnapshotSysIds =
				DiscoveryPatternOrchestratorUtil.saveInputParametersSnapshot(inputParametersSnapshot);
		executionInfo.sysId = DiscoveryPatternOrchestratorUtil.createPatternExecutionWithState(executionInfo, DiscoveryPatternOrchestratorFlowManager.executionState.completed);

		var outputAttributeMap = DiscoveryPatternOrchestratorUtil.generateClassToAttributesMapFromOutputConfig(executionInfo.patternId);
		var payloadExtracted = PatternPayloadUtil.extractAttributesFromPayload([PatternPayloadUtil.valuesJsonObjectAsPayloadItem(datacenterObj, serviceAccountObj.datacenter_type)], outputAttributeMap);

		// Create an output record based on the context - This mimics a pattern's parent execution
		DiscoveryPatternOrchestratorUtil.saveExtractedPayload(executionInfo, payloadExtracted);

		nodeLogger.debug(LOG_PREFIX + ' executionInfo: ' + JSON.stringify(executionInfo, null, 2));
		nodeLogger.info(LOG_PREFIX + ' Starting cloud quick discovery');
		DiscoveryPatternOrchestratorFlowManager.prepareAndTriggerDependentPatterns(executionInfo);

		return status;
	}
	/*
	 * Creating pending execution records in 'sn_discovery_orchestrator_pattern_execution'
	 * This table is the orchestrator's main table for tracking the state of the running flow
	 *
	 * @param patternsToExecute - An array of pattern executions objects
	 *
	 * @return An array of all executions that were created successfully in CMDB
	 */
	function createPendingExecutionRecords(patternsToExecute) {
		var validPatternExecutions = patternsToExecute.filter(function(patternToExecute) {
			// Try to create an execution record in CMDB
			var patternExecutionSysId = DiscoveryPatternOrchestratorFlowManager.createPendingPatternExecution(patternToExecute);
			
			/*
			 * For the filter - keep only the ones that were successfully created
			 * That will ensure we are not triggering patterns that can't be tracked
			 * by the orchestrator
			 */
			return (!patternExecutionSysId) ? false : true;
		});
		
		return validPatternExecutions;
	}

	/*
	 * Triggers the patterns for a Serverless discovery
	 *
	 * @param patternsToExecute - An array of JS objects with details on the patterns to execute
	 * @param statusId - Status sys_id created for the triggered discovery
	 * @param scheduleId - Schedule sys_id
	 */
	function triggerServerlessDiscovery(patternsToExecute, statusId, scheduleId) {
		/*
		 * Executing the Serverless discovery by calling PatternLauncherManager, since
		 * this class already has the logic to run a Serverless schedule
		 * The result of the execution is an array of JS objects with the pattern sys_id
		 * and the output ECC queue sys_id, representing all patterns that were triggered
		 */
		var patternLauncher = new SNC.PatternLauncherManager();
		
		var serverlessExecutionsResultsInfo = patternLauncher.launch(statusId, scheduleId, DiscoveryPatternOrchestratorFlowLauncher.discoveryType.serverless);
		
		serverlessExecutionsResultsInfo = serverlessExecutionsResultsInfo ? JSON.parse(serverlessExecutionsResultsInfo) : [];

		// If nothing was triggered - Mark executions as canceled and quit
		if (serverlessExecutionsResultsInfo.length == 0) {
			var message = 'No patterns were triggered. Cancelling executions';
			nodeLogger.error(LOG_PREFIX + '[' + patternsToExecute[0].sysId + '] ' + message);
			DiscoveryLogger.error(message, FILE_NAME);

			patternsToExecute.forEach(function(patternExecution) {
				DiscoveryPatternOrchestratorUtil.setExecutionState(patternExecution.sysId, DiscoveryPatternOrchestratorFlowManager.executionState.canceled);
			});
			return;
		}
		
		/*
		 * TODO: In case only part of the executions were triggered, we need to cancel the rest
		 *
		 * After getting all the patterns that were executed by PatternLauncherManager, update
		 * the relevant execution to 'Running' state and update the ECC queue sys_id for it 
		 */
		patternsToExecute.forEach(function(patternExecution) {
			for (var index in serverlessExecutionsResultsInfo) {
				/*
				 * We compare the launchers because multiple launchers can have the same pattern with different
				 * values for the globals, so we must make sure the globals are attached to the correct execution
				 */
				if (patternExecution.globalData.scheduleLauncherId == serverlessExecutionsResultsInfo[index].scheduleLauncherId) {
					DiscoveryPatternOrchestratorUtil.markExecutionAsRunning(patternExecution.sysId, serverlessExecutionsResultsInfo[index].executionId);
					serverlessExecutionsResultsInfo.splice(index, 1);
					break;
				}
			}
		});
	}

	/*
	 * Sets basic information in the execution info object
	 *
	 * @param executionInfo - JS object containing information about an execution
	 * This is the object we want to extend with more details
	 * @param name - The name of the execution
	 * @param patternId - Pattern sys_id
	 * @param patternName - Pattern name
	 * @param mainCiType - Pattern main CI type
	 * @param runDependentPatterns - Whether we should run child patterns for this execution
	 */
	function setBasicExecutionInfoDetails(executionInfo, dataToFill) {
		for (var keyName in dataToFill)
			executionInfo[keyName] = dataToFill[keyName];
	}

	/*
	 * Gets the patterns need to be triggered at the beginning of a Serverless schedule
	 *
	 * @param scheduleId - Schedule sys_id
	 * @param executionInfoTemplate - JS object representing an execution with some common details in it
	 *
	 * @return An array of all executions need to be triggered at the beginning of a Serverless schedule
	 */
	function getServerlessEntryPointPatterns(scheduleId, executionInfoTemplate) {
		nodeLogger.debug(LOG_PREFIX + ' Searching "discovery_ptrn_hostless_lchr" for executions');

		// Get all Serverless execution records configured on the schedule
		var serverlessExecutionsGlideRecord = new GlideRecord('discovery_ptrn_hostless_lchr'),
			patternsToRun = [];
		
		serverlessExecutionsGlideRecord.addQuery('schedule', scheduleId);
		serverlessExecutionsGlideRecord.addQuery('active', true);
		serverlessExecutionsGlideRecord.query();

		// If no executions found - return []
		if (serverlessExecutionsGlideRecord.getRowCount() == 0) {
			var message = 'No executions found for serverless discovery';
			nodeLogger.error(LOG_PREFIX + ' ' + message);
			DiscoveryLogger.error(message, FILE_NAME);

			return patternsToRun;
		}

		// For each execution record in the schedule
		while (serverlessExecutionsGlideRecord.next()) {
			nodeLogger.debug(LOG_PREFIX + ' Found execution: "' + serverlessExecutionsGlideRecord.name + '", which will trigger "' + serverlessExecutionsGlideRecord.pattern.name + '"');
			nodeLogger.debug(LOG_PREFIX + ' Preparing execution info object for serverless execution: "' + serverlessExecutionsGlideRecord.name + '"');

			// Make a new copy from the JS object execution template
			var executionInfo = JSON.parse(JSON.stringify(executionInfoTemplate));
			var scheduleLauncherId = serverlessExecutionsGlideRecord.getUniqueValue() + '';
			
			// Add basic information on the execution based on the configured record
			setBasicExecutionInfoDetails(executionInfo, {
				name: serverlessExecutionsGlideRecord.name + '',
				patternId: serverlessExecutionsGlideRecord.pattern + '',
				patternName: serverlessExecutionsGlideRecord.pattern.name + '',
				mainCiType: serverlessExecutionsGlideRecord.pattern.ci_type + '',
				globalData: {
					name: serverlessExecutionsGlideRecord.name + ' Global Data',
					runDependentPatterns: serverlessExecutionsGlideRecord.run_child_patterns + '',
					scheduleLauncherId: scheduleLauncherId
				}
			});

			/*
			 * Add launch details to the execution
			 * This includes: probe values, probe params and pre-execution object
			 * There are required for launching a pattern
			 */
			DiscoveryPatternOrchestratorUtil.addLaunchDetailsToExecution(executionInfo, {}, {}, new SNC.PrePatternExecutionData());

			var inputParametersSnapshot;
			/*
			 * In case of extended parameters, we have a context configured for the Serverless
			 * execution record
			 *
			 * A context represents a pattern running in the middle of a flow, but since this is
			 * Serverless discovery, we need to mimic as if we ran parent patterns even though we didn't
			 *
			 * This is done by pushing the context configured into the executionInfo AND creating a
			 * record in the output table based on the context
			 * This will make the Orchestrator think that the parent patterns ran and prepared data
			 * for the current one to run
			 */
			if (serverlessExecutionsGlideRecord.use_extended_parameters + '' == 'true') {
				// Add the configured context to executionInfo
				DiscoveryPatternOrchestratorUtil.addContextFromExtParams(
					serverlessExecutionsGlideRecord.sys_id + '', 
					executionInfo
				);
				// Get input attributes needed from the context
				executionInfo.ciToAttributedToBeUsedMap = 
					DiscoveryPatternOrchestratorUtil.createClassAttributeMap(
						executionInfo, 
						serverlessExecutionsGlideRecord.pattern + '', 
						serverlessExecutionsGlideRecord.pattern.cpattern_type + ''
					);
				// Create an output record based on the context - This mimics a pattern's parent execution
				var filteredPayload = DiscoveryPatternOrchestratorUtil.filterPayload(executionInfo, executionInfo.context.content.tables);
				DiscoveryPatternOrchestratorUtil.saveExtractedPayload(executionInfo, filteredPayload);
				
				inputParametersSnapshot = DiscoveryPatternOrchestratorUtil.extractInputParametersFromContext(executionInfo.context.content);
			} else {
				inputParametersSnapshot = DiscoveryPatternOrchestratorUtil.extractInputParametersFromLauncher(scheduleLauncherId);
			}

			/*
			 * The reason for saving the global data and input parameters at the end is in case we have manual entry configured
			 * In this case, we want to make sure the data is saved and linked to the execution properly
			 * In addition, this way the debugger can fetch it for the "From Execution" option
			 */
			executionInfo.globalData.sysId = 
				DiscoveryPatternOrchestratorUtil.saveGlobalData(executionInfo.globalData);
			executionInfo.inputParametersSnaphotSysIds =
				DiscoveryPatternOrchestratorUtil.saveInputParametersSnapshot(inputParametersSnapshot);
			
			patternsToRun.push(executionInfo);
		}

		return patternsToRun;
	}

	/*
	 * Gets the patterns need to be triggered at the beginning of a 'Cloud Resources' schedule
	 *
	 * @param serviceAccount - The service account of the schedule running
	 * @param executionInfoTemplate - JS object representing an execution with some common details in it
	 *
	 * @return An array of all executions need to be triggered at the beginning of a 'Cloud Resources' schedule
	 */
	function getEntryPointPatternExecutionsByAccount(serviceAccount, executionInfoTemplate) {
		/*
		 * We are using the Cloud Wizard tables in order to find the service account's pattern
		 * In this case we look at 'sa_cloud_topology_discovery_pattern' table for all patterns
		 * related to specific LDC type and the phase is service account validation
		 */
		nodeLogger.debug(LOG_PREFIX + ' Searching "sa_cloud_topology_discovery_pattern" for service account pattern for service account: ' + JSON.stringify(serviceAccount));

		var patternsToRun = [],
			cloudTopologyPatternsGlideRecord = DiscoveryPatternOrchestratorUtil.getPatternByDatacenterTypeAndTopology(serviceAccount.datacenterType, discoveryTopologyType.serviceAccountDiscovery);

		// In case nothing found - return no executions
		if (cloudTopologyPatternsGlideRecord.getRowCount() == 0) {
			var message = 'No service account patterns found for account: ' + JSON.stringify(serviceAccount);
			nodeLogger.error(LOG_PREFIX + ' ' + message);
			DiscoveryLogger.error(message, FILE_NAME);

			return patternsToRun;
		}
		
		// For each service account found, build an executionInfo for it
		while (cloudTopologyPatternsGlideRecord.next()) {
			nodeLogger.debug(LOG_PREFIX + ' Found pattern: "' + cloudTopologyPatternsGlideRecord.pattern.name + '"');
			nodeLogger.debug(LOG_PREFIX + ' Preparing pre-execution data');

			// Push the service account to the pre-execution
			var preExecutionData = new SNC.PrePatternExecutionData();
			preExecutionData.addTableEntry('service_account',{
				account_id: serviceAccount.accountId,
				datacenter_type: serviceAccount.datacenterType,
				discovery_credentials: serviceAccount.credentialSysId,
				object_id: serviceAccount.objectId,
				name: serviceAccount.name,
				datacenter_url: serviceAccount.datacenterURL,
				is_master_account: serviceAccount.isMasterAccount
			});

			nodeLogger.debug(LOG_PREFIX + ' Pre-execution data for pattern "' + cloudTopologyPatternsGlideRecord.pattern.name + '":\n' + (preExecutionData.getJSON() || '{}'));
			nodeLogger.debug(LOG_PREFIX + ' Preparing execution info object for pattern: "' + cloudTopologyPatternsGlideRecord.pattern.name + '"');

			// Make a copy of the execution's template and set basic details on this execution
			var executionInfo = JSON.parse(JSON.stringify(executionInfoTemplate));

			setBasicExecutionInfoDetails(executionInfo, {
				name: serviceAccount.accountId,
				patternId: cloudTopologyPatternsGlideRecord.pattern + '',
				patternName: cloudTopologyPatternsGlideRecord.pattern.name + '',
				mainCiType: cloudTopologyPatternsGlideRecord.pattern.ci_type + '',
				globalData: {
					name: serviceAccount.accountId + ' Global Data',
					runDependentPatterns: true,
					scheduleLauncherId: ''
				},
				inputParametersSnaphotSysIds: DiscoveryPatternOrchestratorUtil.createInputParametersSnapshot()
			});
			executionInfo.globalData.sysId = DiscoveryPatternOrchestratorUtil.saveGlobalData(executionInfo.globalData);

			// Add launching information - required for PatternLauncherManager
			DiscoveryPatternOrchestratorUtil.addLaunchDetailsToExecution(executionInfo, {}, {}, preExecutionData);

			patternsToRun.push(executionInfo);
		}

		return patternsToRun;
	}
	
	function attachPatternExecutionToInputParamsSnapshot(patternsExecutions) {
		patternsExecutions.forEach(function(patternExecution) {
			var patternExecutionLocalDataGlideRecord = new GlideRecord(INPUT_PARAMETERS_SNAPSHOT_TABLE_NAME);
		
			patternExecutionLocalDataGlideRecord.addQuery('sys_id', patternExecution.inputParametersSnaphotSysIds);
			patternExecutionLocalDataGlideRecord.query();
			patternExecutionLocalDataGlideRecord.setValue('pattern_orchestrator_execution', patternExecution.sysId);
			patternExecutionLocalDataGlideRecord.updateMultiple();
		});
	}
})();
