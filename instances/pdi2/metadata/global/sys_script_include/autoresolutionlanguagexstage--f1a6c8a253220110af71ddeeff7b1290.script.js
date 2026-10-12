var AutoResolutionLanguageXStage = Class.create();
AutoResolutionLanguageXStage.prototype = Object.extendsObject(AutoResolutionTaskProcessingStage, {

	getStateValue: function() {
		return AutoResolutionConstants.TASK_PROCESSING_STATE.LANGUAGEX;
	},

	execute: function(contextFieldValueMap) {
		this.prepare(contextFieldValueMap, this.type);
		
		if(!this._shouldStageContinue())
			return this.response;

		/**
		 *  We are making the assumption that if ML prediction call can't be made, we are exiting the IAR flow
		 *  ITSM will also be uptaking languageX API's starting Utah
		 */
		var extResponse = this.processPreProcessingExtension();
		if (gs.nil(extResponse)) {
			this.setError("Pre-processing extension execution returned a status error");
			return this.response;
		}
		var inputFields = this._getPredictionInputFields(extResponse);
		var options = this._getPredictionOptions(extResponse);

		if (gs.nil(inputFields)) {
			this.LOGGER.warn("Input fields for prediction are empty, Composite services will not be called for task number={0}", this.taskGr.getValue('number'));
			this.setError("Input fields for prediction are empty, Composite services will not be called");
			return this.response;
		}

		this.LOGGER.info("Initiating Composite service call with prediction fields={0} for the task number={1}",
			JSON.stringify(inputFields), this.taskGr.getValue('number'));

		// Create predictions using LanguageX
		var predictionSysId;
		var contextReason = '';
		try {
			var languageXResult = this.mlHelper.predict(this.taskGr, inputFields, options, this.languageCode);
			predictionSysId = gs.nil(languageXResult.prediction_id) ? '' : languageXResult.prediction_id;

			if (languageXResult.status == AutoResolutionConstants.STATUS_ERROR) {
				this.LOGGER.info('An error occurred. message: {0}', languageXResult.message); 
				contextReason = AutoResolutionConstants.NO_INTENT_REASON['API_ERROR'];
			} else {
				this.LOGGER.info("Successfully saved Composite prediction response in service results tables");
				this.processPostProcessExtension(languageXResult);
			}

		} catch (error) {
			this.LOGGER.error('Error calling Composite predictions for task {0}. Error: {1}', this.taskGr.getValue('number'), error);
			this.setError(error);
		}
		
		this.setContextReason(contextReason);
		this.setContextValue('prediction', predictionSysId);
		return this.response;
	},

	processPreProcessingExtension: function() {
		var extResponse;

		// Try to get the response from the pre-processing extension
		try {
			extResponse = this._executePreProcessExtension();
		} catch(error) {
			this.LOGGER.warn(
				'An error occurred while executing pre-process extension for config_sys_id:{0}, task_table:{1}, task_sys_id:{2} error:{3}',
				this.configId, this.taskGr.getTableName(), this.taskId, error);
			return null;
		}

		// No need to process
		if (gs.nil(extResponse))
			return null;

		// No need to process when the pre-processing extension returns a status Error as well
		if (extResponse.status === global.AutoResolutionConstants.STATUS_ERROR) {
			this.logger.warn('Pre-processing extension execution returned a status error, reason={0}', extResponse.message);
			return null;
		}

		return extResponse;
	},
	
	/**
	 * Performs initial checks on whether the LanguageX stage is fully supported to determine whether the 
	 * stage should continue to execute.
	 * @return {boolean} whether to continue the LanguageX stage
	 */
	_shouldStageContinue: function() {
		// The LanguageX stage should not execute if there is no configuration language 
		// record for supported ML capabilities
		if (!AutoResolutionLanguageXHelper.shouldLanguageXExecute(this.configId)) {
			this.setContextReason(AutoResolutionConstants.NO_INTENT_REASON['INTENT_PREDICTION_NOT_ENABLED']);
			return false;
		}

		// Get the ML solution object to check if LanguageX can execute given the capability type
		var capability;
		try {
			// Dynamically decide whether to call LanguageX or Composite predict
			this.mlHelper = AutoResolutionMLFactory.createMLHelper(this.configId, this.contextId, true);
			capability = this.mlHelper.getCapability();

			// Check if task language is supported for the ML capability used
			if (!AutoResolutionLanguageXHelper.canLanguageXExecute(this.configId, this.languageCode, capability)) {
				this.setContextReason(AutoResolutionConstants.NO_INTENT_REASON['INACTIVE_LANGUAGE']);
				return false;
			}
		} catch (error) {
			this.LOGGER.error('Error fetching the ML solution object for task {0} with the capability: {1}. Error: {2}', 
				this.taskGr.getValue('number'), capability, error);
			this.setError(error);
			return false;
		}

		return true;
	},

	/**
	 * Returns the prediction input fields for LanguageX call.
	 */
	_getPredictionInputFields: function(extResponse) {

		if (gs.nil(extResponse.input_field) || Object.keys(extResponse.input_field).length == 0) {
			this.LOGGER.warn(
				'Input field(s) are empty for config_sys_id:{0}, task_table:{1}, task_sys_id:{2} extension result:{3}',
				this.configId, this.taskGr.getTableName(), this.taskId, JSON.stringify(extResponse));
			return null;
		}

		// if found, return the result.
		var predictionInputs = extResponse.input_field;
		this.LOGGER.info("Using prediction inputs={0} from the pre-process response", JSON.stringify(predictionInputs));

		return predictionInputs;
	},

	/**
	 *
	 * @param extResponse
	 * @private
	 */
	_getPredictionOptions: function(extResponse) {
		if (gs.nil(extResponse.options) || Object.keys(extResponse.options).length == 0)
			return {};

		var options = extResponse.options;
		this.LOGGER.debug("Using prediction options={0) from pre-process response", JSON.stringify(options));
		return options;
	},

	/**
	 * Executes pre-processing extension point if found.
	 * @param configGr
	 * @param taskGr
	 * @return null if no pre-processing script is not found or error happened
	 */
	_executePreProcessExtension: function() {

		// Get the sysId of the script to execute
		var scriptSysId = this._getExtensionScriptSysId(AutoResolutionConstants.PRE_PROCESSING_EXT_POINT_FIELD_NAME);

		// If null, the extension is not set
		if (gs.nil(scriptSysId)) {
			this.LOGGER.info("Auto-Resolution Configuration doesn't have pre-processing extension associated with it.");
			return null;
		}

		// get the parameter bag
		var paramBag = this._getParamBagForPreProcessExtension();
		return this.executeExtensionScript(scriptSysId, paramBag);
	},

	/**
	 * Processes post-process extension after LanguageX invocation
	 *
	 * @param configGr: the config_getParamBagForPostProcessExtension record. null is not allowed
	 * @param languageXResult: the result from LanguageX. Null is not allowed.
	 */
	processPostProcessExtension: function(languageXResult) {

		if (gs.nil(languageXResult)) {
			this.LOGGER.warn('the result from LanguageX is null. Stopped processing post-process extension');
			return;
		}

		//Execute the post processing extension point.
		var extResponse;

		try {
			extResponse = this._executePostProcessingExtension(languageXResult.payload);
		} catch(e) {
			this.LOGGER.warn("An error occurred while executing post-process extension:{0}, payload:{1}",
				configGr.post_processing_extension.script_include.name, JSON.stringify(languageXResult.payload));

			return;
		}

		//post-process extension is not registered or inactive.
		if (gs.nil(extResponse))
			return;

		if(gs.nil(extResponse.status == AutoResolutionConstants.STATUS_ERROR)) {
			this.LOGGER.warn("An error occurred while executing post-process extension:{0}, message:{1}, payload:{1}",
				configGr.post_processing_extension.script_include.name, extResponse.message, JSON.stringify(languageXResult.payload));

			return;
		}

		// Update the prediction record with the result from the extension point
		var predictionGr = new GlideRecord(AutoResolutionConstants.PREDICTION_TABLE_NAME);

		if (!predictionGr.get(languageXResult.prediction_id)) {
			this.LOGGER.warn("Could not find the prediction record with the sys_id:{0}, Composite result:{1}",
				languageXResult.prediction_id, JSON.stringify(languageXResult.payload));
			return;
		}
		
		this._updatePredictionResults(extResponse, languageXResult);
	},
	
	/**
	* Update prediction table from the languageX result and post extension 
	*/
	_updatePredictionResults :function(extResponse, languageXResult) {
		
		if (gs.nil(extResponse.result) || extResponse.result.length == 0)
			return;
		
		var payload = languageXResult.payload;
		
		var fieldMap = extResponse.result[0]; // note that currenlty, only the first array is supported.
				
		if (gs.nil(fieldMap['predicted_language'])) {
			// if the output of the extension point does not contain the predicted language, then get the detected language from the payload
			
			// find the array of outputs with languageDetection from the languageX result.
			var langOutputs 
				= AutoResolutionLanguageXHelper.getOutputsByServiceName(
					payload, AutoResolutionConstants.LANGUAGE_DETECTION_SERVICE_NAME, this.LOGGER);
		
			// update the detected language
			var langOutput = langOutputs[0]; // note that currently, only the first array is supported.
			fieldMap['predicted_language'] = gs.nil(langOutput.serviceOutput)? '' : langOutput.serviceOutput;  
		}

		// if the output of the extension point does not contain the search queries,
		// then pass the values from prediction fields set on the IAR Configuration
		if (gs.nil(fieldMap['predicted_search_query'])) {

			// Get the field names from the passed task table. These fields will be used for the LanguageX input
			var taskFieldNames = global.AutoResolutionUtil.getTaskTableFieldNamesForARPredictionInput(this.taskGr.getTableName());

			var searchInput = "";

			for (var i=0; i<taskFieldNames.length; i++) {
				fieldName = taskFieldNames[i];
				fieldValue = this.taskGr.getValue(fieldName);

				if (!gs.nil(fieldValue))
					searchInput += fieldValue;
			}

			fieldMap['predicted_search_query'] = searchInput; // concatenation of the values from selected prediction fields
		}
		
		// update the prediction results.
		global.AutoResolutionPredictionHelper.updatePredictionResults(languageXResult.prediction_id, fieldMap, this.LOGGER);
	},
	
	
	/**
	 * Executes post-processing extension point if found.
	 * @param configGr
	 * @param languageXResult : the result from LanguageX API
	 * @return null if no pre-processing script is not found or error happened
	 */
	_executePostProcessingExtension: function(languageXResult) {

		var scriptSysId = this._getExtensionScriptSysId(AutoResolutionConstants.POST_PROCESSING_EXT_POINT_FIELD_NAME);

		if (gs.nil(scriptSysId)) {
			this.LOGGER.info("Auto-Resolution Configuration doesn't have post-processing extension script associated with it");
			return null;
		}

		// get the param bag_getParamBagForPreProcessExtension
		var paramBag = this._getParamBagForPostProcessExtension(languageXResult);

		// execute the script with the param bag
		return this.executeExtensionScript(scriptSysId, paramBag);
	},

	/**
	 * Returns the pre/post extension script Sys Id
	 * @return null if not found
	 */
	_getExtensionScriptSysId: function(fieldName) {

		// Get the ref to the extension instance record
		var extInstanceRef = this.configGr[fieldName];

		if (gs.nil(extInstanceRef)) {
			this.LOGGER.info('{0} is not set for {1}. Stopped executing the extension', fieldName, this.configId);
			return null;
		}

		var scriptRef = extInstanceRef['script_include'];

		if (gs.nil(scriptRef)) {
			this.LOGGER.info('Extension Point:{0} has no associated script for {1}. Stopped executing the extension', extInstanceRef.point, fieldName);
			return null;
		}

		if (!extInstanceRef.active) {
			this.LOGGER.info('Extension Point:{0} : {1} is currently inactive. Stopped executing the extension', extInstanceRef.point, scriptRef.name);
			return null;
		}

		return scriptRef.sys_id;
	},

	/**
	 * Executes script include that is associated with the extension point
	 *
	 * @param scriptSysId : the associated script sysId
	 * @param paramBag : the parameter bag to be passed to the pre / post extension script
	 * @return null if scirpt is not found.
	 */
	executeExtensionScript: function(scriptSysId, paramBag) {

		var scriptGr = new GlideRecord('sys_script_include');

		if (!scriptGr.get(scriptSysId)) {
			this.LOGGER.error("Could not find the associated script with sys_id:{0} for pre / post extension ", scriptSysId);
			return null;
		}

		// execute the script.
		try {
			var gse = new GlideScopedEvaluator(scriptGr);
			var obj = gse.evaluateScript(scriptGr);

			return obj.process(this.LOGGER, paramBag);
		} catch(e) {
			this.LOGGER.error("An error occurred while executing the extension script: [{0}]. parameterBag:{1}, error:{2}",
				scriptGr.getValue('name'), JSON.stringify(paramBag), e);
			throw e;
		}
	},

	/**
	 * Returns the parameter bag for the pre-process extension
	 * @param configGr : the config record
	 * @param taskGr :the task record
	 * @return a new parameter bag
	 */
	_getParamBagForPreProcessExtension: function() {
		var res = {};
		res.ar_config_id = this.configId;
		res.task_table_name = this.taskGr.getTableName();
		res.task_sys_id = this.taskId;
		return res;
	},

	/**
	 * Returns the parameter bag for the post-processing
	 * @param configGr: the config record
	 * @param languageXResult: the languageX result in json format
	 * @return the parameter bag
	 */
	_getParamBagForPostProcessExtension: function(languageXResult) {
		var res = {};
		res.ar_config_id = this.configId;
		res.language_x_result = languageXResult;
		return res;
	},

	type: 'AutoResolutionLanguageXStage'
});
