var VAAISearchFeedbackHelper = Class.create();

/**
 * Creates a feedback payload for user feedback. 
 */
VAAISearchFeedbackHelper.createUserFeedbackPayload = function(resultType, searchMetaData, searchResult, vaSystem, vaInputs, vaVars, index) {

    var payload = {};

    // This conversation query id should be set in AI Search topic
    payload.conversation_query_id = (!gs.nil(vaVars) && !gs.nil(vaVars.conversation_query_id) ? vaVars.conversation_query_id : '');

    // This should be either AISearchConstants.RESULT_TYPE_GENIUS || AISearchConstants.RESULT_TYPE_SEARCH
    payload.search_result_type = resultType;

    // This is the number of turns for multi-turn QnA
    payload.num_of_turns = !gs.nil(vaVars) && !gs.nil(vaVars.num_of_turns) ? parseInt(vaVars.num_of_turns) : 0;

    // payload for glide signals. Payload should look like this - 
    /** 
   		{
			"conversation_query_id": "",
			"search_result_type": "GENIUS",
			"num_of_turns": 2,
			"glide_signals": {
				"positive_feedback": {
					"userId": "6816f79cc0a8016401c5a33be04be441",
					"sessionId": "1C01BB50537131105400DDEEFF7B120C",
					"applicationId": "global",
					"applicationType": "AISearchApplication",
					"searchProfile": "3a33973653211010a813ddeeff7b125a",
					"searchContextConfigId": "2963a5fa530020103296ddeeff7b129f",
					"queryTerm": "iphone",
					"resultSysId": "1be1b873eb370110506f7558b55228ef",
					"labelDescription": "iPhone 6s",
					"sourceTable": "sc_cat_item",
					"cardType": "card_type",
					"actionType": "VA_Feedback",
					"actionId": "b709e729537020103296ddeeff7b123b",
					"aisDocId": "sc_cat_item_1be1b873eb370110506f7558b55228ef",
					"actionValue": "Helpful",
					"matchedIntentsPerSource": ""
				},
				"negative_feedback": {
					"userId": "6816f79cc0a8016401c5a33be04be441",
					"sessionId": "1C01BB50537131105400DDEEFF7B120C",
					"applicationId": "global",
					"applicationType": "AISearchApplication",
					"searchProfile": "3a33973653211010a813ddeeff7b125a",
					"searchContextConfigId": "2963a5fa530020103296ddeeff7b129f",
					"queryTerm": "iphone",
					"resultSysId": "1be1b873eb370110506f7558b55228ef",
					"labelDescription": "iPhone 6s",
					"sourceTable": "sc_cat_item",
					"cardType": "card_type",
					"actionType": "VA_Feedback",
					"actionId": "b709e729537020103296ddeeff7b123b",
					"aisDocId": "sc_cat_item_1be1b873eb370110506f7558b55228ef",
					"actionValue": " Not Helpful",
				"matchedIntentsPerSource": ""
    			},
				"neutral_feedback": {
					"userId": "6816f79cc0a8016401c5a33be04be441",
					"sessionId": "1C01BB50537131105400DDEEFF7B120C",
					"applicationId": "global",
					"applicationType": "AISearchApplication",
					"searchProfile": "3a33973653211010a813ddeeff7b125a",
					"searchContextConfigId": "2963a5fa530020103296ddeeff7b129f",
					"queryTerm": "iphone",
					"resultSysId": "1be1b873eb370110506f7558b55228ef",
					"labelDescription": "iPhone 6s",
					"sourceTable": "sc_cat_item",
					"cardType": "card_type",
					"actionType": "VA_Feedback",
					"actionId": "b709e729537020103296ddeeff7b123b",
					"aisDocId": "sc_cat_item_1be1b873eb370110506f7558b55228ef",
					"actionValue": "IGNORED",
				"matchedIntentsPerSource": ""
    			}
  			}
		}
	**/

    // User feedback payload for GlideSignals need to contain both positive and negative payloads.
    // The user will see the feedback button after the card gets generated.
    // We don't know what the user will click, thus, both feedback payloads need to exist
    // when the user's input is known, the right feedback type will be picked and sent to GlideSignals.

    var glideSgnalPayload = payload.glide_signals = {};
    var collector = null;

    if (resultType == global.AISearchConstants.RESULT_TYPE_GENIUS) {

        // Note: feedback is supported only for Genius search
        collector = new VAAIGeniusResultFeedbackMetricCollector(searchMetaData, vaSystem, vaInputs, vaVars, global.AISearchConstants.FEEDBACK_VALUE_HELPFUL);

        // create a payload for the positive feedback
        collector.collect(searchResult, index);

        glideSgnalPayload.positive_feedback = collector.getGlideSignalsPayload();

        // create a payload for the negative feedback
        collector = new VAAIGeniusResultFeedbackMetricCollector(searchMetaData, vaSystem, vaInputs, vaVars, global.AISearchConstants.FEEDBACK_VALUE_NOT_HELPFUL);
        collector.collect(searchResult, index);

        glideSgnalPayload.negative_feedback = collector.getGlideSignalsPayload();

        // create a payload for the neutral feedback
        collector = new VAAIGeniusResultFeedbackMetricCollector(searchMetaData, vaSystem, vaInputs, vaVars, global.AISearchConstants.FEEDBACK_VALUE_IGNORED);
        collector.collect(searchResult, index);

        glideSgnalPayload.neutral_feedback = collector.getGlideSignalsPayload();

    } else if (resultType == global.AISearchConstants.RESULT_TYPE_SEARCH) {


        // Note: feedback is supported only for Genius search
        collector = new VAAISearchResultFeedbackEventMetricCollector(searchMetaData, vaSystem, vaInputs, vaVars, global.AISearchConstants.FEEDBACK_VALUE_HELPFUL);

        // create a payload for the positive feedback
        collector.collect(searchResult, index);

        glideSgnalPayload.positive_feedback = collector.getGlideSignalsPayload();

        // create a payload for the negative feedback
        collector = new VAAISearchResultFeedbackEventMetricCollector(searchMetaData, vaSystem, vaInputs, vaVars, global.AISearchConstants.FEEDBACK_VALUE_NOT_HELPFUL);
        collector.collect(searchResult, index);

        glideSgnalPayload.negative_feedback = collector.getGlideSignalsPayload();

        // create a payload for the neutral feedback
        collector = new VAAISearchResultFeedbackEventMetricCollector(searchMetaData, vaSystem, vaInputs, vaVars, global.AISearchConstants.FEEDBACK_VALUE_IGNORED);
        collector.collect(searchResult, index);

        glideSgnalPayload.neutral_feedback = collector.getGlideSignalsPayload();
    }
    return payload;
};

