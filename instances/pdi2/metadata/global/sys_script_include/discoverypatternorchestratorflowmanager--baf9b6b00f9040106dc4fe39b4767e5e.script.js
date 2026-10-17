var DiscoveryPatternOrchestratorFlowManager;

(function() {
	/**********************************************
					  Constants
	***********************************************/

	var PATTERN_EXECUTION_TABLE_NAME = 'sn_discovery_orchestrator_pattern_execution',
		FILE_NAME = 'DiscoveryPatternOrchestratorFlowManager',
		FILE_NAME_LOG_PREFIX = '[' + FILE_NAME + ']',
		LOG_PREFIX = DiscoveryPatternOrchestratorUtil.LOG_PREFIX + FILE_NAME_LOG_PREFIX;

	/**********************************************
				    Local Variables
	***********************************************/

	var executionLogPrefix = '',
		executionState = {
			pending: 'Pending',
			running: 'Running',
			completed: 'Completed',
			failed: 'Failed',
			canceled: 'Canceled'
		},
		cloudResourceDiscoveryUtil = new CloudResourceDiscoveryUtil(),
		nodeLogger = DiscoveryPatternOrchestratorUtil.getNodeLogger();

	/**********************************************
					  Public API
	***********************************************/

	DiscoveryPatternOrchestratorFlowManager = {
		isManagingStatus: _isManagingStatus,
		didDiscoveryStatusComplete: _didDiscoveryStatusComplete,
		createPendingPatternExecution: _createPendingPatternExecution,
		triggerPatterns: _triggerPatterns,
		prepareAndTriggerDependentPatterns: _prepareAndTriggerDependentPatterns,
		executionState: executionState
	};

	/*
	 * Checks if a status is managed by Orchestrator
	 * Called by the horizontal sensor to execute logic only relevant for Orchestrator
	 *
	 * @param statusId - Status sys_id created for the triggered discovery
	 *
	 * @return 'true' if the status is managed by the Orchestrator, 'false' otherwise
	 */
	function _isManagingStatus(statusId) {
		
		/*
		 * Orchestrator is tracking all of it's executions, while a single status can have
		 * Orchestrator & non-Orchestrator [CAPI] discoveries running at the same time
		 * When ALL executions tracked by Orchestrator are in a final state with no 'Pending' executions, this is when
		 * a status is considered as no longer managed by Orchestrator
		 */
		var isManagingStatus = !_didDiscoveryStatusComplete(statusId);

		if (isManagingStatus)
			nodeLogger.debug(LOG_PREFIX + ' Orchestrator is still managing status: ' + statusId);
		else
			nodeLogger.debug(LOG_PREFIX + ' Orchestrator is no longer managing status: ' + statusId);

		return isManagingStatus;
	}

	/*
	 * Checks if the Orchestrator part of a status was done
	 *
	 * @param statusId - Status sys_id created for the triggered discovery
	 *
	 * @return 'true' if there are any active executions left to handle, 'false' otherwise
	 */
	function _didDiscoveryStatusComplete(statusId) {
		var patternExecutionGlideRecord = new GlideRecord(PATTERN_EXECUTION_TABLE_NAME);
		patternExecutionGlideRecord.addQuery('discovery_status', statusId);
		patternExecutionGlideRecord.addQuery('active', 'true');
		patternExecutionGlideRecord.setLimit(1);
		patternExecutionGlideRecord.query();

		return !patternExecutionGlideRecord.hasNext();
	}

	/*
	 * Creates a pending execution for a pattern
	 *
	 * @param patternExecution - JS object containing all information for a pattern to be executed
	 * Since this object contains the full context\data available for this pattern from ALL ancestors,
	 * this function also replaces the context with the used_context [after filtering it using ciToAttributedToBeUsedMap]
	 * in order to save memory
	 *
	 * @return The sys_id of the created record
	 */
	function _createPendingPatternExecution(patternExecution) {
		patternExecution.sysId = DiscoveryPatternOrchestratorUtil.createPatternExecutionWithState(patternExecution, executionState.pending);

		return patternExecution.sysId;
	}
	
	/*
	 * Triggers a set of patterns
	 *
	 * @param patternExecutionsInfo - An array of pattern execution objects
	 * See '_createPendingPatternExecution' for more information on what an execution object may contain
	 */
	function _triggerPatterns(patternExecutionsInfo) {
		patternExecutionsInfo.forEach(function(patternExecutionInfo) {
			_triggerPattern(patternExecutionInfo);
		});
	}

	/*
	 * Based on an execution info, prepare all child executions and trigger them
	 *
	 * This function uses Orchestrator configurations [trigger rules, inputs] & saved data from execution
	 * in order to create next-level executions and trigger them
	 *
	 * This function also creates and triggers child patterns 1 at the time!
	 * Since a parent may have a lot of children, calculating all children executions may take a lot of memory
	 * because each execution contains it's context [first all context available and then the filtered one]
	 *
	 * @param executionInfo - Execution info representing a pattern just finished and will be the parent
	 * execution for the ones to come
	 * See script's description for more information on what an execution object may contain
	 */
	function _prepareAndTriggerDependentPatterns(executionInfo) {
		var executionSysIdLogFormat = '[' + executionInfo.sysId + ']',
			executionLogPrefix = executionSysIdLogFormat,
			childPatternExecutions = [],
			triggerRuleGlideRecord = new GlideRecord('sn_pattern_trigger_rule');

		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Querying for trigger rules branching of "' + executionInfo.patternName + '"');

		// Get all rules where the parent is the current pattern
		triggerRuleGlideRecord.addQuery('parent_pattern_id', executionInfo.patternId);
		
		// In case of an unsuccessful execution, pick only child patterns with 'Use Parent Context' configuration
		if (executionInfo.finalState != executionState.completed) {
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' "' + executionInfo.patternName + '" wasn\'t successful. Looking only for child patterns that are using "' + executionInfo.patternName + '" original context');
			triggerRuleGlideRecord.addQuery('batch_size', 0);
		}
		triggerRuleGlideRecord.query();

		// Log if we couldn't find any child patterns for the current pattern
		if (!triggerRuleGlideRecord.hasNext())
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' No patterns found branching of "' + executionInfo.patternName + '"');

		// For each trigger rule found, prepare and execute the child pattern
		while (triggerRuleGlideRecord.next()) {
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Found trigger rule executing "' + triggerRuleGlideRecord.pattern_id.name + '"');

			// Skip any child pattern where the pattern is inactive
			if (!triggerRuleGlideRecord.pattern_id.active) {
				nodeLogger.warn(LOG_PREFIX + executionSysIdLogFormat + ' "' + triggerRuleGlideRecord.pattern_id.name + '" is disabled and won\'t be triggered');
				continue;
			}

			var childPatternName = triggerRuleGlideRecord.pattern_id.name + '';

			/* 
			 * Get all the output records for the finished execution
			 * NOT configuration but actual data saved aside based on the output configuration
			 */
			var patternOutputsGlideRecord = _getPatternOutputForExecution(executionInfo);
			var outputDataRowCount = patternOutputsGlideRecord.getRowCount();
			
			/*
			 * Based on child pattern's input configuration, build a map containing the attributes
			 * required by the pattern for each CI type requested
			 *
			 * The outcome will be:
			 * {
			 *    ci_type_1: 'att1, att2',
			 *    ci_type_2: 'att1, att2',
			 *    ...
			 * }
			 */
			var ciToAttributedToBeUsedMap = DiscoveryPatternOrchestratorUtil.createClassAttributeMap(executionInfo, triggerRuleGlideRecord.pattern_id + '', triggerRuleGlideRecord.pattern_id.cpattern_type + '');

			/* 
			 * Didn't see any option that doesn't return NaN for an invalid value,
			 * hence || is used as a fallback to a more clear "parseInt()" call instead of "+(value)"
			 */
			var batchSize = parseInt(triggerRuleGlideRecord.batch_size + '') || 0;

			// In case we are not using parent context, output must be found for parent's results
			if ((batchSize != 0) && !_isOutputDataFound(outputDataRowCount)) {
				nodeLogger.warn(LOG_PREFIX + executionSysIdLogFormat + ' No output data found for execution ' + executionInfo.sysId + 'using pattern "' + executionInfo.patternName + '" and main CI "' + executionInfo.mainCiType + '".\nMake sure that "' + executionInfo.patternName + '" output configuration is configured properly and that "' + executionInfo.mainCiType + '" is part of the expected inputs of "' + childPatternName + '": ' + JSON.stringify(Object.keys(ciToAttributedToBeUsedMap)) + '. Abort context(s) building');
				continue;
			}

			var shouldBatchAll = _shouldBatchAll(batchSize);

			if (shouldBatchAll) {
				nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Trigger rule configured to batch all.\nReturning all "' + executionInfo.patternName + '"\'s output in a single context');
			} else {
				nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Trigger rule configured with batch size ' + batchSize + ' having a total of ' + outputDataRowCount + ' objects saved');

				// If trying to run multiple child patterns, make sure we are not exceeding the limit
				if (DiscoveryPatternOrchestratorUtil.exceedChildPatternLimit(outputDataRowCount, batchSize)) {

					// Log that the maximum amount of child patterns have been attempted to be triggered for this flow
					var message = 'Prevented running "' + childPatternName + '" more times than configured in glide.discovery.pattern.orchestrator.max_patterns_triggered system property.\n \
					If this is an unexpected behavior, please increase the property\'s value to trigger to allow more child patterns to run';
					nodeLogger.warn(LOG_PREFIX + executionSysIdLogFormat + ' ' + message);
					DiscoveryLogger.warn(message);

					var dac =  new global.SncDiscoveryCancel();
					dac.cancelAll(executionInfo.status);

					return;
				}
			}

			// A template containing common information for all child patterns to be executed
			var childPatternExecutionInfoTemplate = {
				status: executionInfo.status,
				schedule: executionInfo.schedule,
				scheduleLauncherId: executionInfo.scheduleLauncherId,
				discoveryType: executionInfo.discoveryType,
				patternId: triggerRuleGlideRecord.pattern_id + '',
				patternName: childPatternName,
				mainCiType: triggerRuleGlideRecord.pattern_id.ci_type + '',
				parentExecution: executionInfo.sysId || '',
				parentMainCiType: (triggerRuleGlideRecord.parent_pattern_id.ci_type + '') || '',
				runDependentPatterns: executionInfo.runDependentPatterns,
				ciToAttributedToBeUsedMap: ciToAttributedToBeUsedMap,
				rootExecution: executionInfo.rootExecution || executionInfo.sysId,
				/*
				 * We are going to have a deep copy of this object per child pattern,
				 * therefore we don't want to have the actual global variables in here
				 */
				globalData: {
					sysId: executionInfo.globalData.sysId
				}
			};

			nodeLogger.info(LOG_PREFIX + executionSysIdLogFormat + ' Building context(s) for child patterns');
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' About to build context(s) for "' + childPatternExecutionInfoTemplate.patternName + '"');

			nodeLogger.info(LOG_PREFIX + executionSysIdLogFormat + ' Getting context...');
			
			// Create a copy of the template and grab the FIRST context to be ran with it
			var childPatternExecutionInfo = _createJSONCopy(childPatternExecutionInfoTemplate);

			var context = _getNextContext(executionInfo, childPatternExecutionInfo, patternOutputsGlideRecord, triggerRuleGlideRecord);
			
			// If we can't even prepare the first context for the first child - return
			if (JSUtil.nil(context) || JSUtil.isEmpty(context)) {
				nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' No context(s) crafted for "' + childPatternExecutionInfo.patternName + '"');
				continue;
			}

			/*
			 * Based on the amount of data and batch size, we are crafting a context at a time
			 * As long as we managed to generate a context, create a pending record for tracking
			 * and trigger the child pattern with that context
			 */
			while (JSUtil.notNil(context) && !JSUtil.isEmpty(context)) {
				context.content.globalVariables = DiscoveryPatternOrchestratorUtil.getGlobalVariablesAsJson(childPatternExecutionInfo.rootExecution);
				childPatternExecutionInfo.context = context;
				
				/*
				 * Generate an execution name based on data and trigger rules
				 * See _generateExecutionName() for more info
				 */
				childPatternExecutionInfo.name = _generateExecutionName(executionInfo, childPatternExecutionInfo);

				nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Child execution name: ' + childPatternExecutionInfo.name);
				
				// Create a pending record for this execution for flow tracking purposes
				var executionSysId = _createPendingPatternExecution(childPatternExecutionInfo);
				
				// If execution record was created successfuly, trigger the pattern
				if (executionSysId) {					
					nodeLogger.debug(LOG_PREFIX + '[' + executionInfo.sysId + ']' + ' About to trigger "' + childPatternExecutionInfo.patternName + '"');
					_triggerPattern(childPatternExecutionInfo);
				}
				
				/*
				 * This is a case where the trigger rule was set to 'Use Parent Context'
				 * In this scenario we only have 1 context which is our parent's original context
				 * and there is no need to try and build the next context, so we stop here
				 */
				if (batchSize == 0) {
					nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' We used the parent context. No batching took place...');
					break;
				}
				nodeLogger.info(LOG_PREFIX + executionSysIdLogFormat + ' Getting next context...');
				
				// Build the next context using whatever data left from output
				childPatternExecutionInfo = _createJSONCopy(childPatternExecutionInfoTemplate);
				context = _getNextContext(executionInfo, childPatternExecutionInfo, patternOutputsGlideRecord, triggerRuleGlideRecord);
			}
			
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Finished triggering all executions of "' + childPatternExecutionInfo.patternName + '"');
		}
	}

	/**********************************************
				Private Helper Functions
	***********************************************/

	/*
	 * Checks if 'sn_discovery_orchestrator_pattern_output' table has data found based on a query
	 *
	 * @param outputDataRowCount - Number of rows returned by a query
	 * 
	 * @return 'true' if the query returned results, 'false' otherwise
	 */
	function _isOutputDataFound(outputDataRowCount) {
		return (outputDataRowCount > 0);
	}

	/*
	 * Gets the cloud provider we are discovering
	 * Not all arguments needed, but we are using fallbacks in case no data found
	 *
	 * @param context - The context used for the pattern to be triggered
	 * @param regionName - Name of LDC
	 * @param datacenterType - LDC class type [extending cmdb_ci_logical_datacenter]
	 * 
	 * @return The cloud provider we are discovering [E.g. AWS, GCP...]
	 */
	function _getCloudProvider(context, regionName, datacenterType) {
		// This logic was taken from cloud scripts
		if (context) {
			if (!context[datacenterType]) {
				return cloudResourceDiscoveryUtil.getProviderByDatacenterType(datacenterType);
			} else {
				if (!regionName)
					return cloudResourceDiscoveryUtil.getProviderByDatacenterType(datacenterType);
			}
		} else {
			return cloudResourceDiscoveryUtil.getProviderByDatacenterType(datacenterType);
		}
	}

	/*
	 * Find a MID server to run a specific pattern
	 * Taken from cloud script with some modification for Orchestrator's use
	 *
	 * IMPORTANT: This should return mid_details probe parameter to be injected to the probe, 
	 * instead of selecting a specific MID per execution
	 *
	 * @param executionInfo - Execution info representing a pattern which is about to be executed
	 * See script's description for more information on what an execution object may contain
	 *
	 * @return MID server to run the discovery
	 */
	function _findMid(executionInfo) {
		var executionSysIdLogFormat = '[' + executionInfo.sysId + ']';

		// For cloud schedule
		if (executionInfo.discoveryType == DiscoveryPatternOrchestratorFlowLauncher.discoveryType.cloudResources) {
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Finding MID for execution...');
			var serviceAccount = {},
				regionName = null,
				contextPayload = {};

			// If we have context - Use it to fetch the account and region
			if (executionInfo.context && executionInfo.context.content.tables) {
				contextPayload = executionInfo.context.content.tables;
				nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Context found: ' + JSON.stringify(contextPayload));
			}

			// Grab service account info into 'serviceAccount' object
			// If we have it in the context, use it
			if (!JSUtil.isEmpty(contextPayload)) {
				serviceAccount.accountId = contextPayload.cmdb_ci_cloud_service_account[0].values.account_id;
				serviceAccount.datacenterType = contextPayload.cmdb_ci_cloud_service_account[0].values.datacenter_type;
				nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Found service account in context');
			} else {
				if (executionInfo.serviceAccount)
					nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Found service account found in execution object');
				else
					nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Trying to find service account by schedule...');

				/*
				 * If the account wasn't found in the context, check the executionInfo itself
				 * This covers the first pattern scenario where there is no context to begin with,
				 * but service account info is needed. In this case the service account was taken from CMDB
				 * If for some reason nothing was found, use the schedule to grab the service account by querying
				 * 'cmp_discovery_ldc_config'
				 */
				serviceAccount = executionInfo.serviceAccount || cloudResourceDiscoveryUtil.fetchConfiguredServiceAccountDetailsBySchedule(executionInfo.schedule);
			}

			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Service account found: ' + JSON.stringify(serviceAccount));

			// Grab LDC type from the account
			var datacenterType = serviceAccount.datacenterType;

			// Handle region name
			// If we have context with LDC info in it, grab the LDC name
			if (contextPayload && contextPayload[datacenterType])
				regionName = (contextPayload[datacenterType].length > 1) ? null : contextPayload[datacenterType][0].name;
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Region found: ' + (regionName || 'None'));

			// Grab the cloud provider based on the extracted info. See '_getCloudProvider()' for more details
			var provider = _getCloudProvider(contextPayload, regionName, datacenterType);
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Provider found: ' + (provider || 'None'));

			// Initialize context needed for cloud MID selection and select a MID
			var invocationContext = {
					service_account_id: serviceAccount.accountId
				},
				cloudMidSelector = new global.CloudMidSelectionApi(),
				midId = cloudMidSelector.selectMid(null, provider, regionName, JSON.stringify(invocationContext));

			// If no MID found, return null
			if (!midId) {
				var message = LOG_PREFIX + executionSysIdLogFormat + ' No MID found for execution';
				nodeLogger.error(message);
				DiscoveryLogger.error(message, FILE_NAME);

				return null;
			}
			// If a sys_id was returned but no MID record found, return null
			var midGlideRecord = new GlideRecord('ecc_agent');

			if (!midGlideRecord.get(midId)) {
				var message = LOG_PREFIX + executionSysIdLogFormat + ' No MID found with sys_id: ' + midId;
				nodeLogger.error(message);
				DiscoveryLogger.error(message, FILE_NAME);

				return null;
			}

			// Otherwise return MID's name
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Found MID: ' + midGlideRecord.name);
			
			// If User has selected specific_Mid or specific_cluster, We need to use the mid form same cluster. 
			var midName = cloudResourceDiscoveryUtil.getSelectedMidFromSchedule(executionInfo.schedule);
			return (midName) ? midName : midGlideRecord.name + '';
			
		} else if (executionInfo.discoveryType == DiscoveryPatternOrchestratorFlowLauncher.discoveryType.serverless) {
			// In case of 'Serverless', get the MID from the schedule since it is working with 'Specific MID'
			return sn_discovery.DiscoveryAPI.getMidServerFromSchedule(executionInfo.schedule);
		}

		// Default value
		return null;
	}

	/*
	 * Triggers a single pattern
	 *
	 * @param executionInfo - Execution info representing a pattern which is about to be executed
	 * See script's description for more information on what an execution object may contain
	 */
	function _triggerPattern(patternExecutionInfo) {
		var executionSysIdLogFormat = '[' + patternExecutionInfo.sysId + ']';
		// Find a MID server to run this pattern with
		var mid = _findMid(patternExecutionInfo);

		// If no MID found, return
		if (!mid) {
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + 'No MID found. Marking execution as failed');
			DiscoveryPatternOrchestratorUtil.setExecutionState(patternExecutionInfo.sysId, executionState.failed);
			return;
		}

		/*
		 * Add launching information to the executionInfo object
		 * This includes probe values, probe params & pre-execution object
		 * These are required for 'PatternLauncherManager'
		 */
		_addPatternLaunchDetailsToExecution(patternExecutionInfo);
		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Added launching information to execution');
		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Launching execution');

		// Launch the pattern based on the information in the execution info object
		var patternLauncher = new SNC.PatternLauncherManager();
		var executionId = patternLauncher.launchPattern(patternExecutionInfo.status, patternExecutionInfo.schedule, mid, 'No Source', patternExecutionInfo.patternId, patternExecutionInfo.patternLaunchInfo.probeParams, patternExecutionInfo.patternLaunchInfo.probeValues, patternExecutionInfo.patternLaunchInfo.preExecutionData);

		/*
		 * In case we didn't get a sys_id back for the output ECC queue record, mark the
		 * execution as 'Failed' and return
		 */
		if (!executionId) {
			var message = 'Error while execution pattern "' + patternExecutionInfo.patternName + '"';
			nodeLogger.error(LOG_PREFIX + executionSysIdLogFormat + ' ' + message);
			DiscoveryLogger.error(message, FILE_NAME);
			DiscoveryPatternOrchestratorUtil.setExecutionState(patternExecutionInfo.sysId, executionState.failed);
			return;
		}
		// Otherwise, we have ECC queue - mark the execution as 'Running'
		DiscoveryPatternOrchestratorUtil.markExecutionAsRunning(patternExecutionInfo.sysId, executionId);
	}

	/*
	 * Checks whether the trigger rule was configured to use the batch all
	 *
	 * @param batchSize - Batch size configured on a trigger rule
	 *
	 * @return 'true' if we are using batch all, 'false' otherwise
	 */
	function _shouldBatchAll(batchSize) {
		return (batchSize <= 0);
	}

	/*
	 * Gets the indices of the items that are going to be handled in a batch
	 *
	 * When we handle batching, we divide all outputs from the parent's results into groups
	 * Each group's size should be equal to batch size configured except the last batch which
	 * can be different depending on how many items left
	 *
	 * @param batchSize - Batch size configured on a trigger rule
	 * @param itemIndex - A number representing the index which we START from
	 * @param numItemsBatched - The number of items in the batch we are currently handling
	 *
	 * @return String represents the items indices that are being handled in a batch
	 */
	function _getItemsHandledInBatch(batchSize, itemIndex, numItemsBatched) {

		// In case of batch all, return -1 [represents all]
		if (batchSize < 0)
			return -1;

		switch (batchSize) {
			// In case of using the parent's context, return 0 [represetns using the parent's context]
			case 0:
				return 0;
			// In case of bacthing 1 at the time, return the current index
			// This is the STARTING index as already mentioned, 
			case 1:
				return itemIndex;
			// In case the configuration is to have more than 1 item in a batch, we have 2 options
			default:
				/*
				 * We managed to have more than 1 item in the context, hence we return a representation
				 * of multiple items by having 'startIndex - endIndex'
				 */
				if (numItemsBatched > 1) {
					var startItemIndex = itemIndex - numItemsBatched + 1;

					return startItemIndex + ' - ' + itemIndex;
				} else {
					// In case only 1 item left in the LAST batch, return the index
					return itemIndex;
				}
		}
	}

	/*
	 * Creates a new copy from a JS object
	 * Mainly used when having a template which is used as the basic object for different executions
	 *
	 * @param jsonObject - The JS object to create a copy from
	 *
	 * @return A copy of the JS object got as an input
	 */
	function _createJSONCopy(jsonObject) {
		return JSON.parse(JSON.stringify(jsonObject));
	}

	/*
	 * Gets output records for an execution in order to prepare and trigger child executions
	 * Pay attention that currently a pattern can only save its main CIs as output records
	 * That basically means we don't need all these arguments to fetch outputs of a pattern, but:
	 *      1. Before it was the main CI only, we had the option to save whatever class we want as 
	 *         long as it was part of the pattern's output
	 *      2. We kept it this way for future use, in case we would like to have [1] back
	 *
	 * @param parentExecutionId - sys_id of the parent execution
	 * @param patternProducedOutput - sys_id of the pattern produced the output records
	 * @param ciTypeInOutput - CI class type we want form the saved results
	 *
	 * @return A GlideRecord representing all output records saved, each record represents a SINGLE CI
	 */
	function _getPatternOutputForExecution(executionInfo) {
		var executionSysId = executionInfo.sysId;
		var executionDiscoveryStatus = executionInfo.status;
		var patternOutputsGlideRecord = new GlideRecord('sn_discovery_orchestrator_pattern_output');

		patternOutputsGlideRecord.addQuery('pattern', executionInfo.patternId);
		patternOutputsGlideRecord.addQuery('class', executionInfo.mainCiType);
		patternOutputsGlideRecord.addQuery('pattern_execution', executionSysId);

		/*
		 * Added as per DEF0398334, by making table sn_discovery_orchestrator_pattern_output
		 * use table rotations, we need to also update related queries to query based on a
		 * sys_created_on value to reduce the # of shards to query against.
		 *
		 * First we try to get based on the related sn_discovery_orchestrator_pattern_execution
		 * record if it still exists. If we can't get a value from there, then we will try from
		 * the related discovery_status record.
		 */

		var createdTime = _getCreatedTimeFromExecution(executionSysId) || _getCreatedTimeFromStatus(executionDiscoveryStatus);
		if (createdTime)
			patternOutputsGlideRecord.addQuery('sys_created_on', '>=', createdTime);

		patternOutputsGlideRecord.query();
		return patternOutputsGlideRecord;
	}

	/*
	 * Builds a complete context object containing the context with some metadata on it
	 *
	 * @param contextPayload - JS object containing the context data
	 * @param handledItemsIndices - String representing the item's indices contains by the context
	 *
	 * @return A complete context object containing data with metadata
	 */
	function _buildContextObjectFromContentAndMetadata(contextPayload, handledItemsIndices) {
		return {
			content: {
				tables: contextPayload
			},
			metadata: {
				itemsHandled: handledItemsIndices
			}
		};
	}

	/*
	 * Builds a context object containing the new objects to be batched form parent's results
	 *
	 * @param context - JS object containing the context's data
	 * @param parentBatchedObjects - The objects to be pushed to the new context
	 * @param parentMainCiType - Main CI type of parent's pattern
	 * @param batchSize - Batch size configured on a trigger rule
	 * @param itemIndex - A number representing the index which we START from
	 * @param numItemsBatched - The number of items in the batch we are currently handling
	 *
	 * @return A complete context object containing data with metadata
	 */
	function _prepareContextObject(context, parentBatchedObjects, parentMainCiType, batchSize, itemIndex, numItemsBatched) {
		// Calculate new items indices and create a DEEP copy of the parent's context
		var handledItemsIndices = _getItemsHandledInBatch(batchSize, itemIndex, numItemsBatched),
			contextCopy = _createJSONCopy(context);

		// Insert the objects from the parent's output into the new child context
		contextCopy[parentMainCiType] = parentBatchedObjects;

		return _buildContextObjectFromContentAndMetadata(contextCopy, handledItemsIndices);
	}

	/*
	 * Gets a context for the next batch to run
	 * This function returns 1 context each call! It doesn't build contexts for all batches
	 * at once in order to save memory [we can have a lot of child patterns to run based on batch
	 * configuration]
	 * This is done by sending a GlideRecord containing the outputs from the parent's execution, where
	 * the pointer in this GlideRecord is always pointing to the next object to start with!
	 * We only query the outputs table once in '_prepareAndTriggerDependentPatterns' and moving the pointer 
	 * using next() function eventually pointing at the first item of the NEXT batch at the end
	 * of this function
	 *
	 * @param parentExecutionInfo - Execution info object representing the parent pattern execution
	 * See script's description for more information on what an execution object may contain
	 * @param childPatternExecution - Execution info representing a pattern which is about to be executed
	 * See script's description for more information on what an execution object may contain
	 * @param batchSize - Batch size configured on a trigger rule
	 * @param patternOutputsGlideRecord - GlideRecord containing the parent's outputs
	 *
	 * @return The context for the next batch to run
	 */
	function _getNextContext(parentExecutionInfo, childPatternExecution, patternOutputsGlideRecord, triggerRuleGlideRecord) {
		// If no sys_id of execution exists, return
		if (!parentExecutionInfo.sysId) {
			nodeLogger.error(LOG_PREFIX + ' Parent execution info doesn\'t contain a sys_id, which prevents grabing the parent\'t outputs for building context(s). Abort context(s) building');
			return {};
		}
		var batchSize = parseInt(triggerRuleGlideRecord.batch_size + '') || 0;

		var parentContextSatisfiesFilter = false;
		var useFilterScript = (triggerRuleGlideRecord.use_filter_script) ? triggerRuleGlideRecord.use_filter_script + '' : 'false';
		if (useFilterScript == 'true') {
			parentContextSatisfiesFilter = _doesParentExecutionInfoSatisfiesFilter(parentExecutionInfo, triggerRuleGlideRecord);
		}

		var handledItemsIndices = '',
			// Initialize the context from the parent if we have one
			contextPayload = (parentExecutionInfo.context) ? JSON.parse(parentExecutionInfo.context) : {},
			executionSysIdLogFormat = '[' + parentExecutionInfo.sysId + ']';

		// Handle a case where we want to pass original context with no additional objects form parent
		if (batchSize == 0) {
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Trigger rule configured to use parent\'s context.\nReturning "' + parentExecutionInfo.patternName + '"\'s context.');

			if (JSUtil.isEmpty(contextPayload))
				return {};
			/*
			 * Get the indices of the current handling items
			 * In our case since this is using parent context, it will be 0
			 */
			handledItemsIndices = _getItemsHandledInBatch(batchSize);

			// Return the context for the next execution
			return _buildContextObjectFromContentAndMetadata(contextPayload, handledItemsIndices);
		}

		var parentMainCiType = parentExecutionInfo.mainCiType;
		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Grabbing output data saved for "' + parentExecutionInfo.patternName + '"');

		var shouldBatchAll = _shouldBatchAll(batchSize),
			parentBatchedObjects = [];
		/*
		 * In case the current location is -1, that means we are about to handle the 1st item
		 * In this case we must set itemIndex to 0, because itemIndex is NOT 0 based index,
		 * so when we increase it before handling the context, it will start from 1 [= item #1]
		 */
		var itemIndex = patternOutputsGlideRecord.getLocation() + 1;

		while (patternOutputsGlideRecord.next()) {
			// Add a parent output item to the array holding the objects for next batch and increase the item index
			var payload = JSON.parse(patternOutputsGlideRecord.payload + '');
			 if (useFilterScript == 'true' && parentContextSatisfiesFilter) {
			 	//If filter script is present and satisfies the context in parent execution info, push the payload
			 	parentBatchedObjects.push(payload);
			 } else if (useFilterScript == 'false') {
			 	//if use filter script is set to false, that means no filter, so push the payload
			 	parentBatchedObjects.push(payload);
			 }
			 itemIndex++;
			
			// In case we are not batching all and we reached our batch size, build a context and return it
			if (!shouldBatchAll && (parentBatchedObjects.length == batchSize)) {
				var context = _prepareContextObject(contextPayload, parentBatchedObjects, parentMainCiType, batchSize, itemIndex, batchSize);
				nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Context crafted: ' + JSON.stringify(context));

				// Return the context for the next execution
				return context;
			}
		}

		/*
		 * Build a context from the rest of the items left to batch
		 * This code will handle the batch all and leftovers where the #itemsLeft < batch size
		 */
		if (parentBatchedObjects.length > 0) {
			context = _prepareContextObject(contextPayload, parentBatchedObjects, parentMainCiType, batchSize, itemIndex, parentBatchedObjects.length);
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Context crafted: ' + JSON.stringify(context));

			// Return the context for the next execution
			return context;
		}

		return {};
	}

	/*
	 * Gets the object's name which was handled by the grantparent pattern
	 * We need this name in 'Use Parent Context' scenario where the grandchild is
	 * running using it's parent ORIGINAL context
	 * That means we've got NO items from out parent and we are working based off our grandparent's item(s)
	 *
	 * @param parentExecutionName - Name of parent execution
	 *
	 * @return String with object's name which was handled by the grantparent pattern 
	 */
	function _extractGrandparentContextItem(parentExecutionName) {
		/*
		 * Extract the grandparent object from the parent's name
		 * This is the string inside the brackets. E.g. cmdb_ci_vm_instance[ us-west-1 ]
		 */
		var itemNameMatches = /.*?\[\s*(.*)\s*\]/.exec(parentExecutionName);

		return (itemNameMatches[1] ? itemNameMatches[1].trim() : '');
	}

	/*
	 * Generates an execution name
	 * Execution name is generated based on the information we have on:
	 *      1. Metadata of the context [which tells us how many object we handle]
	 *      2. The child pattern class name that is about to be discovered
	 *      3. Parent's object name if we have one. Otherwise, parent's class name [grapnparent in case
	 *         of 'Use Parent Context']
	 *
	 * The name contains the child's CI class and then the node\item from the tree we branched off from
	 * E.g. cmdb_ci_cm_instance [ us-west-1 ]
	 *
	 * The value IN THE BRACKETS depends on how many objects we have in a batch and if 'name' is available:
	 *      - If we have count 1 but the parent CI has NO name, we'll see: cmdb_ci_whatever1,
	 *        cmdb_ci_whatever2, cmdb_ci_whatever3…
	 *      - If we have count = 3 for example, you'll see cmdb_ci_whatever 1 - 3, cmdb_ci_whatever 4 - 6 etc
	 *      - If we chose all as the batch, we'll see 'All cmdb_ci_whatever'
	 *
	 * @param parentExecutionInfo - Execution info object representing the parent pattern execution
	 * See script's description for more information on what an execution object may contain
	 * @param childPatternExecution - Execution info representing a pattern which is about to be executed
	 * See script's description for more information on what an execution object may contain
	 *
	 * @return String with object's name which was handled by the grantparent pattern 
	 */
	function _generateExecutionName(parentExecutionInfo, childExecutionInfo) {
		var itemsHandledInExecution = childExecutionInfo.context.metadata.itemsHandled,
			childCiType = childExecutionInfo.mainCiType,
			parentCiType = parentExecutionInfo.mainCiType;

		/*
		 * If we have a range, build the following format:
		 * child_class_type [ parent_class_type [firstItemIndex - lastItemIndex] ]
		 */
		if (itemsHandledInExecution.includes(' - '))
			return (childCiType + ' [ ' + parentCiType + ' [' + itemsHandledInExecution + '] ]');

		var executionName = '';

		switch (itemsHandledInExecution) {
			/*
			 * If we batch all, build the following format:
			 * All parent_class_type's
			 */
			case -1:
				executionName = 'All ' + parentCiType + 's ';
				break;
			/*
			 * If are using parent context, build the following format:
			 * child_class_type [ grandparentName ]
			 */
			case 0:
				var grandparentName = _extractGrandparentContextItem(parentExecutionInfo.name);
				executionName = grandparentName;
				break;
			/*
			 * If we are using some batch value > 0, we have 2 options:
			 *      1. In case the parent object has a name: child_class_type [ parentItemName ]
			 *      2. In case the parent object doesn't have a name:
			 *         child_class_type [ parent_class_type<ITEM_INDEX> ]
			 */
			default:
				var parentObjectInContext = childExecutionInfo.context.content.tables[parentCiType][0],
					itemName = parentObjectInContext.values.name;

				executionName = itemName ? itemName : (parentCiType + itemsHandledInExecution);
				break;

		}

		return childCiType + ' [ ' + executionName + ' ]';
	}

	/*
	 * Checks if an execution object contains launching information
	 * See '_addPatternLaunchDetailsToExecution' for more information on launching information
	 *
	 * @param patternExecution - Execution info object
	 * See script's description for more information on what an execution object may contain
	 *
	 * @return 'true' if contains launching details, 'false' otherwise
	 */
	function _containsLaunchDetails(patternExecution) {
		return patternExecution.hasOwnProperty('patternLaunchInfo');
	}

	/*
	 * Add launching information to execution if doesn't exist
	 * Launching information includes probe values, probe params & pre-execution object
	 * These are required for 'PatternLauncherManager' in order to trigger a pattern
	 *
	 * @param patternExecution - Execution info object to add launching information to
	 * See script's description for more information on what an execution object may contain
	 *
	 * @return 'true' if contains launching details, 'false' otherwise
	 */
	function _addPatternLaunchDetailsToExecution(patternExecution) {
		if (_containsLaunchDetails(patternExecution))
			return;

		// Create a pre-execution object from the context
		var preExecutionData = DiscoveryPatternOrchestratorUtil.buildPreExecutionDataFromContext(patternExecution.context, patternExecution.patternId);
		// Add the launching information to patternExecution object
		DiscoveryPatternOrchestratorUtil.addLaunchDetailsToExecution(patternExecution, {}, {}, preExecutionData);
		return patternExecution;
	}

	function _doesParentExecutionInfoSatisfiesFilter(executionInfo, triggerRuleGlideRecord) {
		var executionSysIdLogFormat = '[' + executionInfo.sysId + ']';
		try {
			var isSingleAccountDiscovery = cloudResourceDiscoveryUtil.isSingleAccountDiscoveredFromSchedule(executionInfo.schedule);
		} catch(err) {
			var msg = err.message;
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Error occurred while checking if this is a single account discovery, filters will be disregarded, Error:'+msg);
			return true;
		}

		if (isSingleAccountDiscovery) {
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' This is a single account discovery, filters will not be evaluated. Execution will not be filtered.');
			return true;
		}

		// If we have it in the context, use it
		if (JSUtil.notNil(executionInfo.context)) {
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Context found while verifying filter: ' +executionInfo.context);
			var params = {
				'context': executionInfo.context
			};

			var filterFunction = eval('(' + triggerRuleGlideRecord.getValue('script') + ')');
			var result = !!filterFunction(params);

			if (result === true) {
				nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Parent Execution Info satisfies the Filter');
			} else {
				nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Parent Execution Info do not satisfy the Filter');
			}
			return result;
		}
		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Filter Not Satisfied as Parent Execution Info is empty. Execution will not be filtered.');
		return true;
	}

	function _getCreatedTimeFromExecution(executionSysId) {
		if (!executionSysId)
			return;

		var executionGr = new GlideRecord(PATTERN_EXECUTION_TABLE_NAME);
		if (executionGr.get('sys_id', executionSysId))
			return executionGr.sys_created_on;
	}

	function _getCreatedTimeFromStatus(statusSysId) {
		if (!statusSysId)
			return;

		var statusGr = new GlideRecord('discovery_status');
		if (statusGr.get('sys_id', statusSysId))
			return statusGr.sys_created_on;
	}

})();
