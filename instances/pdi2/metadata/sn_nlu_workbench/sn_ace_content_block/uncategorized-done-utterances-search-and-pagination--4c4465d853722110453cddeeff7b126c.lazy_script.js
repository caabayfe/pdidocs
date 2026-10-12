(function(context, pageParams, blockcontext) {
    var eflUtil = new sn_nlu_workbench.NLUExpertFeedbackUtil(blockcontext.category);
    var searchText = blockcontext.uncategorizedDoneUtterancesSearchText;
    var pageNumber = blockcontext.uncategorizedDoneUtterancesPageNumber;
    var uncategorizedUtterancesCount = eflUtil.uncategorizedUtterancesCount();
    var totalRecords = uncategorizedUtterancesCount.uncategorizedDoneUtterancesTotalRecords;
    var correctedIntents = blockcontext.correctedIntents;
    var doneUncategorizedUtterances = eflUtil.getDoneUncategorizedUtterances(correctedIntents, searchText, pageNumber, totalRecords);
    var expert_feedback_done = doneUncategorizedUtterances.uncategorizedUtterances;
    return {
        doneFeedback: expert_feedback_done,
        formattedDoneFeedbackRowDef: eflUtil.formatEFLListRowDefinition(expert_feedback_done),
        showDoneUtterance: (expert_feedback_done.length > 0) ? true : false,
        showDoneUtteranceEmptyState: (expert_feedback_done.length == 0) ? true : false,
        totalRecordsWithSearch: doneUncategorizedUtterances.totalRecords
    };
})(context, pageParams, blockcontext);