/**
 * Returns the feedback payload found by message Id
 * @return null if not found.
 */
VAAISearchFeedbackHelper.getAISFeedbackPayloadByMessageId = function(messageId) {

    var gr = new GlideRecord(global.AISearchConstants.MESSAGE_TABLE_NAME);
    return gr.get(messageId) ? global.VAAISearchFeedbackHelper.getAISFeedbackPayloadByRecord(gr) : null;
};

/**
 * Returns the feedback payload from the passed GlideRecord
 * @return null if not found.
 */
VAAISearchFeedbackHelper.getAISFeedbackPayloadByRecord = function(recordGr) {

    if (gs.nil(recordGr))
        throw "Record must exist";

    var feedbackPayload = recordGr.getValue('ais_feedback_payload');

    return !gs.nil(feedbackPayload) ? JSON.parse(feedbackPayload) : null;
};

function getFeedbackPayloadFromMultipleFeedbacks(feedbackValue, feedbackPayload, cardIndex) {
    var payload = feedbackPayload.glide_signals.multiple_feedbacks[cardIndex];
	
	if (gs.nil(payload))
		return payload;

	var payloadStr = JSON.stringify(payload);
	var actionValue = getGlidesignalsActionValueFor(feedbackValue);

	payloadStr = payloadStr.replace("${actionValue}", actionValue);
	
    return JSON.parse(payloadStr);
}

function getFeedbackPayloadFromSynthesizedFeedback(feedbackValue, feedbackPayload) {
    var payload = feedbackPayload.glide_signals.synthesized_feedback;
	
	if (gs.nil(payload))
		return payload;

	var payloadStr = JSON.stringify(payload);
	var actionValue = getGlidesignalsActionValueFor(feedbackValue);

	payloadStr = payloadStr.replace("${actionValue}", actionValue);
	
    return JSON.parse(payloadStr);
}

/**
 * Find the mapped actionValue for the given feedback value.
 */
