(function(context, pageParams, blockcontext) {
    var eflUtil = new sn_nlu_workbench.NLUExpertFeedbackUtil(blockcontext.category);
    var searchText = blockcontext.tuneModelFeedbackSearchText;
    var intentId = blockcontext.tuneModelIntentsSearchText.value;
    var modelId = blockcontext.selectedModelDetails.modelId;
    var lastTunedOn = blockcontext.selectedModelDetails.lastTunedOn;

    var getTuneModelFeedback = eflUtil.getTuneModelFeedback(searchText, intentId, modelId, lastTunedOn);
    var doneFeedbackRowDefinition = getTuneModelFeedback.feebackRowDefinition;
    var getTuneModelFeedbackIntentsList = eflUtil.getTuneModelFeedbackIntentsList(searchText, intentId, modelId, lastTunedOn);
    var tuneModelIntentFilterList = getTuneModelFeedbackIntentsList.filterList;

    return {
        doneFeedback: doneFeedbackRowDefinition,
        tuneModelIntentsList: tuneModelIntentFilterList
    };
})(context, pageParams, blockcontext);
