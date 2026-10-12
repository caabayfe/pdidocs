var AutoResolutionPredictionHelper = Class.create();
AutoResolutionPredictionHelper.prototype = {
	initialize: function(configId, notificationUserId) {
		this.configId = configId;
		this.notificationUserId = notificationUserId;
	},

	/**
	 * @param intents - list of intent maps returned by predictAPI
	 * @return {intents: [], nluIntent: , matchedTopic: , intentTopicState: , intentTopicStateReason: , predictionConfidence: }
	 **/
	getIntentAndTopicDetails: function(intents) {
		var returnObject = {intents: []};

		if (!gs.nil(intents) && JSON.stringify(intents) !== '{}' && intents.length > 0) {
			returnObject.intents = intents;
			var objs = [];

			//For Q consider only the Top-1 intent
			var intent = returnObject.intents[0];
			var nluIntent = intent['predictedValue'];
			returnObject.predictionConfidence = intent['confidence'];

			if (nluIntent) {
				if (this._isIntentUnsupported(nluIntent)) {
					returnObject.nluIntent = nluIntent;
					returnObject.matchedTopic = '';
					returnObject.intentTopicState = AutoResolutionConstants.INTENT_TOPIC_STATE['NO_MATCHED_TOPIC'];
					returnObject.intentTopicStateReason = AutoResolutionConstants.NO_MATCHED_TOPIC_REASON['UNSUPPORTED_INTENT'];
					return returnObject;
				}

				return this.processIntent(nluIntent);
			}
		}
		
		// case when no intents are returned from the predictAPI
		returnObject.nluIntent = '';
		returnObject.matchedTopic = '';
		returnObject.intentTopicState = AutoResolutionConstants.INTENT_TOPIC_STATE['NO_INTENT']; 
		returnObject.intentTopicStateReason = AutoResolutionConstants.NO_INTENT_REASON['NO_INTENT_FROM_API'];
		return returnObject;
	},

	/**
	 *
	 * @param intent - String name of a valid intent
	 * @returns {{"nluIntent": string, "matchedTopic": string, 
	 *     "intentTopicState": string, "intentTopicStateReason": string}}
	 */
	processIntent: function(intent) {
		var intentTopicRetObj = this.getMatchedTopicFromIntentMapTable(intent);
		if (!intentTopicRetObj.intentExists)
			return {
				nluIntent: intent,
				matchedTopic: '',
				intentTopicState: AutoResolutionConstants.INTENT_TOPIC_STATE['NO_INTENT'],
				intentTopicStateReason: AutoResolutionConstants.NO_INTENT_REASON['NO_INTENT_TOPIC_MAPPING'],
			};

		var matchedTopicId = intentTopicRetObj.matchedTopicSysId;
		var isTopicActive = this._isTopicActive(matchedTopicId);
		var isIntentTopicMapActive = intentTopicRetObj.activeIntentMap === '1';
		var isTopicAccessible = this._isTopicAccessible(matchedTopicId);
		
		// Issue Auto-Resolution topic
		var isIARWrapperTopicAccessible = this._isTopicAccessible('86cf6a4e5316101055eeddeeff7b12ba');

		var intentAndTopicDetails = {
			nluIntent: intent,
			matchedTopic: '',
			intentTopicState: AutoResolutionConstants.INTENT_TOPIC_STATE['FOUND_MATCHED_TOPIC'],
			intentTopicStateReason: '',
		};
		
		if (!isIntentTopicMapActive)
			intentAndTopicDetails.intentTopicStateReason = AutoResolutionConstants.NO_MATCHED_TOPIC_REASON['INTENT_TOPIC_MAP_INACTIVE'];
		else if (!isTopicActive)
			intentAndTopicDetails.intentTopicStateReason = AutoResolutionConstants.NO_MATCHED_TOPIC_REASON['INACTIVE_TOPIC'];
		else if (!isTopicAccessible || !isIARWrapperTopicAccessible)
			intentAndTopicDetails.intentTopicStateReason = AutoResolutionConstants.NO_MATCHED_TOPIC_REASON['TOPIC_INACCESSIBLE'];
		else if (!gs.nil(matchedTopicId))
			intentAndTopicDetails.matchedTopic = matchedTopicId;
		
		return intentAndTopicDetails;
	},

	getMatchedTopicFromIntentMapTable: function(intent) {
		var intentMapRetObj = {};
		var intentTopicMapGr = new GlideRecord(AutoResolutionConstants.INTENT_TOPIC_MAP_TABLE_NAME);
		intentTopicMapGr.addQuery('ar_intent', intent);
		intentTopicMapGr.addQuery('ar_configuration', this.configId);
		intentTopicMapGr.query();
		if (intentTopicMapGr.next()) {
			intentMapRetObj.intentExists = true;
			intentMapRetObj.activeIntentMap = intentTopicMapGr.getValue('active');
			intentMapRetObj.matchedTopicSysId = intentTopicMapGr.getValue('matched_topic');
			return intentMapRetObj;
		}
		
		intentMapRetObj.intentExists = false;
		intentMapRetObj.matchedTopicSysId = '';
		return intentMapRetObj;
	},

	_isIntentUnsupported: function(nluIntent) {
		var intentArr = nluIntent.split(AutoResolutionConstants.UNSUPPORTED_MATCHED_INTENT_SEPARATOR);
		if (!gs.nil(intentArr) && intentArr.length > 0)
			return intentArr.indexOf(AutoResolutionConstants.UNSUPPORTED_INTENT_STRING) >= 0;
		
		return false;
	},

	_isTopicActive: function(topicId) {
		var grTopic = new GlideRecord('sys_cs_topic');
		grTopic.get(topicId);
		return grTopic.active;
	},
	
	_isTopicAccessible: function(topicId) {
		if (gs.nil(this.notificationUserId)) return true; // simulation
		
		var grTopic = new GlideRecord('sys_cs_topic');
		grTopic.get(topicId);
		var topicRoles = grTopic.roles + '';
		topicRoles = topicRoles.split(',');

		var notificationUser = gs.getUser().getUserByID(this.notificationUserId);
		var isGuestUser = notificationUser.name === 'guest';

		var hasRole = false;
		for (var i = 0; i < topicRoles.length; i++) {
			if (topicRoles[i] === 'public') {
				hasRole = true;
				break;
			}

			if (!isGuestUser && notificationUser.hasRole(topicRoles[i])) {
				hasRole = true;
				break;
			}
		}
		
		return hasRole;
	},
};