function getGlidesignalsActionValueFor(feedbackValue) {
	// currently, we're supporting only two feedback types.
    if (feedbackValue.toLowerCase() == global.AISearchConstants.USER_FEEDBACK_VALUE_HELPFUL)
        return global.AISearchConstants.FEEDBACK_VALUE_HELPFUL;
    else if (feedbackValue.toLowerCase() == global.AISearchConstants.USER_FEEDBACK_VALUE_NOT_HELPFUL)
        return global.AISearchConstants.FEEDBACK_VALUE_NOT_HELPFUL;
    else if (feedbackValue.toLowerCase() == global.AISearchConstants.USER_FEEDBACK_VALUE_IGNORED)
        // if the user feedback value is ignored , don't send it.
    return null;
}

/**
 * Send user feedback to glide signals and process deflection logs for the carousel
 */
VAAISearchFeedbackHelper.handleMultipleFeedbacks = function(feedbackValue, feedbackPayload, cardIndex, messageId) {
    VAAISearchFeedbackHelper.sendFeedbackToGlideSignalsAPIForCarousel(feedbackValue, feedbackPayload, cardIndex);
    VAAISearchFeedbackHelper.processDeflectionLogForCarousel(feedbackValue, feedbackPayload, cardIndex, messageId);
};

/**
 * Send user feedback to glide signals and process deflection logs for a single card
 */
VAAISearchFeedbackHelper.handleSingleFeedback = function(feedbackValue, feedbackPayload, messageId) {
    VAAISearchFeedbackHelper.sendFeedbackToGlideSignalsAPI(feedbackValue, feedbackPayload);
    VAAISearchFeedbackHelper.processDeflectionLog(feedbackValue, feedbackPayload, messageId);
};

/**
 * Process deflection logs for synthesized result
 */
VAAISearchFeedbackHelper.handleSynthesizedFeedback = function(feedbackValue, feedbackPayload, messageId, nowAssistGranularFeedback) {
	VAAISearchFeedbackHelper.sendFeedbackToGlideSignalsAPIForSynthesized(feedbackValue, feedbackPayload);
    VAAISearchFeedbackHelper.processDeflectionLogForSynthesizedResult(feedbackValue, feedbackPayload, messageId);
	VAAISearchFeedbackHelper.saveMessageForCIAnalytics(feedbackValue, feedbackPayload, messageId, nowAssistGranularFeedback);
};

/**
 * Process granular feedback for execution
 */
VAAISearchFeedbackHelper.handleExecutionFeedback = function(feedbackValue, messageId, nowAssistGranularFeedback) {
	VAAISearchFeedbackHelper.processDeflectionLogForExecution(feedbackValue, messageId, nowAssistGranularFeedback);
	VAAISearchFeedbackHelper.saveMessageForCIAnalytics(feedbackValue, null, messageId, nowAssistGranularFeedback);
};

/**
 * Send the payload to glide signals based on user's feedback for the carousel
 */
VAAISearchFeedbackHelper.sendFeedbackToGlideSignalsAPIForCarousel = function(feedbackValue, feedbackPayload, cardIndex) {
    if (gs.nil(feedbackValue) || gs.nil(feedbackPayload)) {
        gs.warn("feedback value or feedbackPayload is null");
        return;
    }

    var payload = getFeedbackPayloadFromMultipleFeedbacks(feedbackValue, feedbackPayload, cardIndex);

    if (gs.nil(payload)) {
      gs.info("Feedback for GlideSignals must exist");
      return;
    }

    // if can't send the payload to GlideSignals, don't send it.
    if (!VAAISearchFeedbackHelper.canSendPayloadToGlideSignals(feedbackPayload))
        return;

    _sendFeedbackToGlideSignalsAPI(payload);
};

/**
 * Send the payload to glide signals based on user's feedback for the synthesized response
 */
VAAISearchFeedbackHelper.sendFeedbackToGlideSignalsAPIForSynthesized = function(feedbackValue, feedbackPayload) {
    if (gs.nil(feedbackValue) || gs.nil(feedbackPayload)) {
        gs.warn("feedback value or feedbackPayload is null");
        return;
    }

    var payload = getFeedbackPayloadFromSynthesizedFeedback(feedbackValue, feedbackPayload);

    if (gs.nil(payload)) {
      gs.info("Feedback for GlideSignals must exist");
      return;
    }

    // if can't send the payload to GlideSignals, don't send it.
    if (!VAAISearchFeedbackHelper.canSendPayloadToGlideSignals(feedbackPayload))
        return;

    _sendFeedbackToGlideSignalsAPI(payload);
};


