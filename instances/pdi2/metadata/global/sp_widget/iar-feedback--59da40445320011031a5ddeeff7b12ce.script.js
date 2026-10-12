(function() {
    var localInput = input;
    data.resultStatus = {
        VIEWED: "viewed",
        SUBMITTED: "submitted"
    };
	
	data.aisFeedBack = {
        HELPFUL: AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_POSITIVE,
        NOT_HELPFUL: AutoResolutionAISearchResultLineItem.FEEDBACK_TYPE_NEGATIVE,
    };
	
    data.closeRequestChoices = {
        CLOSE_REQUEST: "close",
        KEEP_OPEN: "open"
    };

    if (localInput && localInput.action === 'submitFeedback') {
	
		var taskGr = AutoResolutionTaskDataBroker.getTaskRecord(localInput.feedbackRequest.recordTable, localInput.feedbackRequest.recordId);
        if (gs.nil(taskGr)) {
            gs.addErrorMessage(gs.getMessage("Task not found"));
            return;
        }

        if (localInput.feedbackRequest.aisHelpful === data.aisFeedBack.NOT_HELPFUL)
            localInput.feedbackRequest.closeRequest = data.closeRequestChoices.KEEP_OPEN;

        var result = new AutoResolutionPortalHelper(taskGr).submitFeedback(localInput.feedbackRequest);
        if (result.status == "success") {
            gs.addInfoMessage(gs.getMessage("Thank you for your feedback!"));
            return;
        }
		
        if (result.error) {
            gs.addErrorMessage(result.error);
            return;
        }
        
        gs.addErrorMessage(gs.getMessage("Could not submit feedback. An unknown error occurred."));
        return;
    }

    if (options && options.aisResultList && options.recordId && options.recordTable) {
        data.aisResultList = options.aisResultList;
        data.recordId = options.recordId;
        data.recordTable = options.recordTable;
        data.isCatalogSubmitted = options.isCatalogSubmitted;
        data.action = options.action;
    } else
        return;


})();
