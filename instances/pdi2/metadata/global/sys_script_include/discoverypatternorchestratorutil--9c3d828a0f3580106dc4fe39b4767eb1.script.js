var DiscoveryPatternOrchestratorUtil;

(function() {
	/**********************************************
					  Constants
	***********************************************/
	var LOGGER_NAME = 'DiscoveryPatternOrchestrator',
		LOG_PREFIX = '[' + LOGGER_NAME + ']',
		FILE_NAME = 'DiscoveryPatternOrchestratorUtil',
		PATTERN_EXECUTION_TABLE_NAME = 'sn_discovery_orchestrator_pattern_execution',
		PATTERN_EXECUTION_GLOBALS_TABLE_NAME = 'sn_discovery_orchestrator_pattern_execution_global_data',
		INPUT_PARAMETERS_SNAPSHOT_TABLE_NAME = 'sn_discovery_input_parameters_snapshot',
		PATTERN_ORCHESTRATOR_TRIGGER_RULE_TABLE_NAME = 'sn_pattern_trigger_rule',
		PATTERN_LAUNCHER_PARAMETERS_TABLE_NAME = 'discovery_ptrn_lnch_param',
		PATTERN_LAUNCHER_PARAM_EXT_TABLE_NAME = 'discovery_ptrn_lnch_param_ext';

	/**********************************************
				    Local Variables
	***********************************************/
	var nodeLogger = new sn_automation.AutomationAPI().getNodeLogger(LOGGER_NAME);

	/**********************************************
					  Public API
	***********************************************/

	DiscoveryPatternOrchestratorUtil = {
		getExecutionRecordByStatusOrExecutionId: _getExecutionRecordByStatusOrExecutionId,
		generateClassToAttributesMapFromOutputConfig: _generateClassToAttributesMapFromOutputConfig,
		enhanceExecutionInfoFromGlideRecord: _enhanceExecutionInfoFromGlideRecord,
		addLaunchDetailsToExecution: _addLaunchDetailsToExecution,
		buildPreExecutionDataFromContext: _buildPreExecutionDataFromContext,
		cancelExecutions: _cancelExecutions,
		getNodeLogger: _getNodeLogger,
		setExecutionState: _setExecutionState,
		addContextFromExtParams: _addContextFromExtParams,
		createClassAttributeMap: _createClassAttributeMap,
		filterPayload: _filterPayload,
		saveExtractedPayload: _saveExtractedPayload,
		markExecutionAsRunning: _markExecutionAsRunning,
		getNextPhase: _getNextPhase,
		setStatusWithNextPhase: _setStatusWithNextPhase,
		setExecutionStateByOutputEccId: _setExecutionStateByOutputEccId,
		getScheduleLauncherGlobals: _getScheduleLauncherGlobals,
		createInputParametersSnapshot: _createInputParametersSnapshot,
		saveInputParametersSnapshot: _saveInputParametersSnapshot,
		extractInputParametersFromLauncher: _extractInputParametersFromLauncher,
		getGlobalVariablesAsJson: _getGlobalVariablesAsJson,
		saveGlobalData: _saveGlobalData,
		getSavedGlobalData: _getSavedGlobalData,
		extractInputParametersFromContext: _extractInputParametersFromContext,
		getPatternByDatacenterTypeAndTopology: _getPatternByDatacenterTypeAndTopology,
		createPatternExecutionWithState: _createPatternExecutionWithState,
		exceedChildPatternLimit: _exceedChildPatternLimit,
		LOG_PREFIX: LOG_PREFIX
	};

	function _getExecutionRecordByStatusOrExecutionId(statusId, executionId) {
		var patternExecutionGlideRecord = new GlideRecord(PATTERN_EXECUTION_TABLE_NAME);

		if (statusId)
			patternExecutionGlideRecord.addQuery('discovery_status', statusId);

		if (executionId)
			patternExecutionGlideRecord.addQuery('launcher', executionId);
		patternExecutionGlideRecord.setLimit(1);
		patternExecutionGlideRecord.query();

		return patternExecutionGlideRecord;
	}

	function _generateClassToAttributesMapFromOutputConfig(patternId) {
		var patternOutputConfigGr = new GlideRecord('sn_pattern_outputs'),
			outputAttributeMap = {};
		patternOutputConfigGr.addQuery('pattern_id', patternId);
		patternOutputConfigGr.query();

		while (patternOutputConfigGr.next()) {
			var className = patternOutputConfigGr.ci_class_type + '';
			outputAttributeMap[className] = patternOutputConfigGr.getValue('variable_names')
				.split(',')
				.map(function(value) {
					return value.trim();
				});

			if (outputAttributeMap[className].indexOf('name') == -1)
				outputAttributeMap[className].push('name');
		}

		return outputAttributeMap;
	}

	function _enhanceExecutionInfoFromGlideRecord(patternExecutionGlideRecord, executionInfo) {
		executionInfo.sysId = patternExecutionGlideRecord.getUniqueValue() + '';
		executionInfo.name = patternExecutionGlideRecord.name + '';
		executionInfo.context = patternExecutionGlideRecord.available_context + '';
		executionInfo.parentExecution = patternExecutionGlideRecord.parent_execution + '';
		executionInfo.discoveryType = patternExecutionGlideRecord.discovery_status.dscheduler.discover + '';
		executionInfo.mainCiType = patternExecutionGlideRecord.pattern.ci_type + '';
		executionInfo.patternName = patternExecutionGlideRecord.pattern.name + '';
		executionInfo.patternId = patternExecutionGlideRecord.pattern + '';
		executionInfo.schedule = patternExecutionGlideRecord.discovery_status.dscheduler + '';
		executionInfo.rootExecution = patternExecutionGlideRecord.root_execution + '';
		executionInfo.globalData = _getSavedGlobalData(
			patternExecutionGlideRecord.execution_global_data + ''
		);
	}

	function _addLaunchDetailsToExecution(executionInfo, probeParams, probeValues, preExecutionData) {
		if (!executionInfo.hasOwnProperty('patternLaunchInfo'))
			executionInfo.patternLaunchInfo = {};

		executionInfo.patternLaunchInfo.probeParams = probeParams;
		executionInfo.patternLaunchInfo.probeValues = probeValues;
		executionInfo.patternLaunchInfo.preExecutionData = preExecutionData;
	}

	function _buildPreExecutionDataFromContext(context, pattern) {
		var preExecutionData = new SNC.PrePatternExecutionData();

		if (!context)
			return preExecutionData;

		if (context.content.globalVariables) {
			for (var globalVariableName in context.content.globalVariables)
				preExecutionData.addString(globalVariableName, context.content.globalVariables[globalVariableName]);
		}

		/*
		 * This is here for Pattern Debugger flow
		 * No runtime code should have local variables
		 *
		 * Local variables are being used by Pattern Debugger in order to debug Serverless
		 * root patterns running from an existing execution
		 * In that case, the user doesn't enter the input parameters and the debugger needs to
		 * figure out the globals and other input parameters [= local] to import into the debug session
		 */
		if (context.content.localVariables) {
			for (var localVariableName in context.content.localVariables)
				preExecutionData.addString(localVariableName, context.content.localVariables[localVariableName]);
		}

		if (!context.content.tables)
			return preExecutionData;

		var patternType = _getPatternType(pattern);

		for (var className in context.content.tables) {
			var inputParamsGlideRecord = _getInputParametersByPatternAndParentClass(pattern, className);

			var saveAs = className;
			if (!inputParamsGlideRecord.next()) {
				// Check whether we are assigning service_account, this is a special case that we always want to transfer data for when in cloud resource patterns
				if(className == 'cmdb_ci_cloud_service_account' && patternType == 4)
					saveAs = 'service_account';
				else
					// Basically means that we have something in the context that is not requested by input parameters!
					// E.g. if VMs run after disks to calculate disk size, we don't need the VMs as input, so we can skip
					continue;

			} else
				saveAs = inputParamsGlideRecord.key + '';

			context.content.tables[className].forEach(function(item) {
				preExecutionData.addTableEntry(saveAs, item.values);
			});
		}

		return preExecutionData;
	}

	function _getInputParametersByPatternAndParentClass(pattern, ciType) {
		var inputParamsGlideRecord = new GlideRecord('discovery_ptrn_lnch_param_def_ext');

		inputParamsGlideRecord.addQuery('pattern', pattern);

		if (ciType)
			inputParamsGlideRecord.addQuery('ci_class', ciType);
		inputParamsGlideRecord.setLimit(1);
		inputParamsGlideRecord.query();

		return inputParamsGlideRecord;
	}

	function _getPatternType(patternId) {
		var patternTypeGlideRecord = new GlideRecord('sa_pattern');

		if(!patternTypeGlideRecord.get(patternId + ''))
			return null;

		return patternTypeGlideRecord.cpattern_type;
	}

	function _cancelExecutions(statusId) {
		var executionState = DiscoveryPatternOrchestratorFlowManager.executionState;

		var patternExecutionGlideRecord = new GlideRecord(PATTERN_EXECUTION_TABLE_NAME);
		patternExecutionGlideRecord.addQuery('discovery_status', statusId);
		patternExecutionGlideRecord.addQuery('state', 'IN', [ executionState.pending, executionState.running ]);

		patternExecutionGlideRecord.setValue('state', executionState.canceled);
		patternExecutionGlideRecord.updateMultiple();
	}

	function _getNodeLogger() {
		return nodeLogger;
	}

	function _setExecutionState(sysId, state) {
		var patternExecutionGlideRecord = new GlideRecord(PATTERN_EXECUTION_TABLE_NAME);

		if (!patternExecutionGlideRecord.get(sysId))
			return false;
		
		patternExecutionGlideRecord.state = state;
		
		if (!patternExecutionGlideRecord.update())
			return false;

		return true;
	}

	function _addContextFromExtParams(serverlessLauncherSysId, executionInfo) {
		var patternLauncherParamExtGlideRecord = new GlideRecord(PATTERN_LAUNCHER_PARAM_EXT_TABLE_NAME);
		patternLauncherParamExtGlideRecord.addQuery('pattern_launcher', serverlessLauncherSysId);
		patternLauncherParamExtGlideRecord.query();

		if (patternLauncherParamExtGlideRecord.next()) {
			executionInfo.context = {};
			try {
				executionInfo.context.content = JSON.parse(patternLauncherParamExtGlideRecord.value + '');
			} catch (e) {
				var message = 'Error parsing JSON input param. Can\'t add it as a context.\nJSON: ' + patternLauncherParamExtGlideRecord.value + '\nError: ' + e.message;
				nodeLogger.error(LOG_PREFIX + ' ' + message);
				DiscoveryLogger.error(message, FILE_NAME);
			}
		}
	}

	function _createClassAttributeMap(executionInfo, childPatternId, childPatternType) {
		// executionInfo.sysId will be empty in case of quick discovery. We create the execution later
		var executionSysIdLogFormat = executionInfo.sysId ? '[' + executionInfo.sysId + ']' : '';
		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Querying extended inputs configuration table...');

		var inputParamsGlideRecord = new GlideRecord('discovery_ptrn_lnch_param_def_ext');
		inputParamsGlideRecord.addQuery('pattern', childPatternId);
		inputParamsGlideRecord.query();

		var classAttributeMap = {};

		while (inputParamsGlideRecord.next())
			classAttributeMap[inputParamsGlideRecord.ci_class] = inputParamsGlideRecord.ci_attributes + '';

		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Attribute mapping for child pattern:\n' + JSON.stringify(classAttributeMap));

		if (childPatternType == 4 && !classAttributeMap.hasOwnProperty('cmdb_ci_cloud_service_account')) {
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' No service account found as an input. Adding cmdb_ci_cloud_service_account class...');
			var tableDescriptor = global.GlideTableDescriptor.get('cmdb_ci_cloud_service_account');
			var fields = tableDescriptor.getActiveFieldNames().toArray().join();

			fields = fields ? (fields + ',source_native_key') : 'source_native_key';
			classAttributeMap['cmdb_ci_cloud_service_account'] = fields;
		}
		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Final attribute mapping for child pattern:\n' + JSON.stringify(classAttributeMap));

		return classAttributeMap;
	}

	function _filterPayload(executionInfo, payload) {
		var executionSysIdLogFormat = '[' + executionInfo.sysId + ']';
		var wereFiltersRan = false;
		var filteredPayload = {};

		for (var key in payload) {
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Searching filters for class "' + key + '"');
			var discoveryTypeFilter = PatternPayloadUtil.chooseDiscoveryTypeFilter(executionInfo.discoveryType);
			var filtersToRun = discoveryTypeFilter.filter(function(filter){
				if (filter.includeExtendedTables)
					return GlideDBObjectManager.getTables(key).contains(filter.classType);
				else
					return (key == filter.classType);
			});

			if (filtersToRun.length == 0) {
				nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' No filters found for class ' + key);
				continue;
			}

			for (var filterKey in filtersToRun)
				nodeLogger.debug(LOG_PREFIX + ' Filter found for class ' + key + ': "' + filtersToRun[filterKey].name + '"');

			filteredPayload[key] = PatternPayloadUtil.filterPayload(filtersToRun, payload[key], executionInfo);
			wereFiltersRan = true;
		}

		if (wereFiltersRan) {
			if (JSUtil.isEmpty(filteredPayload))
				nodeLogger.warn(LOG_PREFIX + executionSysIdLogFormat + ' No items left after running filter(s).\nPlease make sure the data fetched is matched with the configuration configured on "Cloud Wizard"');
			return filteredPayload;
		}
		return payload;
	}

	function _saveExtractedPayload(executionInfo, payload, pageNumber) {
		if (!pageNumber)
			pageNumber = '1';

		var executionSysIdLogFormat = '[' + executionInfo.sysId + ']';
		var pageNumbers = pageNumber.split('.');

		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' About to save data to output table...\nPattern: ' + executionInfo.patternName + '\nOrchestrator Page: ' + pageNumbers[0] + '\nMultipage: ' + (pageNumbers[1] || 'None'));

		for (var key in payload) {
			var outputRecordTemplate = {
				'pattern_execution': executionInfo.sysId,
				'pattern': executionInfo.patternId,
				'class': key,
				'discovery_status': executionInfo.status,
				'payload_number': pageNumbers[0],
				'multipage_number': pageNumbers[1] || ''
			};

			payload[key].forEach(function(item) {
				var outputRecord = JSON.parse(JSON.stringify(outputRecordTemplate));
				outputRecord.payload = JSON.stringify(item);

				var recordsUpdatedOrInserted = SNC.PatternOutputsDBAction.insert(JSON.stringify(outputRecord));

				if (recordsUpdatedOrInserted == 1)
					nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Output inserted\\updated successfully for item ' + outputRecord.payload);
				else
					nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Problem saving output for item ' + outputRecord.payload + ' [Potential duplicate]');
			});
		}
	}
	
	function _markExecutionAsRunning(sysId, executionId) {
		var executionSysIdLogFormat = '[' + executionId + ']';

		var patternExecutionGlideRecord = new GlideRecord(PATTERN_EXECUTION_TABLE_NAME);

		if (!patternExecutionGlideRecord.get(sysId)) {
			nodeLogger.warn(LOG_PREFIX + executionSysIdLogFormat + ' No execution record found. Can\'t update the execution ID [ECC queue output] for execution: ' + sysId);
			return false;
		}

		patternExecutionGlideRecord.launcher = executionId + '';
		patternExecutionGlideRecord.state = DiscoveryPatternOrchestratorFlowManager.executionState.running;

		if (!patternExecutionGlideRecord.update()) {
			var message = 'Error updating execution ID [ECC queue output] for execution: ' + sysId + '\nCan\'t track discovery';
			nodeLogger.error(LOG_PREFIX + executionSysIdLogFormat + ' ' + message);
			DiscoveryLogger.error(message, FILE_NAME);
			DiscoveryPatternOrchestratorUtil.setExecutionState(sysId, DiscoveryPatternOrchestratorFlowManager.executionState.canceled);
			return false;
		}
		return true;
	}

	function _getNextPhase(discoveryType) {
		if (discoveryType == DiscoveryPatternOrchestratorFlowLauncher.discoveryType.cloudResources)
			return 'Cloud Legacy Discovery';
		return 'Finished';
	}

	function _setStatusWithNextPhase(status, phase) {
		var discoveryStatusGlideRecord = new GlideRecord('discovery_status');

		if (discoveryStatusGlideRecord.get('sys_id', status)) {
			discoveryStatusGlideRecord.phase = phase;
			discoveryStatusGlideRecord.update();
		}
	}
	
	function _setExecutionStateByOutputEccId(outputEccId, patternResultStatus) {
		var patternExecutionGlideRecord = new GlideRecord(PATTERN_EXECUTION_TABLE_NAME);
		patternExecutionGlideRecord.addQuery('launcher', outputEccId);
		patternExecutionGlideRecord.query();
		
		if (!patternExecutionGlideRecord.next())
			return false;

		var finalState = DiscoveryPatternOrchestratorFlowManager.executionState.failed;

		if (patternResultStatus == DiscoveryPatternOrchestratorEventHandler.patternResultStatus.succeed)
			finalState = DiscoveryPatternOrchestratorFlowManager.executionState.completed;
		patternExecutionGlideRecord.state = finalState;

		return patternExecutionGlideRecord.update();
	}

	function _getScheduleLauncherGlobals(scheduleLaunchersGlideRecord) {
		if (!scheduleLaunchersGlideRecord)
			return {};

		var scheduleLauncherId = scheduleLaunchersGlideRecord.getUniqueValue() + '';

		if (!scheduleLauncherId)
			return {};

		var globals = {},
			patternLauncherGlobalParameters = new GlideRecord(PATTERN_LAUNCHER_PARAMETERS_TABLE_NAME);
		
		patternLauncherGlobalParameters.addQuery('pattern_launcher', scheduleLauncherId);
		patternLauncherGlobalParameters.addQuery('param.is_global', true);
		patternLauncherGlobalParameters.addNotNullQuery('value');
		patternLauncherGlobalParameters.query();
		
		while (patternLauncherGlobalParameters.next()) {
			globals[patternLauncherGlobalParameters.param.key + ''] = 
				patternLauncherGlobalParameters.value + '';
		}
		
		return globals;
	}
	
	function _createInputParametersSnapshot(scheduleLaunchersGlideRecord) {
		if (!scheduleLaunchersGlideRecord)
			return [];
		var scheduleLauncherId = scheduleLaunchersGlideRecord.getUniqueValue() + '';

		if (!scheduleLauncherId)
			return [];
		var inputParametersSnapshot = _extractInputParametersFromLauncher(scheduleLauncherId);

		return _saveInputParametersSnapshot(inputParametersSnapshot);
	}
	
	function _saveInputParametersSnapshot(inputParametersSnapshot) {
		if (!inputParametersSnapshot)
			return [];
		var inputParametersSnaphotSysIds = [];
		
		Object.keys(inputParametersSnapshot).forEach(function(inputParameterName) {
			var inputParamsSnapshotGlideRecord = new GlideRecord(INPUT_PARAMETERS_SNAPSHOT_TABLE_NAME);
			inputParamsSnapshotGlideRecord.initialize();

			inputParamsSnapshotGlideRecord.name = inputParameterName;
			inputParamsSnapshotGlideRecord.value = inputParametersSnapshot[inputParameterName].value;
			inputParamsSnapshotGlideRecord.is_global = inputParametersSnapshot[inputParameterName].isGlobal;
			
			var sysId = inputParamsSnapshotGlideRecord.insert();
			
			if (sysId)
				inputParametersSnaphotSysIds.push(sysId);
		});

		return inputParametersSnaphotSysIds;
	}
	
	function _extractInputParametersFromLauncher(scheduleLauncherId) {
		var inputParameters = {};
		var patternLauncherLocalParameters = new GlideRecord(PATTERN_LAUNCHER_PARAMETERS_TABLE_NAME);
		
		patternLauncherLocalParameters.addQuery('pattern_launcher', scheduleLauncherId);
		patternLauncherLocalParameters.query();

		while (patternLauncherLocalParameters.next()) {
			inputParameters[patternLauncherLocalParameters.param.key + ''] = {
				value: patternLauncherLocalParameters.value + '',
				isGlobal: patternLauncherLocalParameters.param.is_global + ''
			};
		}
		
		return inputParameters;
	}
	
	function _getGlobalVariablesAsJson(rootExecutionSysId) {
		var inputParameters = {},
			inputParamsSnapshotGlideRecord = new GlideRecord(INPUT_PARAMETERS_SNAPSHOT_TABLE_NAME);
		
		inputParamsSnapshotGlideRecord.addQuery('pattern_orchestrator_execution', rootExecutionSysId);
		inputParamsSnapshotGlideRecord.addQuery('is_global', true);
		inputParamsSnapshotGlideRecord.query();
		
		while (inputParamsSnapshotGlideRecord.next()) {
			inputParameters[inputParamsSnapshotGlideRecord.name + ''] = 
				inputParamsSnapshotGlideRecord.value + '';
		}
		
		return inputParameters;
	}

	/*
	 * Creates global data record for an Orchestrator's execution
	 *
	 * @param globalData - An object contains all the globals to be saved for the rest of the flow
	 *
	 * @return The sysid of the global record created
	 */
	function _saveGlobalData(globalData) {
		if (!globalData)
			return '';
		var patternExecutionGlobalDataGlideRecord = new GlideRecord(PATTERN_EXECUTION_GLOBALS_TABLE_NAME);
		
		if (globalData.sysId)
			patternExecutionGlobalDataGlideRecord.get(globalData.sysId + '');
		else
			patternExecutionGlobalDataGlideRecord.initialize();
		
		patternExecutionGlobalDataGlideRecord.name = globalData.name;
		patternExecutionGlobalDataGlideRecord.schedule_launcher = globalData.scheduleLauncherId || '';
		patternExecutionGlobalDataGlideRecord.run_dependent_patterns = globalData.runDependentPatterns || '';
				
		return patternExecutionGlobalDataGlideRecord.insertOrUpdate();
	}
	
	/*
	 * Creates global data object based on global data saved in 
	 * sn_discovery_orchestrator_pattern_execution_global_data
	 *
	 * @param globalDataRecordSysId - The sys_id of the record containint the global information
	 * for a specific flow
	 *
	 * @return JSON containing global data for a flow
	 */
	function _getSavedGlobalData(globalDataRecordSysId) {
		if (!globalDataRecordSysId)
			return {};

		var patternExecutionGlobalDataGlideRecord = new GlideRecord(PATTERN_EXECUTION_GLOBALS_TABLE_NAME),
			// In case we have sys_id, have a minimal object to return
			globalData = {
				sysId: globalDataRecordSysId
			};
		
		if (patternExecutionGlobalDataGlideRecord.get(globalDataRecordSysId)) {
			globalData.scheduleLauncherId = patternExecutionGlobalDataGlideRecord.schedule_launcher || '';
			globalData.runDependentPatterns = 
				patternExecutionGlobalDataGlideRecord.run_dependent_patterns == true;
		}
		
		return globalData;
	}
	
	function _extractInputParametersFromContext(executionContext) {
		if (!executionContext)
			return [];
		var globalVariables = executionContext.globalVariables || {};
		var localVariables = executionContext.localVariables || {};

		if (!globalVariables && !localVariables)
			return [];
		
		var consolidatedVariables = {};
		
		Object.keys(globalVariables).forEach(function(globalVariableName) {
			consolidatedVariables[globalVariableName] = {
				value: globalVariables[globalVariableName],
				isGlobal: true
			};
		});
		
		Object.keys(localVariables).forEach(function(localVariableName) {
			consolidatedVariables[localVariableName] = {
				value: localVariables[localVariableName],
				isGlobal: false
			};
		});

		return consolidatedVariables;
	}

	function _getPatternByDatacenterTypeAndTopology(datacenterType, discoveryTopology) {
		var cloudTopologyPatternsGlideRecord = new GlideRecord('sa_cloud_topology_discovery_pattern');
		cloudTopologyPatternsGlideRecord.addQuery('discover_topology_type', discoveryTopology);
		cloudTopologyPatternsGlideRecord.addQuery('datacenter_type', datacenterType);
		cloudTopologyPatternsGlideRecord.addQuery('active', 'true');
		cloudTopologyPatternsGlideRecord.query();
		
		return cloudTopologyPatternsGlideRecord;
	}
	
	/*
	 * Creates a pending execution for a pattern
	 *
	 * @param patternExecution - JS object containing all information for a pattern to be executed
	 * @param state - The execution state to create the record with
	 *
	 * Since this object contains the full context\data available for this pattern from ALL ancestors,
	 * this function also replaces the context with the used_context [after filtering it using ciToAttributedToBeUsedMap]
	 * in order to save memory
	 *
	 * @return The sys_id of the created record
	 */
	function _createPatternExecutionWithState(patternExecution, state) {
		nodeLogger.info(LOG_PREFIX + ' Creating an execution record for "' + patternExecution.patternName + '"');

		// Initialize basic information for execution
		var contextPayload, contextToUse;
		var patternExecutionGlideRecord = new GlideRecord(PATTERN_EXECUTION_TABLE_NAME);
		patternExecutionGlideRecord.initialize();
		patternExecutionGlideRecord.active = true;
		patternExecutionGlideRecord.discovery_status = patternExecution.status;
		patternExecutionGlideRecord.state = state;
		patternExecutionGlideRecord.pattern = patternExecution.patternId;
		patternExecutionGlideRecord.parent_execution = patternExecution.parentExecution || '';
		patternExecutionGlideRecord.name = patternExecution.name || patternExecution.patternName;
		patternExecutionGlideRecord.execution_global_data = patternExecution.globalData.sysId;
		patternExecutionGlideRecord.root_execution = patternExecution.rootExecution;

		// In case we have a context, filter it by Orchestrator's input and use the new context
		if (patternExecution.context && patternExecution.context.content.tables) {
			contextPayload = patternExecution.context.content.tables;

			if (JSUtil.isEmpty(contextPayload)) {
				patternExecutionGlideRecord.available_context = '';
				patternExecutionGlideRecord.used_context = '';
			} else {
				contextToUse = _getUsedContextFromAvailableContext(contextPayload, patternExecution.ciToAttributedToBeUsedMap);

				patternExecution.context.content.tables = contextToUse;

				patternExecutionGlideRecord.available_context = JSON.stringify(contextPayload);
				patternExecutionGlideRecord.used_context = JSON.stringify(contextToUse);
			}
		}

		var sysId = patternExecutionGlideRecord.insert();

		if (sysId == null) {
			var message = LOG_PREFIX + ' Error while creating an execution record for ' + patternExecution.name;
			nodeLogger.error(message);
			nodeLogger.debug(LOG_PREFIX + ' Full execution info: ' + JSON.stringify(patternExecution));
			DiscoveryLogger.error(message, FILE_NAME);
			
			return '';
		}

		nodeLogger.debug(
			LOG_PREFIX + 'Execution info:\n'
			+ 'System ID [sys_id]: ' + sysId + '\n'
			+ 'Name: ' + (patternExecution.name || patternExecution.patternName) + '\n'
			+ 'DiscoveryStatus:' + patternExecution.status + '\n'
			+ 'State: ' + state + '\n'
			+ 'Pattern: ' + patternExecution.patternName + '[' + patternExecution.patternId + ']\n'
			+ 'Parent Execution: ' + (patternExecution.parentExecution || '') + '\n'
			+ 'Root Execution: ' + (patternExecution.rootExecution) + '\n'
			+ 'Available Context: ' + (JSON.stringify(contextPayload) || '') + '\n'
			+ 'Context To Use: ' + (JSON.stringify(contextToUse) || '')
		);

		return sysId;
	}

	/**********************************************
					Private Helpers
	***********************************************/

	/*
	 * Based on all data available for a pattern, get only the information asked by it
	 * according to the input configuration
	 *
	 * @param availableContext - The full context avalable for a pattern
	 * @param classToAttributesMapping - A map containing the attributes required by the pattern
	 * for each CI type requested
	 * Structure:
	 * {
	 *    ci_type_1: 'att1, att2',
	 *    ci_type_2: 'att1, att2',
	 *    ...
	 * }
	 *
	 * @return A JS context object containing only the requested data by the pattern [= used context]
	 */
	function _getUsedContextFromAvailableContext(availableContext, classToAttributesMapping) {
		var contextToUse = {};

		if (availableContext == null || classToAttributesMapping == null)
			return contextToUse;

		/*
		 * For each CI class, extract requested attributes from availableContext and save it into the
		 * new context object
		 */
		for (var ciName in classToAttributesMapping)	{
			var extractedPayload = PatternPayloadUtil.extractAttributesFromPayload(availableContext[ciName], classToAttributesMapping);

			contextToUse[ciName] = extractedPayload[ciName];
		}

		return contextToUse;
  }

	/*
	 * Checks if the number of child patterns about to be triggered exceeds a limit
	 *
	 * This function calculates how many child patterns are about to be triggered
	 * Each object returned by a pattern saved as a different record, therefore the number
	 * of rows in 'sn_discovery_orchestrator_pattern_output' [=outputDataRowCount] for a specific
	 * execution equals to the number of CIs saved aside in order to be passed to child patterns
	 *
	 * For example if LDC pattern saved 20 LDCs and a child pattern was configured with 6 as batch size,
	 * the number of child patterns need to be triggered is: 20/6 + 1 = 4
	 * The +1 is because 20/6 = 3 which means we have 2 records left to handle so we need another execution for it
	 * At the end we end up with 3 child patterns each has 6 LDCs passed and the 4th will have 2
	 *
	 * This calculation is done BEFORE creating any child pattern execution so we can save processing
	 * and memory if we already know we will have too many executions
	 *
	 * @param outputDataRowCount - Number of outputs saved by parent execution
	 * @param batchSize - Batch size configured on a trigger rule
	 * 
	 * @return 'true' if the number of child patterns about to be triggered exceeds the limit, 'false' otherwise
	 */
	function _exceedChildPatternLimit(outputDataRowCount, batchSize) {
		// Calculate how many child patterns are about to be triggered
		var targetExecutionCount = Math.ceil(outputDataRowCount / batchSize);
		// Get the configured limit for child patterns
		var maxTriggeredPatterns = GlideProperties.get('glide.discovery.pattern.orchestrator.max_patterns_triggered', -1);

		// In case we are about to cross the limit, log and return we exceed limit
		if ((maxTriggeredPatterns > -1) && (targetExecutionCount > maxTriggeredPatterns))
			return true;

		// No limit issues
		return false;
	}
})();
