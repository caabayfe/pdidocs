var AutoResolutionMLHelper = Class.create();
AutoResolutionMLHelper.prototype =  Object.extendsObject(AutoResolutionMLBase, {
	capability : '',

	initialize: function(configSysId) {
		this.USE_AGENT_ZERO_LEGACY = gs.getProperty("glide.platform_ml.agent_zero.enable_legacy", "false");

		this.setConfigSysId(configSysId);
		this._configGr = this._getConfigRecord(this.getConfigSysId());
		this.setCapability();

		this.AUTO_RESOLUTION_TRAINING_STATUS_SCHEDULED_JOB_ID = 'a0b3475c73071010f14a063f34f6a78e';
		this.MIN_RECORDS_PROPERTY = "glide.platform_ml.api.min_agent_zero_records";
		this.MIN_DATASET_RECORDS = Number(gs.getProperty(this.MIN_RECORDS_PROPERTY, 10000));
		this.ERROR_CODE = {
			retry : 'Configuration or Network Error',
			unauthorized: 'Unauthorized'
		};
		this.TRAINING_ERROR_MSG = gs.getMessage('Machine learning model is not trained. Please contact support.');
		this.TRAINING_UNSUPPORTED_MSG = gs.getMessage("Training is not supported for this capability.");

		this.LOGGER = new AutoResolutionLoggingUtils()
			.withName(this.type)
			.withConfiguration(this.getConfigSysId())
			.createLogger();
	},

	checkSolutionExists: function(solutionName) {
		try {
			if (!gs.nil(solutionName)) {
				var autoResolutionPISolution = sn_ml.AgentZeroSolutionStore.get(solutionName);
				return !gs.nil(autoResolutionPISolution);
			}
			return false;
		} catch(ex) {
			this.LOGGER.warn('Error checking ML solution exists: name={0}: {1}', solutionName, ex);
			return false;
		}
	},

	/**
	 * Called by the Train UI action, this method creates solution definition and submits training job for the solution
	 * @returns {{status: error or success, msg: 'reason'}}
	 */
	createSolutionAndTrain: function() {
		if (!this._shouldCreateOrUpdateAgentZeroLegacySolution())
			return this.trainLanguageModels(AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO_WORKFLOW);
		else
			return this.trainLanguageModels(AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO);
	},

	/**
	 * Called by the BR on IAR config table when any update needs to happen to the Agent zero solution definition
	 * NOTE: there is nothing to update for Agent zero workflow capability
	 * @returns {{status: error or success, msg: 'reason'}}
	 */
	updateSolutions: function() {
		if (this._shouldCreateOrUpdateAgentZeroLegacySolution())
			return this.updateAllSolutionDefinitions(AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO);
	},

	trainLanguageModels: function(capability) {
		var solutionName = '';
		var inputParams = this._buildInputParams(capability);

		var languageCodesArr = this._getConfigLanguages();
		for (var i=0; i<languageCodesArr.length; i++) {

			var languageCode = languageCodesArr[i];

			var languageConfigGr = AutoResolutionLanguageHelper.getLanguageConfigRecord(this.getConfigSysId(), languageCode, capability);
			solutionName = this._getSolutionName(languageConfigGr);

			if (gs.nil(solutionName)) {
				var label = ('Auto Resolution ').concat(capability).concat(' ').concat(languageCode);
				inputParams.label = label;
				inputParams.solutionName = solutionName;
				inputParams.languageCode = languageCode;

				var result = this.addSolutionDefinition(inputParams);
				if (result.status === 'error')
					return result;

				solutionName = result.solutionName;
				languageConfigGr = AutoResolutionLanguageHelper.createLanguageConfigRecord(this.getConfigSysId(), languageCode, capability, solutionName);
			}

			var trainResult = this.trainSolution(solutionName, languageConfigGr);
			if (trainResult.status === 'success')
				//enable the scheduled job to poll training status
				this.toggleScheduleJobActive(true);
			else
				return result;
		}
	},

	addSolutionDefinition: function(inputParams) {
		try {
			var response = {};

			if (gs.nil(inputParams)) {
				response.status = "error";
				response.msg = "Incorrect input params";
				return response;
			}

			var solutionName = inputParams.solutionName;
			var capability = inputParams.capability;
			var mySolution;

			if (this.checkSolutionExists(solutionName)) {
				this.LOGGER.info('Auto Resolution Solution Definition Exists');
				response.status = "success";
				response.solutionName = solutionName;
				return response;
			}

			switch (capability) {
				case AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO:
					mySolution = this._createSolutionLegacy(inputParams);
					break;

				case AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO_WORKFLOW:
					mySolution = this._createSolutionWorkflow(inputParams);
					break;

				default:
					response.status = "error";
					response.msg = this.TRAINING_UNSUPPORTED_MSG;
					return response;
			}

			// Add solution to db and update config record
			solutionName = sn_ml.AgentZeroSolutionStore.add(mySolution);

			this.LOGGER.info('Created solution definition with name={0}', solutionName);

			response.status = "success";
			response.msg = "Created solution definition";
			response.solutionName = solutionName;
			return response;

		} catch(ex){
			this.LOGGER.error('Error adding solution definition: {0}', ex);
			response.status = "error";
			response.msg = this._processError(ex.getMessage());
			return response;
		}
	},

	updateAllSolutionDefinitions: function(capability) {

		var inputParams = this._buildInputParams(capability);

		var languageCodesArr = AutoResolutionLanguageHelper.getSupportedLanguages(this.getConfigSysId());
		for (var i=0; i<languageCodesArr.length; i++) {
			var languageCode = languageCodesArr[i];
			var languageConfigGr = AutoResolutionLanguageHelper.getLanguageConfigRecord(this.getConfigSysId(), languageCode, capability);
			solutionName = this._getSolutionName(languageConfigGr);
			var label = ('Auto Resolution ').concat(capability).concat(' ').concat(languageCode);

			inputParams.label = label;
			inputParams.solutionName = solutionName;
			inputParams.languageCode = languageCode;

			var result = this.updateSolutionDefinition(inputParams);
			if (result.status === 'error')
				return result;
		}
	},

	updateSolutionDefinition: function(inputParams) {
		try {
			if (gs.nil(inputParams)) {
				response.status = "error";
				response.msg = "Incorrect input params";
				return response;
			}

			var solutionName = inputParams.solutionName;
			var capability = inputParams.capability;
			var mySolution;

			if (!this.checkSolutionExists(solutionName)) {
				response.status = "error";
				response.msg = gs.getMessage("Solution name doesn't exist in the Agent Zero solution store");
				return response;
			}

			switch (capability) {
				case AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO:
					mySolution = this._createSolutionLegacy(inputParams);
					break;

				case AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO_WORKFLOW:
					mySolution = this._createSolutionWorkflow(inputParams);
					break;

				default:
					response.status = "error";
					response.msg = this.TRAINING_UNSUPPORTED_MSG;
					return response;
			}
			// Update solution
			sn_ml.AgentZeroSolutionStore.update(solutionName, mySolution);

			this.LOGGER.info('Solution Definition is updated: {0}', solutionName);
			response.status = "success";
			response.msg = "Updated solution definition";
			response.solutionName = solutionName;
			return response;

		} catch(ex) {
			this.LOGGER.error('Error updating solution definition: {0}', ex);
			response.status = "error";
			response.msg = this._processError(ex.getMessage());
			return response;
		}
	},

	trainSolution: function(solutionName, languageConfigGr) {
		try {
			var autoResolutionPISolution = sn_ml.AgentZeroSolutionStore.get(solutionName);
			// Train the AutoResolution solution
			var solutionVersion = autoResolutionPISolution.submitTrainingJob();
			var trainingStatus = JSON.parse(solutionVersion.getStatus());

			var trainingResults = {};
			trainingResults.ml_training_state = trainingStatus['state'];
			trainingResults.ml_training_progress = trainingStatus['percentComplete'];
			trainingResults.ml_status_last_updated = new GlideDateTime();
			trainingResults.latest_trained_version = this.getActiveSolutionVersionNumberForSolutionName(
				sn_ml.AgentZeroSolutionStore, solutionName);
			trainingResults.tuned = false;

			AutoResolutionLanguageHelper.updateLanguageConfigRecord(languageConfigGr, trainingResults);

			return {'status': 'success', 'msg': ''};
		} catch(ex) {
			this.LOGGER.error('Error training ML solution for Auto-Resolution: {0}', ex);
			return {'status': 'error', 'msg': this.TRAINING_ERROR_MSG + this._processError(ex.getMessage())};
		}
	},

	cancelAllTrainingJobs: function() {
		try {
			//since we make training languages field read only if training is in progress it is safe to get
			//languages saved on configuration
			var languageCodesArr = this._getConfigLanguages();

			for (var i=0; i<languageCodesArr.length; i++) {
				var languageConfigGr = AutoResolutionLanguageHelper.getLanguageConfigRecord(this.getConfigSysId(), languageCodesArr[i], this.getCapability());
				var solutionName = this._getSolutionName(languageConfigGr);
				var trainingState = '';

				if (!gs.nil(solutionName)) {
					this.cancelTrainingJob(solutionName);
					var trainingResult = this.trainingStatusCheckForModel(solutionName);
					AutoResolutionLanguageHelper.updateLanguageConfigRecord(languageConfigGr, trainingResult);
					trainingState = trainingResult.ml_training_state;
				}
				else {
					languageConfigGr.ml_training_state = trainingState = 'solution_cancelled';
					languageConfigGr.ml_status_last_updated = trainingResult.ml_status_last_updated;
					languageConfigGr.update();
				}
			}
		} catch(ex) {
			this.LOGGER.error('Error cancelling Auto-Resolution training jobs: {0}', ex.getMessage());
		}
	},

	cancelTrainingJob: function(solutionName) {
		try {
			var autoResolutionPISolution = sn_ml.AgentZeroSolutionStore.get(solutionName);
			autoResolutionPISolution.cancelTrainingJob();
		} catch(ex) {
			this.LOGGER.error('Error cancelling training job: {0}',ex.getMessage());
		}
	},

	/**
	 * Returns true only if ALL the languages selected in the configuration (to be trained) have completed training
	 * @returns {boolean}
	 */
	checkAllLanguageModelsTrainingCompleted: function() {
		var trainingCompleted = false;

		//we need to get language codes which has a solution version
		var languageCodesArr = this._getLanguagesWhichHasSolutionVersion();
		var numOfLanguagesCompletedTraining = 0;

		for (var i=0; i<languageCodesArr.length; i++) {
			var languageConfigGr = AutoResolutionLanguageHelper.getLanguageConfigRecord(this.getConfigSysId(), languageCodesArr[i], this.getCapability());
			trainingCompleted = this.isTrainingJobCompleted(this._getSolutionName(languageConfigGr));
			if (trainingCompleted)
				numOfLanguagesCompletedTraining++;
		}
		return numOfLanguagesCompletedTraining === languageCodesArr.length;
	},

	isTrainingJobCompleted: function(solutionName) {
		try {
			if (this.checkSolutionExists(solutionName)) {
				var autoResolutionPISolution = sn_ml.AgentZeroSolutionStore.get(solutionName);
				var trainingStatus = JSON.parse(autoResolutionPISolution.getLatestVersion().getStatus());
				return trainingStatus['hasJobEnded'] === 'true';
			}
			return false;
		} catch(ex) {
			this.LOGGER.warn('Error checking for training job completion: {0}',ex.getMessage());
			return false;
		}
	},

	trainingJobStatusCheck: function() {
		try {
			var errCode = '';
			//since we make training languages field read only if training is in progress it is safe to get
			//languages saved on configuration
			var languageCodesArr = this._getConfigLanguages();
			var trainingResult = {};
			for (var i=0; i<languageCodesArr.length; i++) {

				var languageConfigGr = AutoResolutionLanguageHelper.getLanguageConfigRecord(this.getConfigSysId(), languageCodesArr[i], this.getCapability());
				var solutionName = this._getSolutionName(languageConfigGr);

				trainingResult = this.trainingStatusCheckForModel(solutionName);
				AutoResolutionLanguageHelper.updateLanguageConfigRecord(languageConfigGr, trainingResult);
				errCode = trainingResult.errorCode;
			}

			return errCode;

		} catch(ex) {
			this.LOGGER.debug('Error checking training job status: {0}', ex);
		}
	},

	trainingStatusCheckForModel: function(solutionName) {
		var autoResolutionPISolution = sn_ml.AgentZeroSolutionStore.get(solutionName);
		var trainingStatus = JSON.parse(autoResolutionPISolution.getLatestVersion().getStatus());
		var trainingState = trainingStatus['state'];

		var errorCode = '';

		//if the training state is in Configuration network error or unauthorized, we want to cancel the existing training job so the admin can train/retrain the model.
		if (['retry', 'unauthorized'].indexOf(trainingState) >= 0) {
			errorCode = this.ERROR_CODE[trainingState];
			this.LOGGER.info("Model training has reached a terminal state: {0}, cancelling the training job.", errorCode)
			this.cancelTrainingJob(solutionName);
			//get the status again
			trainingStatus = JSON.parse(autoResolutionPISolution.getLatestVersion().getStatus());
		}

		var returnObj = {};
		returnObj.ml_training_state = trainingStatus['state'];
		returnObj.ml_training_progress = trainingStatus['percentComplete'];
		returnObj.ml_status_last_updated = new GlideDateTime();
		returnObj.errorCode = errorCode;
		returnObj.latest_trained_version = this.getActiveSolutionVersionNumberForSolutionName(sn_ml.AgentZeroSolutionStore, solutionName);
		returnObj.tuned = false;

		return returnObj;

	},

	isAnyLanguageModelActive: function() {
		var foundActiveModel = false;
		var languageCodesArr = AutoResolutionLanguageHelper.getSupportedLanguages(this.getConfigSysId());

		for (var i=0; i<languageCodesArr.length; i++) {
			var languageConfigGr = AutoResolutionLanguageHelper.getLanguageConfigRecord(this.getConfigSysId(), languageCodesArr[i], this.getCapability());
			if (this.hasActiveVersion(this._getSolutionName(languageConfigGr))) {
				foundActiveModel = true;
				return foundActiveModel;
			}
		}
		return foundActiveModel;
	},

	hasActiveVersion: function(solutionName) {
		try {
			if (this.checkSolutionExists(solutionName)) {
				var mlSolution = sn_ml.AgentZeroSolutionStore.get(solutionName);
				var solutionVersion = mlSolution.getActiveVersion();
				return !gs.nil(solutionVersion);
			}
			return false;
		} catch(ex) {
			this.LOGGER.debug('Error checking for ML solution active version: {0}',+ ex.getMessage());
			return false;
		}
	},

	predict: function(taskGr, languageCode) {
		try {
			var targetGr = new GlideRecord(taskGr.getTableName());
			targetGr.get(taskGr.getUniqueValue());
			return this.predictResults(targetGr, languageCode);
		} catch(ex) {
			this.LOGGER.error('Error calling ML predict API: {0}', ex.getMessage());
			return;
		}
	},

	/**
	 *.  @parm {taskGrOrRequestObjectList} can be either a taskGr or requestObjectList
	 *                                  Ex for a requestObject: [{"short_description": "Printer issues", "description": "Just a description"},
	 *                                                           {"short_description": "VPN issues", "description": "Just a description"}]
	 **/
	predictResults: function(taskGrOrRequestObjectList, languageCode) {
		var autoResolutionVersion = this._getActiveVersionForLanguage(sn_ml.AgentZeroSolutionStore, languageCode);
		var options = {};
		options.mluc = AutoResolutionUtil.getMLUseCaseId(this._getTableName());
		return JSON.parse(autoResolutionVersion.predict(taskGrOrRequestObjectList, options));
	},

	getActiveSolutionVersionNumberForLanguage: function(languageCode) {
		try {
			var activeSolutionVersion = this._getActiveVersionForLanguage(sn_ml.AgentZeroSolutionStore, languageCode);
			return activeSolutionVersion;
		} catch(error) {
			this.LOGGER.debug('Error getting active solution for language={0}: {1}', languageCode, error);
		}
		return '';
	},

	toggleScheduleJobActive: function(value) {
		var scheduledJobGr = new GlideRecord('sysauto_script');
		if (scheduledJobGr.get(this.AUTO_RESOLUTION_TRAINING_STATUS_SCHEDULED_JOB_ID)) {
			scheduledJobGr.setValue('active', value);
			scheduledJobGr.update();
		}
		else
			this.LOGGER.warn('Scheduled job with ID: {0} not found.', this.AUTO_RESOLUTION_TRAINING_STATUS_SCHEDULED_JOB_ID);
	},

	/*
	* if there is no active version of the ML model and if training job is not completed (in the initial state, since there is no solution  definition created this would return false)
	*/
	showTrainButton: function() {
		if (!AutoResolutionLanguageHelper.isLanguageConfigRecordPresent(this.getConfigSysId()))
			return true;
		return this.checkAllLanguageModelsTrainingCompleted();
	},

	/*
	* show only when there is any language configuration record and training is in progress
	*/
	showRefreshOrCancelTrainingButton: function() {
		if (!AutoResolutionLanguageHelper.isLanguageConfigRecordPresent(this.getConfigSysId()))
			return false;
		return !this.checkAllLanguageModelsTrainingCompleted();
	},


	setCapability: function() {
		if (this.USE_AGENT_ZERO_LEGACY === "true")
			this.capability = AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO;
		else
			this.capability = AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO_WORKFLOW;
	},

	getCapability: function() {
		return this.capability;
	},

	_shouldCreateOrUpdateAgentZeroLegacySolution: function() {
		return this.getCapability() === AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO;
	},

	_buildInputParams: function(capability) {
		var domainName = this._getDomainName(this._configGr.getValue('sys_domain'));
		var encodedQuery = this._configGr.getValue('training_encoded_query');
		var targetTableName = this._configGr.getValue('target_table_name');
		var useCaseId = AutoResolutionUtil.getMLUseCaseId(targetTableName);

		var inputParams = {};

		inputParams.domainName = domainName;
		inputParams.encodedQuery = encodedQuery;
		inputParams.targetTableName = targetTableName;
		inputParams.capability = capability;
		inputParams.useCaseId = useCaseId;
		inputParams.taskType = AutoResolutionUtil.getTaskType(targetTableName);
		return inputParams;
	},

	_createSolutionLegacy: function(inputParams) {
		var domainName = inputParams.domainName;
		var languageCode = inputParams.languageCode;
		var encodedQuery = inputParams.encodedQuery;
		var targetTableName = inputParams.targetTableName;
		var label =  inputParams.label;
		var ucId = inputParams.useCaseId;

		var myIncidentData = new sn_ml.DatasetDefinition({
			'tableName' : targetTableName,
			'fieldNames' : ['short_description', 'description'],
			'encodedQuery' : encodedQuery,
		});
		var mySolution = new sn_ml.AgentZeroSolution({
			'label': label,
			'datasets': [myIncidentData],
			'domainName': domainName,
			'processingLanguage' : languageCode,
			'useAgentZeroLegacy': true,
			'advancedParams' : {
				'mluc' : ucId
			}
		});

		return mySolution;
	},

	_createSolutionWorkflow: function(inputParams) {
		var domainName = inputParams.domainName;
		var languageCode = inputParams.languageCode;
		var label =  inputParams.label;
		var ucId = inputParams.useCaseId;
		var taskType = inputParams.taskType;

		var mySolution = new sn_ml.AgentZeroSolution({
			'label': label,
			'domainName': domainName,
			'processingLanguage': languageCode,
			'taskType': taskType,
			'schedulingInfo' : {
				'mluc' : ucId,
				'useCase' : 'IAR-AgentZero'
			}
		});

		return mySolution;
	},

	_getConfigRecord: function() {
		var configGr = new GlideRecord(AutoResolutionConstants.CONFIG_TABLE_NAME);
		configGr.get(this.getConfigSysId());
		return configGr;
	},

	_getConfigLanguages: function() {
		var languages = this._configGr.getValue('training_language') || '';
		if (!gs.nil(languages))
			return languages.split(',');
		return [];
	},

	_getTableName: function() {
		return this._configGr.getValue('target_table_name') || '';
	},

	_processError: function(message) {

		if (gs.nil(message))
			return '';

		//ERR059: Add operation failed on table ml_capability_definition_base - reason: ["ERR011: Dataset for table incident should have minimum of 1 records"]
		//ERR058: Failed to submit training job - reason: ["ERR011: Dataset for table incident should have minimum of 50 records"]
		if (message.indexOf('ERR011') >=0) {
			var link = '<a target="_blank" href="/api/now/v1/context_doc_url/ml-min-records">' + this.MIN_RECORDS_PROPERTY + '</a>';
			var msg = gs.getMessage('Model training failed due to one or both of these reasons: There are not enough records to meet the minimum number of records needed in the {0} table that is specified in the {1} system property or to fulfill the <strong>{2}</strong>. After you change the minimum number of records for the table, train your model again.', [this._getTableName(), link, "Encoded query condition"]);
			return msg;
		}
		else
			return message;

	},

	_getDomainName: function(domainId) {
		/*If the user uses the domain picker to switch to the global domain, gs.getUser().getDomainID() returns the string "global".
		For all other domains, the method returns the sys_id of that domain.*/
		if (gs.nil(domainId) || domainId === 'global')
			return 'global';
		else {
			var domainGr = new GlideRecord('domain');
			domainGr.get(domainId);
			return domainGr.name;
		}
	},

	/**
	 *
	 * @returns {languageCodesArr} set of language codes for which there are solution versions
	 * @private
	 */
	_getLanguagesWhichHasSolutionVersion: function() {
		var supportedLangCodes = AutoResolutionLanguageHelper.getSupportedLanguages(this.getConfigSysId(), this.getCapability());
		var configLangCodes = this._getConfigLanguages();

		//if intersect of supportedLangCodes and configLangCodes is null, go with supportedLangCodes which means there
		// was a new language selected for training
		//else use only the intersected languages which means get the languages which is selected for training and already
		// has a trained version
		var au = new ArrayUtil();
		var languageCodesArr = au.intersect(supportedLangCodes, configLangCodes);

		if (languageCodesArr.length == 0)
			return supportedLangCodes;
		else
			return languageCodesArr;
	},

	type: 'AutoResolutionMLHelper'
});
