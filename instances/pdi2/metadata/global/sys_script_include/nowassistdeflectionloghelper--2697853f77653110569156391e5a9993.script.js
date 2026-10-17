var NowAssistDeflectionLogHelper = Class.create();

NowAssistDeflectionLogHelper.LOGGER_NAME = 'sn_cs.na_deflection_metrics';
NowAssistDeflectionLogHelper.LOGGING_CONTEXT = {
    app: 'CI',
    track: 'DEFLECTION_METRICS',
    layer: 'Script'
};

NowAssistDeflectionLogHelper.getLogger = function(conversationQueryId) {
    var context = global.NowAssistDeflectionLogHelper.LOGGING_CONTEXT;

    if (!gs.nil(conversationQueryId))
        context.conversation_query_id = conversationQueryId;

    return new sn_log.GlideLogger(global.NowAssistDeflectionLogHelper.LOGGER_NAME, context, Object.keys(context));
};

/**
 * Insert record in the deflection table
 * @param conversationId
 * @param channel
 * @param portal
 * @param contextProfile
 * @return conversationQueryId - sysId of the new record
 */
NowAssistDeflectionLogHelper.insertDeflectionLog = function(conversationId, channelSysId, portal, contextProfile, deploymentId, deviceType, experience, fdihSysId, outputType, mode) {
	
    var gr = new GlideRecord(AISearchConstants.SYS_CS_DEFLECTION_LOG_TABLE);
    gr.initialize();

    gr.conversation_id = conversationId ? conversationId : '';
    gr.context_profile = contextProfile ? contextProfile : '';
    gr.assistant = deploymentId ? deploymentId : '';
    gr.channel = channelSysId ? channelSysId : '';
    gr.device_type = deviceType ? deviceType : '';
    gr.portal = portal ? portal : '';
    gr.state = global.AISearchConstants.DEFLECTION_STATUS_DEFAULT;
    gr.num_of_turns = 0;
    gr.requestor = gs.getUserID(); // this has to be a requestor user Id.
    gr.experience = experience ? experience : '';
    gr.fdih_invocation_id = fdihSysId ? fdihSysId : '';
    gr.output_type = outputType ? outputType : '';
    gr.mode = mode ? mode : "";

    return gr.insert();
};

/**
 * Updates record in the deflection table
 * @param conversationQueryId
 * @param state
 * @param resourceId
 * @param resourceTable
 * @param turns
 */
NowAssistDeflectionLogHelper.updateDeflectionLog = function(deflectionLogId, state, resourceId, resourceTable, turns, messageId) {
	
    var logger = NowAssistDeflectionLogHelper.getLogger(deflectionLogId);
    if (!state) {
        logger.error('State must be non-null to update deflection log');
        return null;
    }
    var gr = new GlideRecord(AISearchConstants.SYS_CS_DEFLECTION_LOG_TABLE);
    
	if (gr.get(deflectionLogId)) {

        gr.state = state;
		
		if (!gs.nil(resourceTable) || gs.nil(gr.output_type))
			gr.deflection_type = global.NowAssistDeflectionLogHelper.getDeflectionType(resourceTable, gr.output_type);
			
        gr.resource_id = resourceId ? resourceId : '';
        gr.resource_table = resourceTable ? resourceTable : '';
        gr.num_of_turns = turns ? turns : 0;
        gr.message_id = messageId ? messageId : '';	
        gr.update();
	
	} else {
        logger.error('Deflection log with sys_id: {0} does not exist', deflectionLogId);
        return null;
    }
};

NowAssistDeflectionLogHelper.updateDeflectionLogWithFieldMap = function(deflectionLogId, fieldValueMap) {
	
    var logger = NowAssistDeflectionLogHelper.getLogger(deflectionLogId);

    if (gs.nil(fieldValueMap.state)) {
        logger.error('State must be non-null to update deflection log');
        return;
    }

    var gr = new GlideRecord(AISearchConstants.SYS_CS_DEFLECTION_LOG_TABLE);
	
	if (gr.get(deflectionLogId)){ 
		
		for (var field in fieldValueMap)
			gr[field] = fieldValueMap[field];

		gr.update();	
	
	} else {
        logger.error('Deflection log with sys_id: {0} does not exist', deflectionLogId);
    }
};

NowAssistDeflectionLogHelper.getDeflectionType = function(resourceTable, outputType) {
    var deflectionType = '';
    if (!gs.nil(resourceTable)) {
        deflectionType = AISearchConstants.RESOURCE_TABLE_DEFLECTION_TYPE_MAP[resourceTable];
    }
	
	if (gs.nil(deflectionType) && (outputType.toLowerCase() == sn_nowassist_va.NowAssistConstants.SEARCH_RESULTS_SYNTHESIZED_OUTPUT_TYPE.toLowerCase())) {
        deflectionType = sn_nowassist_va.NowAssistConstants.SEARCH_RESULTS_SYNTHESIZED_OUTPUT_TYPE.toLowerCase();
    }
    return deflectionType;
};
