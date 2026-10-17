(function(context, pageParams, blockcontext) {
    var feedback = blockcontext.feedback;
    var selectedIntent = blockcontext.selectedIntentDetails.label;
    var showUncategorizedUtterances = blockcontext.showUncategorizedUtterances;
    var showCategorizedUtterances = blockcontext.showCategorizedUtterances;
    var disableSave = blockcontext.disableSave;
    var disableUncategorizedSave = blockcontext.disableUncategorizedSave;
    new sn_nlu_workbench.NLUExpertFeedbackUtil(blockcontext.category).updateFeedback(selectedIntent, feedback);
    if (showUncategorizedUtterances) {
        disableUncategorizedSave = true;
    }
    if (showCategorizedUtterances) {
        disableSave = true;
    }
    return {
        disableSave: disableSave,
        disableUncategorizedSave: disableUncategorizedSave
    };
})(context, pageParams, blockcontext);
