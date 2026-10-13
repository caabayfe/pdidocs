var DiscoveryPatternOrchestratorEventHandler;

(function() {
	/**********************************************
					  Constants
	***********************************************/
	var FILE_NAME = 'DiscoveryPatternOrchestratorEventHandler',
		FILE_NAME_LOG_PREFIX = '[' + FILE_NAME + ']',
		LOG_PREFIX = DiscoveryPatternOrchestratorUtil.LOG_PREFIX + FILE_NAME_LOG_PREFIX;

	/**********************************************
				    Local Variables
	***********************************************/


	var nodeLogger = DiscoveryPatternOrchestratorUtil.getNodeLogger();
	var patternResultStatus = {
			succeed: 'SUCCEED',
			failed: 'FAILED',
			gracefulTermination: 'GRACEFUL_TERMINATION'
		},
		partialItemStatus = {
			pending: 'Pending',
			resolved: 'Resolved',
			failed: 'Failed'
		};

	/**********************************************
					  Public API
	***********************************************/

	DiscoveryPatternOrchestratorEventHandler = {
		patternResultStatus: patternResultStatus,
		onPatternExecutionCompleted: _onPatternExecutionCompleted,
		onPageProcessed: _onPageProcessed,
		onRecievedPartialPayloads: _onRecievedPartialPayloads
	};

	/*
	 * This function is called when the pattern was done!
	 * That includes all Orchestrator pages and multipages as well
	 *
	 * @param statusId - Status sys_id created for the triggered discovery
	 * @param outputEccId - The output ECC queue sys_id representing the pattern's execution
	 */
	function _onPatternExecutionCompleted(statusId, outputEccId) {
		var executionInfo = {
			status: statusId,
			executionId: outputEccId
		};
		// Grab the execution record representing this pattern's execution from 'sn_discovery_orchestrator_pattern_execution'
		var patternExecutionGlideRecord = DiscoveryPatternOrchestratorUtil.getExecutionRecordByStatusOrExecutionId(executionInfo.status, executionInfo.executionId);

		// If no executions found - quit processing
		if (!patternExecutionGlideRecord.next()) {
			nodeLogger.debug(LOG_PREFIX + ' No execution record found for: ' + JSON.stringify(executionInfo) + '. Abort processing');
			return;
		}

		// Based on the execution record, enhance executionInfo with all details about this execution
		DiscoveryPatternOrchestratorUtil.enhanceExecutionInfoFromGlideRecord(patternExecutionGlideRecord, executionInfo);
		var executionSysIdLogFormat = '[' + executionInfo.sysId + ']';
		nodeLogger.info(LOG_PREFIX + executionSysIdLogFormat + ' Pattern execution completed...\nGrabbing execution record from CMDB...');
		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Pattern execution details:\n'
						+ 'Execution Info: ' + JSON.stringify(executionInfo));

		// Get execution state & pagination information
		var finalExecutionState = patternExecutionGlideRecord.state + '';
		var paginationInformationGlideRecord = DiscoveryPageManager.getPageCountRecordByOutputEccQueue(patternExecutionGlideRecord.launcher + '');

		// The sensor is calling this function when ALL pages were received
		// We need to mark the execution as 'false'
		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Marking execution record as inactive');
		patternExecutionGlideRecord.active = false;

		/*
		 * In case we have pagination information for this execution, make sure the
		 * execution is pointing to it
		 * Pagination information will only exist for executions with more than 1 ORCHESTRATOR page
		 */
		if (paginationInformationGlideRecord != null)
			patternExecutionGlideRecord.pagination_information = paginationInformationGlideRecord.sys_id + '';

		/*
		 * In case we had issues updating - quit processing
		 * We are updating 'active' state of the execution in this function and if this not updated,
		 * the Orchestrator won't be able to detect whether the flow was done
		 */
		if (!patternExecutionGlideRecord.update()) {
			nodeLogger.error(LOG_PREFIX + executionSysIdLogFormat + ' Error updating execution record with state: ' + finalExecutionState + ' and pagination information');
			return;
		}

		executionInfo.finalState = finalExecutionState;
		nodeLogger.info(LOG_PREFIX + executionSysIdLogFormat + ' Finished running pattern "' + executionInfo.patternName + '"');

		/* 
		 * Find and prepare dependent patterns for execution
		 * We are running this logic regardless of current execution's state, because child
		 * patterns that are configured with 'Use Parent Context' don't need their direct parent's results,
		 * hence they should be able to run
		 */
		if (executionInfo.globalData.runDependentPatterns)
			DiscoveryPatternOrchestratorFlowManager.prepareAndTriggerDependentPatterns(executionInfo);
	}

	/*
	 * This function is called when an Orchestrator's page was received
	 * An Orchestrator page is an execution of a single pattern on MID side out of unknown
	 * number of execution of the SAME pattern
	 * This is NOT the same as an ENTIRE pattern execution!
	 * A full pattern execution can have 1 or more executions of the same pattern till all data fetched!
	 * 
	 *
	 * @param executionInfo - A JS object contains basic information on the execution
	 * This object has the following data:
	 * { 
	 *		executionId: Output ECC queue sys_id,
	 *		status: Status sys_id,
	 *		pattern: Pattern sys_id,
	 *		schedule: Schedule sys_id,
	 *		outputEccGlideRecord: Output ECC queue glide record - MAY NEED TO REMOVE
	 * }
	 * @param page - A JS object contains information on the page received
	 * This object has the following data:
	 * {
	 *		status: Result status based on 'DiscoveryPatternOrchestratorEventHandler.patternResultStatus' enum,
	 *		payload: The payload received from the pattern [The 'items' array specifically],
	 *		number: Page number [E.g. 1.3],
	 *		isLastPage: Indication if this is the last Orchestrator page,
	 *		errorMessage: An error message in case of an error [E.g. while IRE processing]
	 * }
	 */
	function _onPageProcessed(executionInfo, page) {
		nodeLogger.info(LOG_PREFIX + ' Page received. Finding execution information...');

		// Grab the execution record representing this pattern's execution from 'sn_discovery_orchestrator_pattern_execution'
		var patternExecutionGlideRecord = DiscoveryPatternOrchestratorUtil.getExecutionRecordByStatusOrExecutionId(executionInfo.status, executionInfo.executionId);

		// If no executions found - quit processing page
		if (!patternExecutionGlideRecord.next()) {
			nodeLogger.debug(LOG_PREFIX + ' No execution record found for: ' + JSON.stringify(executionInfo) + '. Abort processing page');
			return;
		}

		var executionSysIdLogFormat = '[' + patternExecutionGlideRecord.sys_id + ']';
		var executionState = patternExecutionGlideRecord.state + '';

		// In case the current pattern execution failed - quit processing page
		if (executionState == DiscoveryPatternOrchestratorFlowManager.executionState.failed) {
			nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Execution was marked as failed. Abort processing page');
			return;
		}
		// Based on the execution record, enhance executionInfo with all details about this execution
		DiscoveryPatternOrchestratorUtil.enhanceExecutionInfoFromGlideRecord(patternExecutionGlideRecord, executionInfo);
		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Page details: ' + JSON.stringify(page));

		// In case nothing failed but we have an empty payload - quit processing page 
		var isEmptyPayload = JSUtil.isEmpty(page.payload) || JSUtil.nil(page.payload);

		if (isEmptyPayload) {
			nodeLogger.warn(LOG_PREFIX + executionSysIdLogFormat + ' Recieved a page with an empty payload. Abort page processing');
			return;
		}

		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Grabbing output configuration for pattern "' + executionInfo.patternName + '"');
		// Based on 'sn_pattern_outputs' table, grab all attributes to extract from the payload
		var outputAttributeMap = DiscoveryPatternOrchestratorUtil.generateClassToAttributesMapFromOutputConfig(executionInfo.patternId);

		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' Attributes to extract: ' + JSON.stringify(outputAttributeMap) + ' from payload:\n' + JSON.stringify(page.payload));
		nodeLogger.debug(LOG_PREFIX + executionSysIdLogFormat + ' About to extract information from payload...\nPattern: ' + executionInfo.patternName);

		// Extract requested attributes from the payload into a different cleaner payload
		var payloadExtracted = PatternPayloadUtil.extractAttributesFromPayload(page.payload, outputAttributeMap);

		// If no data extracted - quit processing page
		if (!payloadExtracted) {
			var message = 'No attributes were extracted from payload. Please verify the attributes configured for pattern\'s output are in the payload. Abort page processing';
			nodeLogger.error(LOG_PREFIX + executionSysIdLogFormat + ' ' + message);
			DiscoveryLogger.error(message, FILE_NAME);
			return;
		}

		/* 
		 * Save the extracted data to the output table
		 * Pay attention that each object is saved in a separate record!
		 * This is done in order to prevent duplicates to be saved aside
		 * Multiple Orchestrator pages can have the same item multiple times - This can cause the Orchestrator
		 * to run a child pattern on the same object multiple times!
		 */
		var filteredPayload = DiscoveryPatternOrchestratorUtil.filterPayload(executionInfo, payloadExtracted);

		if (JSUtil.nil(filteredPayload) || JSUtil.isEmpty(filteredPayload))
			return;
		DiscoveryPatternOrchestratorUtil.saveExtractedPayload(executionInfo, filteredPayload, page.number);
	}

	/*
	 * This function is called when the horizontal sensor inserted partial data
	 *
	 * @param partialPayloadIdList - List of sys_ids representind records inserted to CMDB's partial payload table
	 * @param patternId - Pattern sys_id
	 * @param eccInputId - The input ECC queue sys_id of this payload
	 * @param statusId - Status sys_id created for the triggered discovery
	 */
	function _onRecievedPartialPayloads(partialPayloadIdList, patternId, eccInputId, statusId) {
		if (statusId == null) {
			nodeLogger.error(LOG_PREFIX + ' Failed to find status during partial payload tracking associated with the eccId: ' + eccInputId);
			return;
		}

		if (partialPayloadIdList == null) {
			nodeLogger.error(LOG_PREFIX + ' Expected partial payload IDs associated with the eccId: ' + eccInputId);
			return;
		}

		/*
		 * Whenever CMDB gets partial data, it inserts it to partial payload table and provides us with sys_id
		 * In case another payload came and matched it, the relevant records get depracated and new partial
		 * records created with the data that still doesn't have any match
		 *
		 * We are tracking these changes in order to provide informative logs to the user!
		 * At the end of the discovery the user will get a feedback based on the table below, saying if
		 * there is partial data left in CMDB's table
		 */
		partialPayloadIdList.forEach(function(payloadId) {
			var partialPayloadTrackRecord = new GlideRecord('sn_discovery_pattern_orchestrator_partial_inserts');
			partialPayloadTrackRecord.initialize();
			partialPayloadTrackRecord.setValue('partial_payload_id', payloadId);
			partialPayloadTrackRecord.setValue('pattern_id', patternId);
			partialPayloadTrackRecord.setValue('ecc_input_id', eccInputId);
			partialPayloadTrackRecord.setValue('status_id', statusId);
			partialPayloadTrackRecord.setValue('state', partialItemStatus.pending);
			partialPayloadTrackRecord.insert();
		});
	}

	/**********************************************
				Private Helper Functions
	***********************************************/

})();