/**
 * Send the payload to glide signals based on user's feedback for a single card
 */
VAAISearchFeedbackHelper.sendFeedbackToGlideSignalsAPI = function(feedbackValue, feedbackPayload) {

    if (gs.nil(feedbackValue) || gs.nil(feedbackPayload)) {
        gs.warn("feedback value or feedbackPayload is null");
        return;
    }

    var payload = null;

    // currently, we're supporting only two feedback types.
    if (feedbackValue.toLowerCase() == global.AISearchConstants.USER_FEEDBACK_VALUE_HELPFUL)
        payload = getPositiveFeedbackPayload(feedbackPayload);
    else if (feedbackValue.toLowerCase() == global.AISearchConstants.USER_FEEDBACK_VALUE_NOT_HELPFUL)
        payload = getNegativeFeedbackPayload(feedbackPayload);
    else if (feedbackValue.toLowerCase() == global.AISearchConstants.USER_FEEDBACK_VALUE_IGNORED)
        // if the user feedback value is ignored , don't send it.
        return;

    if (gs.nil(payload)) {
      gs.info("Feedback for GlideSignals must exist");
      return;
    }

    // if can't send the payload to GlideSignals, don't send it.
    if (!VAAISearchFeedbackHelper.canSendPayloadToGlideSignals(feedbackPayload))
        return;

    _sendFeedbackToGlideSignalsAPI(payload);
};

function _sendFeedbackToGlideSignalsAPI(payload) {
    try {
        new global.GlideSignalsService().trackEventAsync(global.AISearchConstants.RESULT_EVENT_TYPE_GENIUS, "INFO", payload);
    } catch (err) {
        gs.error("Sending the payload to GlideSignals API failed: payload: {0} detail:{1}", JSON.stringify(payload), err);
    }
}

/**
 * Tests if the given payload can be sent to GlideSignals API for feedback
 */
VAAISearchFeedbackHelper.canSendPayloadToGlideSignals = function(feedbackPayload) {

    if (gs.nil(feedbackPayload))
        return false;

    var resultType = feedbackPayload.search_result_type;
    return !gs.nil(resultType) && (resultType == global.AISearchConstants.RESULT_TYPE_GENIUS);
};

/**
 * Tests if user feedback needs to be enabled or not.
 */
VAAISearchFeedbackHelper.needUserFeedback = function(vaSystem, vaInputs, vaVars) {

    if (gs.nil(vaVars)) {
        gs.error("The parameter - vaVars can not be null but it is null now");
        return false;
    }

    return !gs.nil(vaVars) && (vaVars.need_user_feedback === 'true' || vaVars.need_user_feedback === true);
};

VAAISearchFeedbackHelper.processDeflectionLogForSynthesizedResult = function(feedbackValue, feedbackPayload, messageId) {
    _processDeflectionLog(feedbackPayload, feedbackValue, {}, messageId);
};

VAAISearchFeedbackHelper.processDeflectionLogForExecution = function(feedbackValue, messageId, nowAssistGranularFeedback) {
    _processDeflectionLogForExecution(feedbackValue, messageId, nowAssistGranularFeedback);
};

VAAISearchFeedbackHelper.processDeflectionLogForCarousel = function(feedbackValue, feedbackPayload, cardIndex, messageId) {
    var payload = getFeedbackPayloadFromMultipleFeedbacks(feedbackValue, feedbackPayload, cardIndex);

    if (gs.nil(payload)) {
      gs.info("Feedback for GlideSignals must exist");
      return;
    }

    _processDeflectionLog(feedbackPayload, feedbackValue, payload, messageId);
};

VAAISearchFeedbackHelper.processDeflectionLog = function(feedbackValue, feedbackPayload, messageId) {
    var payload = null;

    // currently, we're supporting three feedback types.
    if (feedbackValue.toLowerCase() == global.AISearchConstants.USER_FEEDBACK_VALUE_HELPFUL)
        payload = getPositiveFeedbackPayload(feedbackPayload);
    else if (feedbackValue.toLowerCase() == global.AISearchConstants.USER_FEEDBACK_VALUE_NOT_HELPFUL)
        payload = getNegativeFeedbackPayload(feedbackPayload);
    else if (feedbackValue.toLowerCase() == global.AISearchConstants.USER_FEEDBACK_VALUE_IGNORED)
        payload = getNeutralFeedbackPayload(feedbackPayload);


    if (gs.nil(payload))
        throw "Feedback for Deflection logs must exist";

    _processDeflectionLog(feedbackPayload, feedbackValue, payload, messageId);
};

