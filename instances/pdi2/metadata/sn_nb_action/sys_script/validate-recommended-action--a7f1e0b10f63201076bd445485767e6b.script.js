(function executeRule(current, previous /*null when async*/ ) {

    var tableName = current.rule.rule_context.context;
    var actionRecord = current.action.getRefRecord();
    var nextBestActionService = new sn_nb_action.NextBestActionService();
    var result = nextBestActionService.isActionAllowed(tableName, actionRecord);
    if (typeof(result) == "object") {
        var isActionAllowed = result[Constants.IS_ACTION_ALLOWED];
        var errorMessage = result[Constants.ERROR_MESSAGE];
    } else {
        isActionAllowed = result;
    }
    if (!isActionAllowed) {
        if (errorMessage) {
            gs.addErrorMessage(errorMessage);
        }
        current.setAbortAction(true);
    }

})(current, previous);
