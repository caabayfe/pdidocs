(function(context, pageParams, blockcontext) {
    var eflUtil = new sn_nlu_workbench.NLUExpertFeedbackUtil(blockcontext.category);
    var searchText = blockcontext.searchUtteranceTextNfr;
    var filterValue = blockcontext.nfrFilterValueSelected;
    var selectedIntentDetails = blockcontext.selectedIntentDetails;
    var selectedModelDetails = blockcontext.selectedModelDetails;
    var pageNumber = blockcontext.nfrPageNumber;
    var totalRecords = eflUtil.getTotalNeedsFurtherReviewRecords(selectedIntentDetails.label);
    var totalRecordsWithSearch = totalRecords;
    var feedback = blockcontext.feedback.further_review;
    var correctedIntents = blockcontext.correctedIntents;
    var nfrFeedback = eflUtil.getNfrFeedback(feedback, searchText, filterValue, selectedIntentDetails, pageNumber, totalRecords, correctedIntents, selectedModelDetails);
    var expert_feedback_nfr = nfrFeedback.feedback;

    return {
        nfrFeedback: expert_feedback_nfr,
        formattedNfrFeedbackRowDef: eflUtil.formatEFLListRowDefinition(expert_feedback_nfr),
        showNfrUtterance: (expert_feedback_nfr.length > 0) ? true : false,
        showNfrUtteranceEmptyState: (expert_feedback_nfr.length == 0) ? true : false,
        totalRecordsWithSearch: nfrFeedback.totalRecords
    }
})(context, pageParams, blockcontext);
