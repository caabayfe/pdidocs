var inputs = JSON.parse(event.parm1);
var contextId = event.parm2;
var {
    currentRecordTable,
    currentRecordSysId,
    recommendationType,
    actionTypes,
    fields,
    ruleContextId,
    needsRegeneration,
    hasUnsavedChanges,
    isNewContext,
    groupRecommendations,
    response,
    userId,
    asyncEventCreationTime
} = inputs;
try {
    var raglobalUtility = new global.RAGlobalUtility();
    var asyncTimeOut = gs.nil(gs.getProperty(Constants.ASYNC_RA_TIMEOUT_PROPERTY)) ? 30 : gs.getProperty(Constants.ASYNC_RA_TIMEOUT_PROPERTY); //set default value 30
    asyncTimeOut = asyncTimeOut > 180 ? 180 : asyncTimeOut; // if the property value is greater than 180
    asyncTimeout = asyncTimeOut * 1000; //to convert seconds to millisecond
    var nowTime = new GlideDateTime();
    var eventCreatedTime = new GlideDateTime(asyncEventCreationTime);
    var waitingDuration = GlideDateTime.subtract(eventCreatedTime, nowTime); // Difference between gdt1 and gdt2
    var timeOutDuration = new GlideDuration(asyncTimeout);
    var timeSpent = waitingDuration.compareTo(timeOutDuration);
    var contextRecord = new GlideRecord(sn_nb_action.Constants.TBL_ACTION_CONTEXT);
    contextRecord.get(contextId);
	
    if (timeSpent < 0) {
        gs.debug("Recommended Actions Async event handler is getting processed");
        var nextbestActionDAO = new sn_nb_action.NextBestActionDAO();
        var currentRecord = new GlideRecord(currentRecordTable);
        currentRecord.get(currentRecordSysId);
        var ruleContext = nextbestActionDAO.getRuleContext(currentRecordTable, ruleContextId);
        var recommendationParams = {
            currentRecord: currentRecord,
            contextRecord: contextRecord,
            recommendationType: recommendationType,
            actionTypes: actionTypes,
            fields: fields,
            ruleContext: ruleContext,
            needsRegeneration: needsRegeneration,
            hasUnsavedChanges: hasUnsavedChanges,
            isNewContext: isNewContext,
            groupRecommendations: groupRecommendations
        };

        var result = raglobalUtility.generateRecommendationsForUser(recommendationParams, response, userId);
    } else {
        gs.debug("Recommended Actions Async event handler timed out ");
        raglobalUtility.updateRAContextEvaluationStatusAsUser(userId, contextRecord, sn_nb_action.Constants.EVALUATION_STATUS_CHOICES.TIMED_OUT);
    }
} catch (error) {
    gs.error('RA_ASYNC_EVENT_HANDLER: Failed to generate recommendations for Recommendation Action context ' + contextId + " - " + error);
}
