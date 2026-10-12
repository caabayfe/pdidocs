(function(context, pageParams, blockcontext) {
    var eflUtil = new sn_nlu_workbench.NLUExpertFeedbackUtil(blockcontext.category);
    var selectedModelDetails = blockcontext.selectedModelDetails;
    var lastTunedOn = selectedModelDetails.lastTunedOn;
    var searchText = blockcontext.searchUtteranceTextDone || '';
    var filterValue = blockcontext.doneFilterValueSelected;
    var selectedIntentDetails = blockcontext.selectedIntentDetails;
    var pageNumber = blockcontext.donePageNumber;
    var totalRecords = eflUtil.getTotalLabeledRecords(selectedIntentDetails.label, lastTunedOn);
    var feedback = blockcontext.feedback.done;
    var correctedIntents = blockcontext.correctedIntents;
    var doneFeedback = eflUtil.getDoneFeedback(feedback, searchText, filterValue, selectedIntentDetails, pageNumber, totalRecords, correctedIntents, lastTunedOn, selectedModelDetails);
    var expert_feedback_done = doneFeedback.feedback;
    return {
        doneFeedback: expert_feedback_done,
        formattedDoneFeedbackRowDef: eflUtil.formatEFLListRowDefinition(expert_feedback_done),
        showDoneUtterance: (expert_feedback_done.length > 0) ? true : false,
        showDoneUtteranceEmptyState: (expert_feedback_done.length == 0) ? true : false,
        totalRecordsWithSearch: doneFeedback.totalRecords
    }

})(context, pageParams, blockcontext);