/**
* Processes the prediction results. This method creates one prediction record and output records.
*
* @param logger
* @param contextId
* @param solutionName
* @param languageXResult the languageX result in JSON format
*
*   eg: {
*  "schemaVersion": "1.0",
*  "status": {
*    "code": 200,
*    "message": "SUCCESS"
*  },
*  "result": [
*    {
*      "input": {
*         "id": "6e7e0ee577ac0110f14a24f1cd5a99c6",
*         "tableName": "sn_hr_core_case",
*         "fields": {
*            "description": "I lost access to benefits portal"
*         }
*      },
*      "output": [
*        {
*          "service": "languageDetection",
*          "serviceOutput": "en",
*          "serviceOutputScore": 0.9963439,
*          "serviceOutputDetails": ""
*        },
*        {
*          "service": "criticalityDetection",
*          "serviceOutput": "Benefits-NonCritical",
*          "serviceOutputScore": 0.94924694,
*          "serviceOutputDetails": "{\"status\":\"success\",\"response\":{\"utterance\":\"I lost access to benefits portal\",\"intents\":[{\"intentName\":\"Benefits-NonCritical\",\"nluModelName\":\"ml_x_snc_global_global_087ad49d1b9eb0101115da01b24bcb70\",\"score\":0.94924694,\"intents\":[]}],\"properties\":{\"inference.time\":\"12\",\"nluPlatformLanguage\":\"en\",\"nluPlatformVersion\":\"3.1.2-HYB\"}}}"
*        },
*        {
*          "service": "searchQueryGeneration",
*          "serviceOutput": "",
*          "serviceOutputScore": "",
*          "serviceOutputDetails": "[{\"query\":\"benefits portal\",\"score\":\"0.83\"},{\"query\":\"access\",\"score\":\"0.73\"}]"
*        }
*      ]
*    }
*  ]
*}
*
* @param execTime the time taken for language-X API invocation in millisecond
*/
AutoResolutionPredictionHelper.processPredictionResults = function(logger, contextId, solutionName, languageXResult, execTime) {
	
	if (gs.nil(languageXResult)) {
		// predictionResult should exist
		return createReturnObject( 
			AutoResolutionConstants.STATUS_ERROR, 
				'LanguageX prediction results are invalid or empty');
	}
	
	// create a prediction record
	var predictionSysId = createPredictionRecord(contextId, solutionName, languageXResult, execTime);
	
	var resultBlock = languageXResult.result;
	
	if (gs.nil(resultBlock) || resultBlock.length == 0 || gs.nil(resultBlock[0].output) || resultBlock[0].output.length == 0) {
		
		return createReturnObject( 
			AutoResolutionConstants.STATUS_ERROR, 
				"LanguageX prediction result's outputs are invalid or empty", 
					predictionSysId);
	}
	
	// an array of outputs
	var outputs = resultBlock[0].output;
	
	var outputSysIds = processPredictionOutputs(predictionSysId, outputs);
	
	//if the status code is not 200, report it back to the caller
	if (languageXResult.status.code != 200 ) {
		return createReturnObject(
			AutoResolutionConstants.STATUS_ERROR, languageXResult.message);
	}
	
	return createReturnObject(
			AutoResolutionConstants.STATUS_SUCCESS, 'Successfully saved LanguageX prediction results', 
				predictionSysId, outputSysIds);
};

