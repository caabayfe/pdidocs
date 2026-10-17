var NowAssistSynthesizedExecutionHelper = Class.create();

NowAssistSynthesizedExecutionHelper.markCatalogAsStarted = function(runtimeContext, searchResultLineItem, searchResultInfo) {
    if (!isSynthesizedExperience(runtimeContext)) return;
    return global.NowAssistSynthesizedExecutionHelper.startResourceExecution(runtimeContext, searchResultLineItem, searchResultInfo);
};

NowAssistSynthesizedExecutionHelper.markCatalogAsCompleted = function(runtimeContext, nowAssistExecutionId, searchResultInfo, catalogFinalState, deflectionLogId) {
    if (!isSynthesizedExperience(runtimeContext)) return;

    searchResultInfo = ensureObject(searchResultInfo);
    catalogFinalState = ensureObject(catalogFinalState);

    var status = catalogFinalState.request_catalog_status;
    var message = catalogFinalState.request_catalog_message;
    var requestId = catalogFinalState.request_catalog_record_id;
    var requestTable = catalogFinalState.request_catalog_record_table;

    var executionEndingState = "";
    var additionalProperties = {};
	var deflectionStatus = "";

    if (status === sn_nowassist_va.NowAssistConstants.STATUS_SUCCESS) {
        // mark catalog as completed successfully and store request item
        executionEndingState = sn_nowassist_va.NowAssistConstants.NOW_ASSIST_EXECUTION_STATE_COMPLETED;
        additionalProperties["notes"] = JSON.stringify({
            "requestId": requestId,
            "requestTable": requestTable
        });
        
        // mark deflection as resolved 
        deflectionStatus = sn_nowassist_va.NowAssistConstants.DEFLECTION_STATUS_RESOLVED;
    } else if (status === sn_nowassist_va.NowAssistConstants.STATUS_BAILOUT) {
        // mark catalog execution as cancelled
        executionEndingState = sn_nowassist_va.NowAssistConstants.NOW_ASSIST_EXECUTION_STATE_CANCELLED;
        if (!gs.nil(message))
            additionalProperties["notes"] = message;

        // mark deflection as not resolved 
        deflectionStatus = sn_nowassist_va.NowAssistConstants.DEFLECTION_STATUS_NOT_RESOLVED;
    } else {
        // mark catalog execution as errored
        executionEndingState = sn_nowassist_va.NowAssistConstants.NOW_ASSIST_EXECUTION_STATE_ERROR;
        if (!gs.nil(message))
            additionalProperties["notes"] = message;

        // mark deflection as not resolved 
        deflectionStatus = sn_nowassist_va.NowAssistConstants.DEFLECTION_STATUS_NOT_RESOLVED;
    }

    global.NowAssistSynthesizedExecutionHelper.endResourceExecution(nowAssistExecutionId, executionEndingState, additionalProperties);

	global.NowAssistDeflectionLogHelper.updateDeflectionLog(deflectionLogId, deflectionStatus, searchResultInfo.resource_sys_id, sn_nowassist_va.NowAssistConstants.CATALOG_ITEM_TABLE);

	if (status === sn_nowassist_va.NowAssistConstants.STATUS_SUCCESS)
		global.NowAssistSynthesizedExecutionHelper.addNowAssistExecutionProduct(nowAssistExecutionId, requestId, requestTable);
};

/**
 * Creates now assist execution record for the resource
 * @param runtimeContext {
 *      conversation_id: string,
        } 
 * @param searchResultLineItem selected line item from the search result
 * @param searchResultInfo
 * @return Now Assist Execution sys_id (sys_cs_now_assist_execution)
 */
NowAssistSynthesizedExecutionHelper.startResourceExecution = function(runtimeContext, searchResultLineItem, searchResultInfo) {
    var conversationId = ensureObject(runtimeContext).conversation_id;
    searchResultLineItem = ensureObject(searchResultLineItem);
    searchResultInfo = ensureObject(searchResultInfo);
    var resourceId = searchResultInfo.resource_sys_id;
    var resourceTable = searchResultInfo.resource_table;
    var resourceLabel = sn_nowassist_va.NowAssistSearchResultsHelper.getNameFromLineItem(searchResultLineItem);
    var additionalProperties = {
        sequence: searchResultInfo.processing_result_index
    };

    return new sn_vad_genai.NowAssistVAUnifiedExecutionHelper().createNowAssistExecution(conversationId, resourceId, resourceTable, resourceLabel, additionalProperties);
};

/**
 * Updates now assist execution record for the resource with ending state
 * @param nowAssistExecutionId sys_id of sys_cs_now_assist_execution
 * @param endingState final state of the execution
 * @param additionalProperties notes or additional properties to be updated
 */
NowAssistSynthesizedExecutionHelper.endResourceExecution = function(nowAssistExecutionId, endingState, additionalProperties) {
    new sn_vad_genai.NowAssistVAUnifiedExecutionHelper().updateNowAssistExecution(nowAssistExecutionId, endingState, additionalProperties);
};

/**
 * Creates now assist execution product record for the complete catalog request
 * @param nowAssistExecutionId sys_id of sys_cs_now_assist_execution
 * @param productId request id
 * @param productTable request table
 * @return Now Assist Execution Product sys_id (sys_cs_now_assist_execution_product)
 */
NowAssistSynthesizedExecutionHelper.addNowAssistExecutionProduct = function(nowAssistExecutionId, productId, productTable) {
    return new sn_vad_genai.NowAssistVAUnifiedExecutionHelper().addNowAssistExecutionProduct(nowAssistExecutionId, productId, productTable);
};

NowAssistSynthesizedExecutionHelper.markKBAsCompleted = function(runtimeContext, nowAssistExecutionId, searchResultInfo, deflectionLogId) {
    if (!isSynthesizedExperience(runtimeContext)) return;
    global.NowAssistSynthesizedExecutionHelper.endResourceExecution(nowAssistExecutionId, sn_nowassist_va.NowAssistConstants.NOW_ASSIST_EXECUTION_STATE_COMPLETED, {});
    // mark deflection as resolved
    searchResultInfo = ensureObject(searchResultInfo);
    global.NowAssistDeflectionLogHelper.updateDeflectionLog(deflectionLogId, sn_nowassist_va.NowAssistConstants.DEFLECTION_STATUS_RESOLVED, searchResultInfo.resource_sys_id, searchResultInfo.resource_table);
};

function isSynthesizedExperience(runtimeContext) {
    return ensureObject(runtimeContext).parent_output_type === sn_nowassist_va.NowAssistConstants.SEARCH_RESULTS_SYNTHESIZED_RESULT_TYPE;
}

function ensureObject(obj) {
    return sn_nowassist_va.NowAssistUtil.ensureObject(obj);
}
