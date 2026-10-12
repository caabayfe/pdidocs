var AutoResolutionSimulationRunBlock = Class.create();
AutoResolutionSimulationRunBlock.prototype = {
	
	initialize: function(sysID) {
		this.LANGUAGE_CODE = 'en';
		
		this._continueOnBatchError = true;
		this._state = AutoResolutionSimulationHelper.STATE_COMPLETE;
		this._gr = new GlideRecord(AutoResolutionConstants.SIMULATION_RUN_BLOCK_TABLE_NAME);
		this._gr.get(sysID);
		
		var autoResolutionConfigGr = this._gr.simulation_run.config.auto_res_config.getRefRecord();
		this._autoResConfigSysID = autoResolutionConfigGr.getValue('sys_id');
		this._targetTable = autoResolutionConfigGr.getValue(AutoResolutionConstants.CONFIGURATION_TABLENAME_FIELD_NAME);
		this._composite = new AutoResolutionComposite(autoResolutionConfigGr.getValue('sys_id'));
		this._totalRecordsInBlock = this._getTotalRecordsInBlock();
		this._languageCode = this._gr.getValue('language_code');
		this._taskSysIDList = this._getTaskSysIDsInCurrentBlock();
		this._predictionFields = autoResolutionConfigGr.prediction_fields.toString().split(',');

		this.LOGGER = new AutoResolutionLoggingUtils()
			.withName(this.type)
			.withSimulation(this._gr.getValue('simulation_run'))
			.withSimulationConfiguration(this._autoResConfigSysID)
			.createLogger();
	},
	
	setBatchSize: function(batchSize) {
		this._batchSize = batchSize;
	},
	
	continueOnBatchError: function(flag) {
		this._continueOnBatchError = flag;
	},

	process: function() {
		var errorMessage;
		var startTime;
		var endTime;
		var i;
		try {
			this._validateParameters();
			
			this._info('Processing started for block');
			startTime = new Date().getTime();
			var endIndex;
			for (i = 0; i < this._taskSysIDList.length; i += this._batchSize) {
				endIndex = i + this._batchSize;
				if (endIndex > this._taskSysIDList.length)
					endIndex = this._taskSysIDList.length;

				this._processBatch(i, endIndex);
				this._info('Finished processing ' + (i + 1) + ' records');
			}

			// If all the contexts belonging to this block are API errors, it means that whole block has error
			this._evaluateAndSetStateIfAllAPIErrors();

			this._gr.setValue('state', this._state);
			this._gr.update();
			endTime = new Date().getTime();
			this._printSummary(startTime, endTime, this._totalRecordsInBlock);
			this._info('Processing ended successfully for block');
		} catch(error) {
			this._updateErrorMessageOnBlockRecord(error);
			this._gr.setValue('state',  AutoResolutionSimulationHelper.STATE_ERROR);
			this._gr.update();
			
			endTime = new Date().getTime();
			this._printSummary(startTime, endTime, (i + 1));
			this._info('Processing ended for block due to error');
			this.LOGGER.error('Error processing block: {0}', error);
			throw 'Error processing simulation run block with sys id ' + this._gr.getValue('sys_id') + ': ' + error;
		}
	},
	
	_processBatch: function(taskSysIDStartIndex, taskSysIDEndIndex) {
		try {
			//Prepare request object for LanguageX prediction
			var requestObjectList = this._getRequestObjectForTaskSysIDs(taskSysIDStartIndex, taskSysIDEndIndex);

			//LanguageX bulk prediction
			var predictionResults = this._composite.getBulkPrediction(requestObjectList, this._languageCode);
			if (gs.nil(predictionResults)) {
				this._markNonSimulatedContextsInBatchWithAPIError(taskSysIDStartIndex, taskSysIDEndIndex);
				return;
			}

			var intentAndTopicDetails;
			var intentMatch;
			var unsupportedMatchedIntent;
			var simulationContextGr = new GlideRecord(AutoResolutionConstants.SIMULATION_CONTEXT_TABLE_NAME);
			
			var intent;
			var confidenceScore;
			var serviceModel;

			var taskCount = taskSysIDEndIndex - taskSysIDStartIndex;
			for (var taskSysIDIndex = 0; taskSysIDIndex < taskCount; taskSysIDIndex++) {
				simulationContextGr.initialize();
				simulationContextGr.addQuery('task', predictionResults['result'][taskSysIDIndex]['input']['id']);
				simulationContextGr.addQuery('simulation_run_block', this._gr.getValue('sys_id'));
				simulationContextGr.query();
					
				if (!simulationContextGr.next()) {
					this.LOGGER.info('Simulation context record not found for task: {0}, for simulation run block: {1}', simulationContextGr.getValue('task'), this._gr.getValue('sys_id'));
					continue;
				}
			
				//LanguageX API prediction error
				if (predictionResults['status']['message'] === AutoResolutionConstants.STATUS_ERROR){
					this.LOGGER.error('API prediction error for task: {0}, for simulation run block: {1}', simulationContextGr.getValue('task'), this._gr.getValue('sys_id'));
					this._markSingleNonSimulatedContextRecordWithAPIError(simulationContextGr);
					continue;
				}

				// If there is no result for this task, mark it error and continue
				if (gs.nil(predictionResults['result']) || gs.nil(predictionResults['result'][taskSysIDIndex])) {
					this.LOGGER.error('API prediction error for task: {0}, for simulation run block: {1}', simulationContextGr.getValue('task'), this._gr.getValue('sys_id'));
					this._markSingleNonSimulatedContextRecordWithAPIError(simulationContextGr);
					continue;
				}

				//Save payload values from LanguageX response
				//TODO: Assume output[0] is always AgentZero service, will refactor once more services are supported
				intent = predictionResults['result'][taskSysIDIndex]['output'][0]['serviceOutput'];
				confidenceScore = predictionResults['result'][taskSysIDIndex]['output'][0]['serviceOutputScore'];
				serviceModel = predictionResults['result'][taskSysIDIndex]['output'][0]['serviceModelUsed'];
				serviceModelSolutionName = predictionResults['result'][taskSysIDIndex]['output'][0]['serviceModelSolutionName'];
				serviceModelSolutionVersion = predictionResults['result'][taskSysIDIndex]['output'][0]['serviceModelSolutionVersion'];
				
				intentAndTopicDetails = new AutoResolutionPredictionHelper(this._autoResConfigSysID).processIntent(intent);
				intentMatch = (intentAndTopicDetails.intentTopicState !== AutoResolutionConstants.INTENT_TOPIC_STATE.NO_INTENT);
				
				simulationContextGr.setValue('configuration', this._autoResConfigSysID);
				simulationContextGr.setValue('nlu_intent', intentAndTopicDetails.nluIntent || '');
				simulationContextGr.setValue('matched_topic', intentAndTopicDetails.matchedTopic || '');
				simulationContextGr.setValue('intent_topic_state', intentAndTopicDetails.intentTopicState || '');
				simulationContextGr.setValue('reason', intentAndTopicDetails.intentTopicStateReason || '');
				simulationContextGr.setValue('intent_match', intentMatch);
				simulationContextGr.setValue('active', false);       // Since this is for simulation, we set this as false
				simulationContextGr.setValue('prediction_confidence', confidenceScore || 0);
				simulationContextGr.setValue('service_model_used', serviceModel || '');
				simulationContextGr.setValue('service_model_solution_name', serviceModelSolutionName || '');
				simulationContextGr.setValue('service_model_solution_version', serviceModelSolutionVersion || '');
				
				if (!intentMatch) {
					unsupportedMatchedIntent = intentAndTopicDetails.nluIntent.split(AutoResolutionConstants.UNSUPPORTED_MATCHED_INTENT_SEPARATOR)[1];
					simulationContextGr.setValue('unsupported_matched_intent', unsupportedMatchedIntent || '');
				}
				simulationContextGr.update();
			}
		} catch(error) {
			this._markNonSimulatedContextsInBatchWithAPIError(taskSysIDStartIndex, taskSysIDEndIndex);
			// If continue on batch error is true, we would like to continue
			if (this._continueOnBatchError) {
				this._state = AutoResolutionSimulationHelper.STATE_PARTIALLY_COMPLETE;
				this._updateErrorMessageOnBlockRecord(error);
			} else {
				throw error;
			}
		}
	},
	
	_validateParameters: function() {
		if (gs.nil(this._batchSize))
			throw this.type + '.process: Please set the batch size before calling processNextBatch method';
		
		if (gs.nil(this._languageCode))
			throw this.type + '.process: Could not find language code for block: ' + this._gr.getValue('name');
	},
	
	_getRequestObjectForTaskSysIDs: function(taskSysIDStartIndex, taskSysIDEndIndex) {
		var requestObjectList = [];
		for (var i = taskSysIDStartIndex; i < taskSysIDEndIndex; i++)
			requestObjectList.push(this._getRequestObjectForTaskSysID(this._taskSysIDList[i]));
		
		return requestObjectList;
	},

	_getRequestObjectForTaskSysID: function(taskSysID) {
		var requestObject = {
			'id': taskSysID,
			'tableName': this._targetTable,
			'userID': gs.getUserId(),
			'fields': {}
		};

		var targetGr = new GlideRecord(this._targetTable);
		targetGr.get(taskSysID);
		
		if (gs.nil(targetGr)) {
			this._info('Cannot find task with sys id: ' + taskSysID);
			return requestObject;
		}

		var columnName;
		for (var columnNameIndex in this._predictionFields) {
			columnName = this._predictionFields[columnNameIndex];
			requestObject.fields[columnName] = targetGr.getValue(columnName);
		}
		
		return requestObject;
	},
	
	_getTotalRecordsInBlock: function() {
		var simulationContextGa = new GlideAggregate(AutoResolutionConstants.SIMULATION_CONTEXT_TABLE_NAME);
		simulationContextGa.addQuery('simulation_run_block', this._gr.getValue('sys_id'));
		simulationContextGa.addAggregate('COUNT');
		simulationContextGa.query();
		
		return simulationContextGa.next() ? parseInt(simulationContextGa.getAggregate('COUNT')) : 0;
	},

	_markNonSimulatedContextsInBatchWithAPIError: function(taskSysIDStartIndex, taskSysIDEndIndex) {
		// Construct an array to be more efficient for update multiple case
		var taskSysIDList = [];
		for (var i = taskSysIDStartIndex; i < taskSysIDEndIndex; i++)
			taskSysIDList.push(this._taskSysIDList[i]);

		var simulationContextGr = new GlideRecord(AutoResolutionConstants.SIMULATION_CONTEXT_TABLE_NAME);
		simulationContextGr.addQuery('task', 'IN', taskSysIDList.join(','));
		simulationContextGr.addQuery('intent_topic_state', '');
		simulationContextGr.addQuery('simulation_run_block', this._gr.getValue('sys_id'));
		
		// Set all the values and updateMultiple
		simulationContextGr.setValue('intent_topic_state', AutoResolutionConstants.INTENT_TOPIC_STATE.NO_INTENT);
		simulationContextGr.setValue('intent_match', false);
		simulationContextGr.setValue('reason', AutoResolutionConstants.NO_INTENT_REASON.API_ERROR);
		simulationContextGr.updateMultiple();
	},
	
	_markSingleNonSimulatedContextRecordWithAPIError: function(simulationContextGr) {
		simulationContextGr.setValue('intent_topic_state', AutoResolutionConstants.INTENT_TOPIC_STATE.NO_INTENT);
		simulationContextGr.setValue('intent_match', false);
		simulationContextGr.setValue('reason', AutoResolutionConstants.NO_INTENT_REASON.API_ERROR);
		simulationContextGr.update();
	},

	_getTaskSysIDsInCurrentBlock: function() {
		var taskSysIDs = [];
		var simulationContextGr = new GlideRecord(AutoResolutionConstants.SIMULATION_CONTEXT_TABLE_NAME);
		simulationContextGr.addQuery('simulation_run_block', this._gr.getValue('sys_id'));
		simulationContextGr.addNullQuery('intent_topic_state');
		simulationContextGr.query();

		while (simulationContextGr.next())
			taskSysIDs.push(simulationContextGr.getValue('task'));

		return taskSysIDs;
	},

	_updateErrorMessageOnBlockRecord: function(errorMessage) {
		var existingErrorMessage = this._gr.getValue('message');
		var errorMessageToAppend = errorMessage;
		if (gs.nil(existingErrorMessage))
			existingErrorMessage = errorMessageToAppend;
		else
			errorMessageToAppend = existingErrorMessage + '\n' + errorMessageToAppend;

		this._gr.setValue('message', errorMessageToAppend);
		this._gr.update();
	},

	_evaluateAndSetStateIfAllAPIErrors: function() {
		var totalAPIErrors = 0;
		var simContextGa = new GlideAggregate(AutoResolutionConstants.SIMULATION_CONTEXT_TABLE_NAME);
		simContextGa.addQuery('reason', AutoResolutionConstants.NO_INTENT_REASON.API_ERROR);
		simContextGa.addQuery('simulation_run_block', this._gr.getValue('sys_id'));
		simContextGa.addAggregate('COUNT');
		simContextGa.query();

		if (simContextGa.next())
			totalAPIErrors =  simContextGa.getAggregate('COUNT');

		if (totalAPIErrors == this._taskSysIDList.length)
			this._state = AutoResolutionSimulationHelper.STATE_ERROR;
	},
	
	_info: function(message) {
		this.LOGGER.info('Message for run block={0}: {1}', this._gr.getValue('name'), message);
	},
	
	_printSummary: function(startTime, endTime, numOfRecordsProcessed) {
		var totalTimeTaken = (endTime - startTime) / 1000;
		var numberOfRequests = Math.ceil(numOfRecordsProcessed / this._batchSize);
		var summaryString = 'Total records processed: ' + numOfRecordsProcessed + '\n';
		summaryString += 'Total requests sent to prediction server: ' + numberOfRequests + '\n';
		summaryString += 'Total time taken: ' + totalTimeTaken + ' seconds';
		
		this._info(summaryString);
	},

    type: 'AutoResolutionSimulationRunBlock'
};
