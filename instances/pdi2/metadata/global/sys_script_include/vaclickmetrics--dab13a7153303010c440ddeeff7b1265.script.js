var VAClickMetrics = Class.create();

/**
* Creates a new click metrics URL for the given link
* @param vaSystem : VA runtime context object
* @param originalLink : the original link. This is the final destination the user will be redirected to.
* @param scrachPad : Any runtime info to be used when inserting attributes into the ETL table.
* @param eventType It should be one of "ai_search", "contextual_search" or "bot_output". 
*                   If omitted, VAClickMetricsConstants.EVENT_TYPE_BOT_OUTPUT will be used.
* @return a fully qualified Click Metrics URL 
*/
VAClickMetrics.createClickMetricsURL = function(vaSystem, originalLink, scratchPad, eventType) {

	if(gs.nil(vaSystem) || gs.nil(originalLink))
		throw 'Invalid input parmeters';
	
	var scratchPadStr = null;
	
	if(typeof scratchPad === 'string')
		scratchPadStr = scratchPad;	
	else 
		scratchPadStr = gs.nil(scratchPad) ? '' : JSON.stringify(scratchPad);
	
	return vaSystem.createClickMetricsURL(originalLink, scratchPadStr, eventType);
};

/**
* Fires an event for AI search 
* @param payload
*/
VAClickMetrics.queueAISearchEvent = function(conversationId, taskId, payload) {	
	VAClickMetrics.queueSearchEvent(conversationId, taskId, VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH, payload);
};

/**
* Fires an event for contextual search. 
* @param payload
*/
VAClickMetrics.queueContextualSearchEvent = function(conversationId, taskId, payload) {
	VAClickMetrics.queueSearchEvent(conversationId, taskId, VAClickMetricsConstants.EVENT_TYPE_CONTEXTUAL_SEARCH, payload);
};

/**
* Fires an event for search. The type of search can be either AI search or Contextual Search.
*
* @param eventType  Either VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH  or VAClickMetricsConstants.EVENT_TYPE_CONTEXTUAL_SEARCH
* @param payload
*/
VAClickMetrics.queueSearchEvent = function(conversationId, taskId, eventType, payload) {
	
	var logger = global.VAClickMetrics.getLogger(conversationId, taskId);
	
	if(gs.nil(eventType) || gs.nil(payload)) {
		logger.error('Event can not be fired. Invalid parameters');
		throw 'Invalid parameters';
	}
	
	var payloadObj;
	
	if (typeof payload ==='string') 
		payloadObj = JSON.parse(payload);
	else 
		payloadObj = payload;
	
	// add the current timestamp to the payload, so that this timestamp can be used when the event gets processed.
	payloadObj[global.VAClickMetricsConstants.EVENT_TIMESTAMP_NAME] = new GlideDateTime().getNumericValue()+'';
	sn_cs.VASystemObject.queueClickMetricsLifeCycleEvent(conversationId, taskId, eventType, JSON.stringify(payloadObj));
};

/**
* Extracts the token from the provided request and processes the data
*/
VAClickMetrics.processLink = function(request) {

    // read the token from the request.
    var experience = request.getParameter('experience');

    if (!gs.nil(experience) && experience == 'ai_native_chat') {

        try {
            return VAClickMetrics.processAINativeChatLink(request);
        } catch (e) {
            gs.error('VAClickMetrics.processLink: Error processing ai_native_chat link. Error: ' + e);
            return {
                target_url: '/not_allowed',
                status: 'error',
                message: e.toString()
            };
        }
    } else {
        var token = request.getParameter('token');
        var targetURL = request.getParameter('target_url');
        return sn_cs.VASystemObject.processToken(token, targetURL);
    }
};


/**                                                                                                                                                                                       
  * Collects all parameters from the request into a plain object and delegates                                                                                                              
  * processing of the ai_native_chat click-metrics link to NowAssistClickMetricsProcessor.                                                                                                  
  * @param request the incoming request containing the click-metrics parameters                                                                                                             
  * @return the result returned by NowAssistClickMetricsProcessor.process                                                                                                                   
  */
VAClickMetrics.processAINativeChatLink = function(request) {
    var params = {};
    var paramNames = request.getParameterNames();
    while (paramNames.hasMoreElements()) {
        var name = paramNames.nextElement();
        params[name] = request.getParameter(name) + '';
    }
    return sn_nowassist_va.NowAssistClickMetricsProcessor.process(params);
};