/**
 * Sends the feedback block to sys_ci_analytics table.
 */
VAAISearchFeedbackHelper.saveMessageForCIAnalytics = function(feedbackValue, feedbackPayload, messageId, nowAssistGranularFeedback) {

	var conversationId;

	if (!gs.nil(feedbackPayload)) 
		conversationId = feedbackPayload.conversation_id;
	else if (!gs.nil(nowAssistGranularFeedback)) 
		conversationId = nowAssistGranularFeedback.runtime_context.conversation_id;

	// for backward compatibility for upgrade case.
	if (gs.nil(conversationId))
		return;
	
	// this search Id is the correlation id.
	var searchId;
	if (!gs.nil(feedbackPayload))
		searchId = feedbackPayload.search_id;

	var deflectionLogId;

	if (!gs.nil(feedbackPayload)) {
		deflectionLogId = feedbackPayload.deflection_log_id;
    }
	else if (!gs.nil(nowAssistGranularFeedback) && !gs.nil(nowAssistGranularFeedback.runtime_context)) {
		deflectionLogId = nowAssistGranularFeedback.runtime_context.deflection_log_id;
    }
	
	var payload = {};
	var logName = "Feedback"; // can be anything

	if (!gs.nil(searchId))
		payload[global.VAClickMetricsConstants.KEY_SEARCH_ID] = searchId;
	
	payload[global.VAClickMetricsConstants.KEY_NAME] = global.VAClickMetricsConstants.VALUE_FEEDBACK;
	payload[global.VAClickMetricsConstants.KEY_DEFLECTION_LOG_ID] = deflectionLogId;
	payload[global.VAClickMetricsConstants.KEY_FEEDBACK_VALUE] = feedbackValue;
	payload[global.VAClickMetricsConstants.KEY_TIME] = new GlideDateTime().getDisplayValue();
	
    var baseGroupType = "Events";
	var groupTypeSuffix = "feedback";

	if (!gs.nil(nowAssistGranularFeedback)) {
		
		payload[global.VAClickMetricsConstants.KEY_GRANULAR_FEEDBACK_COMMENTS] = nowAssistGranularFeedback.comments;
		payload[global.VAClickMetricsConstants.KEY_GRANULAR_FEEDBACK_ANSWERS] =  JSON.stringify(nowAssistGranularFeedback.selectedQuestions);
		
		// if questions are present, add message bundle Id, too
		if (nowAssistGranularFeedback.selectedQuestions.length>0)
			payload[global.VAClickMetricsConstants.KEY_MESSAGE_BUNDLE_ID] = nowAssistGranularFeedback.messageBundleId;
		
		// if found, update the group type suffix
		if (!gs.nil(payload[global.VAClickMetricsConstants.KEY_GRANULAR_FEEDBACK_ANSWERS]) || !gs.nil(payload[global.VAClickMetricsConstants.KEY_GRANULAR_FEEDBACK_COMMENTS]))
			groupTypeSuffix = "granular_feedback";

		payload[global.VAClickMetricsConstants.KEY_MESSAGE_ID] =  messageId;

		var runTimeContext = nowAssistGranularFeedback.runtime_context;
		
		if (!gs.nil(runTimeContext)) {
			
			if (gs.nil(feedbackPayload) && !gs.nil(runTimeContext.search_term)) 
				payload[global.VAClickMetricsConstants.KEY_SEARCH_TERM] = runTimeContext.search_term;
			
			if (!gs.nil(runTimeContext.gen_ai_log_id))
				payload[global.VAClickMetricsConstants.KEY_GEN_AI_LOG_ID] = runTimeContext.gen_ai_log_id;

			if (!gs.nil(runTimeContext.aia_execution_plan))	
				payload[global.VAClickMetricsConstants.KEY_AIA_AGENT_EXECUTION_PLAN] = runTimeContext.aia_execution_plan;

			if (!gs.nil(runTimeContext.mosaic_llm_invocation_id))	
				payload[global.VAClickMetricsConstants.KEY_MOSAIC_LLM_INVOCATION_ID] = runTimeContext.mosaic_llm_invocation_id;

			if (!gs.nil(runTimeContext.experience))	
				payload[global.VAClickMetricsConstants.KEY_EXPERIENCE] = runTimeContext.experience;

		}
	}
	
    var newGroupType =  baseGroupType + ":" + groupTypeSuffix; 
    // send the feedback payload to the sys_ci_analytics.
	sn_cs.VASystemObject.addCustomCIAnalyticGroupEvent(conversationId, logName, JSON.stringify(payload), newGroupType);
};

