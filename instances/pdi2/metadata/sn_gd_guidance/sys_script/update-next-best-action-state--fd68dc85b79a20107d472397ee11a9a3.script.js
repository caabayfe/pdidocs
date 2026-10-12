(function executeRule(current, previous /*null when async*/ ) {

    var constants = new sn_gd_guidance.GuidanceConstants();
    var guidancedActionHandler = new sn_gd_guidance.GuidanceActionTypeHandler();
    var guidedDecisionsGuidanceModel = new sn_gd_guidance.GuidedDecisionsGuidanceModel();

    // Gets guidance ouputs as label value pairs for card view in history state
    var guidanceOutputs = guidedDecisionsGuidanceModel.getGuidanceOutputsForCardView(current);
    // Gets details of the guidance action that has been executed.
    var actionDetails = guidedDecisionsGuidanceModel.getGuidanceActionDetails(current);
	var contextRecord, guidanceActionRecord;
    actionDetails['actionOutputs'] = guidanceOutputs;
	
    var actionDetailSysId = current.getValue(constants.COL_RECOMMENDED_BY);

    var state = current.state;
    if (state == constants.STATE_COMPLETED)
        guidancedActionHandler.completed('', '', actionDetailSysId, actionDetails);
    else if (state == constants.STATE_IN_PROGRESS)
        guidancedActionHandler.progressed(actionDetailSysId);
    else if (state == constants.STATE_SKIPPED || state == constants.STATE_ERROR_SKIPPED)
        guidancedActionHandler.skipped('', '', actionDetailSysId);
	else if (state == constants.STATE_IN_ERROR)
		guidancedActionHandler.erroredOut(contextRecord,guidanceActionRecord,actionDetailSysId);

})(current, previous);