/**
* Returns the prediction output object for the passed service. 
*
* The  service can be one of the following: global.AutoResolutionConstants.LANGUAGE_DETECTION_SERVICE_NAME , 
*                                           global.AutoResolutionConstants.CRITICALITY_PREDICTION_SERVICE_NAME, 
*                                           global.AutoResolutionConstants.SEARCH_QUERY_GENERATION_SERVICE_NAME
* 
* @param predictionSysId : the sysId of the prediction record
* @param service : the prediction service name that is available via LanguageX
* @return {AutoResolutionPredictionOutput} a prediction output instance. Null if not found
*/
AutoResolutionPredictionHelper.getPredictionOutputByService = function(predictionSysId, service) {
	
	var prediction = new global.AutoResolutionPrediction(predictionSysId);
	return prediction.getPredictionOutputByService(service);
};

/**
* Returns the prediction output object for Criticality Service
*
* @param predictionSysId : the sysId of the prediction record
* @return {AutoResolutionPredictionOutput} a prediction output instance. Null if not found
*/
AutoResolutionPredictionHelper.getPredictionOutputByCriticalityService = function(predictionSysId) {
	
	return global.AutoResolutionPredictionHelper.getPredictionOutputByService(
		predictionSysId, global.AutoResolutionConstants.CRITICALITY_PREDICTION_SERVICE_NAME);
};

/**
* Submits a feedback for the specified service
*
* The  service can be one of the following: global.AutoResolutionConstants.LANGUAGE_DETECTION_SERVICE_NAME , 
*                                           global.AutoResolutionConstants.CRITICALITY_PREDICTION_SERVICE_NAME, 
*                                           global.AutoResolutionConstants.SEARCH_QUERY_GENERATION_SERVICE_NAME
* @param predictionSysId : the sysId of the prediction record
* @param service : the prediction service name that is available via LanguageX
* @param feedback : the feedback to sent
* @return true if the submission succeeded. false, otherwise
*/
AutoResolutionPredictionHelper.submitFeedbackForService = function(predictionSysId, service, feedback) {
	
	var output = global.AutoResolutionPredictionHelper.getPredictionOutputByService(predictionSysId, service);
	
	if (gs.nil(output))
		return false;
	
	var result = output.submitFeedback(feedback);
	
	if(result)
		output.update();
	
	return result;
};