function _processDeflectionLog(feedbackPayload, feedbackValue, payload, messageId) {

	// check if feedback can update the deflection log or not.
	try {
		var result = sn_nowassist_va.NowAssistDeflectionLogHelper.canFeedbackUpdateDeflection();	
		gs.info("Deflection: Checking if the feedback can update the deflection log:"+result);

		if (!result)
			return;
			
	}catch(error) {
		//Unexpected error happened. Log the issue and continue. This is most likely the app version issue
		gs.info("Unexpected error occurred while checking the system property for feedback and deflection. Details:"+error);
	}


    var feedbackState = {
        'accepted': global.AISearchConstants.DEFLECTION_STATUS_RESOLVED,
        'rejected': global.AISearchConstants.DEFLECTION_STATUS_NOT_RESOLVED,
        'ignored': global.AISearchConstants.DEFLECTION_STATUS_NOT_RESOLVED
    };

	var fieldValueMap = {};
	var deflectionLogId = feedbackPayload["deflection_log_id"];
    
	fieldValueMap.state = feedbackState[feedbackValue.toLowerCase()];
    fieldValueMap.resource_id = gs.nil(payload.resultSysId) ? messageId : payload.resultSysId;
    fieldValueMap.resource_table = gs.nil(payload.sourceTable) ? "sys_cs_message" : payload.sourceTable;
    fieldValueMap.num_of_turns = feedbackPayload["num_of_turns"];
	fieldValueMap.output_type = feedbackPayload["output_type"];
	fieldValueMap.message_id = fieldValueMap.resource_id;

	fieldValueMap.deflection_type = global.NowAssistDeflectionLogHelper.getDeflectionType (fieldValueMap.resource_table, fieldValueMap.output_type);

	global.NowAssistDeflectionLogHelper.updateDeflectionLogWithFieldMap(deflectionLogId, fieldValueMap);
}

function _processDeflectionLogForExecution(feedbackValue, messageId, nowAssistGranularFeedback) {


    // if now assist granular feedback is not found, can't proceed.
    if (gs.nil(nowAssistGranularFeedback)) {
		gs.error("Now Assist Granular Feedback is not found while processing feedback for the deflection log: messageId:{0}", messageId);  
        return;
    }
    
	// check if feedback can update the deflection log or not.
	try {
		var result = sn_nowassist_va.NowAssistDeflectionLogHelper.canFeedbackUpdateDeflection();	
		gs.info("Deflection: Checking if the feedback can update the deflection log:"+result);

		if (!result)
			return;

	}catch(error) {
		//Unexpected error happened. Log the issue and continue. This is most likely the app version issue
		gs.info("Unexpected error occurred while checking the system property for feedback and deflection. Details:"+error);
	}

    var runtimeContext = nowAssistGranularFeedback.runtime_context;
	var deflectionLogId = runtimeContext["deflection_log_id"];

	if (gs.nil(deflectionLogId)) {
		gs.info("Deflection Log is not found for the feedback with messageId:{0}. Deflection log won't be updated with the feedback", messageId);
		// nothing can be done if deflectionLogId is not available.
		return;
	}

    var feedbackState = {
        'accepted': global.AISearchConstants.DEFLECTION_STATUS_RESOLVED,
        'rejected': global.AISearchConstants.DEFLECTION_STATUS_NOT_RESOLVED,
        'ignored': global.AISearchConstants.DEFLECTION_STATUS_RESOLVED
    };

	var fieldValueMap = {};
    
    var state = feedbackState[feedbackValue.toLowerCase()];

    if (gs.nil(state)) {
	    fieldValueMap.state = state; 
	    fieldValueMap.message_id = runtimeContext.message_id;
	    global.NowAssistDeflectionLogHelper.updateDeflectionLogWithFieldMap(deflectionLogId, fieldValueMap);
    }
}

function getPositiveFeedbackPayload(entirePayload) {
    return entirePayload.glide_signals.positive_feedback;
}

function getNegativeFeedbackPayload(entirePayload) {
    return entirePayload.glide_signals.negative_feedback;
}

function getNeutralFeedbackPayload(entirePayload) {
    return entirePayload.glide_signals.neutral_feedback;
}