/**
* Retuns the current timestamp
*/
VAClickMetrics.getCurrentTime = function() {
	return new GlideDateTime().getValue();
};

VAClickMetrics.isAISearchClickMetricsAllowed = function() {
	return global.VAClickMetrics.isFeatureEanbled(VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);
};

VAClickMetrics.isContextualSearchClickMetricsAllowed = function() {
	return global.VAClickMetrics.isFeatureEanbled(VAClickMetricsConstants.EVENT_TYPE_CONTEXTUAL_SEARCH);
};

VAClickMetrics.isBotOutputClickMetricsAllowed = function() {
	return global.VAClickMetrics.isFeatureEanbled(VAClickMetricsConstants.EVENT_TYPE_BOT_OUTPUT);
};

/**
* Tests if Click Metrics for the passed even type is enabled or not. 
* @param evenType - the value should be one of VAClickMetricsConstants.EVENT_TYPE_BOT_OUTPUT, VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH,
*				    VAClickMetricsConstants.EVENT_TYPE_CONTEXTUAL_SEARCH
*/
VAClickMetrics.isFeatureEanbled = function(eventType) {
	
	if(gs.nil(eventType))
		eventType = global.VAClickMetricsConstants.EVENT_TYPE_DEFAULT;
	
	var propName = global.VAClickMetrics.getFeatureSwitchProperty(eventType);
	var propVal = gs.getProperty(propName, 'false');
	return propVal && propVal==='true';
};

/**
*  Returns always a new unique ID
*/
VAClickMetrics.createGUID = function() {
	return gs.generateGUID();
};

/**
 * Creates a ScriptableGlideLogger instance with the passed conversationId and taskId
 * @param conversationId. pass null if not avaialble.
 * @param taskId. pass null if not available.
 * @returns {sn_log.GlideLogger}
 */
VAClickMetrics.getLogger = function(conversationId, taskId) {
	
	var context = global.VAClickMetricsConstants.LOGGING_CONTEXT;
	
	if (!gs.nil(conversationId))
		context.conversation = conversationId;
	
	if (!gs.nil(taskId))
		context.conversation_task = taskId;
	
	return getVALogger(context);
};

VAClickMetrics.getTimeDifferenceInMilliseconds = function(timestamp) {
	var currntTime = new GlideDateTime().getNumericValue();
	return currntTime - timestamp; 
};

VAClickMetrics.getFeatureSwitchProperty = function(eventType) {
	return 'com.glide.cs.click_metrics.' + eventType;
};

/**
* Creates a URL that contains metrics and target URL for Genius Search Result.
* This URL will be clicked by the User and sent to the processor for signal processing.
* @return a fully qalified URL . eg:  contain https://instance/va_link_processor.do?metrics=<metrics>&target_url=<target_url>
*/
VAClickMetrics.createGeniusSearchEventMetricsURL = function(searchMetadata, geniusSearchResults, vaSystem, vaInputs, vaVars, url, index) {
	
	var collector = new global.VAAISearchGeniusResultEventMetricCollector(searchMetadata, vaSystem, vaInputs, vaVars);
	collector.collect(geniusSearchResults, index);
	collector.sendOutMetrics();
	return global.VAClickMetrics.createClickMetricsURL(vaSystem, url, collector.getPayload(), global.VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);
};

/**
* Creates a URL that contains metrics and target URL for non-Genius Search Result.
* This URL will be clicked by the User and sent to the processor for signal processing.
* @return a fully qalified URL . eg:  contain https://instance/va_link_processor.do?metrics=<metrics>&target_url=<target_url>
*/
VAClickMetrics.createSearchResultEventMetricsURL = function(searchMetadata, searchResults, vaSystem, vaInputs, vaVars, url, signalType, signalValue) {

	var collector = new global.VAAISearchSearchResultEventMetricCollector(searchMetadata, vaSystem, vaInputs, vaVars);
	collector.collect(searchResults, signalType, signalValue);
	collector.sendOutMetrics();
	return global.VAClickMetrics.createClickMetricsURL(vaSystem, url, collector.getPayload(), global.VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);
};