/**
* Submits a feedback for the specified service 
*
* @param predictionSysId : the sysId of the prediction record
* @param feedback : the feedback to sent
* @return true the submission succeeded. false, otherwise
*/
AutoResolutionPredictionHelper.submitFeedbackForCriticalityService = function(predictionSysId, feedback) {
	
	return global.AutoResolutionPredictionHelper.submitFeedbackForService(
		predictionSysId, global.AutoResolutionConstants.CRITICALITY_PREDICTION_SERVICE_NAME, feedback);
};

/**
 * Returns the search query from prediction table that is generated from LangX
 */
AutoResolutionPredictionHelper.getSearchQueryByPredictionId = function(predictionId) {
    var prediction = new global.AutoResolutionPrediction(predictionId);
    return prediction.getPredictedSearchQuery();
};

/**
 * Returns the search query from prediction table that is generated from LangX
 */
AutoResolutionPredictionHelper.getSearchQueryByContext = function(contextRecord) {
    return contextRecord.prediction.predicted_search_query || '';
};

/**
 * Returns the id of the prediction record given the id of the context
 * @param {string} The sys_id of the auto resolution context
 * @return {string} The sys_id of the prediction record
 */
AutoResolutionPredictionHelper.getPredictionId = function(contextId) {
	var predictionGr = new GlideRecord(global.AutoResolutionConstants.PREDICTION_TABLE_NAME);
	predictionGr.addQuery("ar_context", contextId);
	predictionGr.query();
	predictionGr.next();
	return predictionGr.getUniqueValue();
};


/**
* Updates the prediction table
*/
AutoResolutionPredictionHelper.updatePredictionResults = function(predictionSysId, fields, logger) {
	
	// Update the prediction record with the result from the extension point
	var predictionGr = new GlideRecord(global.AutoResolutionConstants.PREDICTION_TABLE_NAME);
		
	if (!predictionGr.get(predictionSysId)) {
		logger.error("Could not find the prediction record with the sys_id:{0}", predictionSysId);
		return;
	}
	
	var needToUpdate = false;
	
	for (var fieldName in fields) {
		predictionGr.setValue(fieldName, fields[fieldName]);
		needToUpdate = true;
	}
		
	predictionGr.update();
};

/**
* process prediction outputs
*/
function processPredictionOutputs(predictionSysId, outputs) {

	var arr = [];

	for (var i=0; i<outputs.length; i++)
		arr.push(AutoResolutionPredictionOutput.create(predictionSysId, outputs[i]));
	
	return arr;
}

/**
* Creates a return object for the passed inputs
*/
function createReturnObject( status, message, predictionId, outputIds ) {
	
	var res = {};
	
	if (!gs.nil(status))
		res.status = status;
	
	if (!gs.nil(message))
		res.message = message;
	
	if (!gs.nil(predictionId))
		res.prediction_id = predictionId;
	
	if (!gs.nil(outputIds) && outputIds.length > 0)
		res.output_ids =  outputIds;
	else
		res.output_ids = [];
	
	return res;
}

/**
* Creates a new precition record
*/
function createPredictionRecord(contextId, solutionName, predictionResult, execTime) {
	
	var gr = new GlideRecord(AutoResolutionConstants.PREDICTION_TABLE_NAME);
	
	gr.setValue('ar_context', contextId);
	gr.setValue('solution_name', solutionName);
	gr.setValue('schema_version', predictionResult.schemaVersion);
	gr.setValue('execution_time', execTime);
	gr.setValue('status_code', predictionResult.status.code);
	gr.setValue('status_message', predictionResult.status.message);
	
	// if no result found, just return.
	if(predictionResult.result.length == 0)
		gr.insert();
	
	// note that only the first element is supported.
	var firstResult = predictionResult.result[0]; 
	
	gr.setValue('task_table', firstResult.input.tableName);
	gr.setValue('task_id', firstResult.input.id);
	
	gr.setValue('input_fields', JSON.stringify(firstResult.input.fields));
	
	return gr.insert();
}