/**
* Creates a URL that contains metrics and target URL for Genius Search Result.
* This URL will be clicked by the User and sent to the processor for signal processing.
* @return a fully qalified URL . eg:  contain https://instance/va_link_processor.do?metrics=<metrics>&target_url=<target_url>
*/
VAClickMetrics.createGeniusSearchEventMetricsURL = function(searchMetadata, geniusSearchResults, vaSystem, vaInputs, vaVars, url, index) {
	
	// If signal-operation is not allowed, don't need to create a special URL.
	if (!global.VAClickMetrics.isAISearchClickMetricsAllowed()) 
		return VAClickMetrics.createClickMetricsURL(vaSystem, url, {}, VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);
	
	var collector = new global.VAAIGeniusResultEventMetricCollector(searchMetadata, vaSystem, vaInputs, vaVars);
	
	collector.collect(geniusSearchResults, index);
	collector.sendOutMetrics(true);
	
	return VAClickMetrics.createClickMetricsURL(vaSystem, url, collector.getPayload(), VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);
};

/**
* Creates a URL that contains metrics and target URL for regular search results.
* This URL will be clicked by the User and sent to the processor for signal processing.
* @return a fully qualified URL. eg:  contain https://instance/va_link_processor.do?metrics=<metrics>&target_url=<target_url>
*/
VAClickMetrics.createSearchResultEventMetricsURL = function(searchMetadata, searchResults, vaSystem, vaInputs, vaVars, url, itemIndex) {

	// If the signal operation is not allowed, don't need to create a special URL
	if (!global.VAClickMetrics.isAISearchClickMetricsAllowed())
		return global.VAClickMetrics.createClickMetricsURL(vaSystem, url, {}, global.VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);

	var collector = new global.VAAISearchResultEventMetricCollector(searchMetadata, vaSystem, vaInputs, vaVars);
	collector.collect(searchResults, itemIndex);
	collector.sendOutMetrics();
	
	return global.VAClickMetrics.createClickMetricsURL(vaSystem, url, collector.getPayload(), global.VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH);
};


/**
* Sends the signals to GlideSignals API
*/
VAClickMetrics.sendToGlideSignalsAPI = function(conversationId, taskId, eventType, payload) {
	
	var logger = global.VAClickMetrics.getLogger(conversationId, taskId);
	var apiName = global.VAClickMetricsConstants.GLIDE_SINALS_API;
	
	if (gs.nil(eventType)) {
		logger.error('Event Type must exist to send VA AI Search result metrics to {0}:{1}', apiName, eventType);
		return {};
	}
	
	if (gs.nil(payload)) {
		logger.error('Payload must exist to send VA AI Search result metrics to {0}:{1}', apiName, eventType);
		return {};
	}
	
	var timestamp = new GlideDateTime().getNumericValue();
	var userId = payload.userId;
	var sessionId = payload.sessionId;
	
	try {
		
		var signal = new global.GlideSignalsService();
		signal.trackEventAsync(eventType, "INFO", payload);
		logger.info("Sent VA AI search result metrics to {0}:{1}. It took {2} ms. user_id:{3}, session_id:{4}", 
					apiName, eventType, VAClickMetrics.getTimeDifferenceInMilliseconds(timestamp)+'', userId, sessionId);

		return payload;
	} catch(e) {
		// log the issue and let the flow continues..
		// the payload won't be logged here to avoid any possible privacy issue.
		var LOG_ID = apiName+':'+eventType;
		logger.error("An error occurred while sending VA AI search result metrics to {0}. It took {1} ms. user_id:{2}, session_id:{3} \nError:{4}", 
					LOG_ID, global.VAClickMetrics.getTimeDifferenceInMilliseconds(timestamp)+'', userId, sessionId, e);
		return {};
	}
};

VAClickMetrics.updateClickMetricsScheduleJobTriggerType = function(eventEnabled) {
	// find all click-Metrics scheduled jobs and change the trigger type based on the flag.
	// When event handling is set to true, the trigger type needs to be set to "Repeat"
	// When event handling is set to false, the trigger type needs to be set to "Disabled"
	var names = global.VAClickMetricsConstants.SCHEDULED_JOB_NAMES;

	var gr = new GlideRecord('sys_trigger');
	gr.addQuery('name', 'IN', names.join());  
	
	// 1 - Repeat.
	// 2 - Disabled.
	var triggerType = (eventEnabled) ? '1' : '2';
	gr.setValue('trigger_type',triggerType);

	gr.updateMultiple();
};

function getVALogger(context) {
	return new sn_log.GlideLogger(global.VAClickMetricsConstants.LOGGER_NAME, context, Object.keys(context));
}
