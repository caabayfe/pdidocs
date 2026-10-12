(function(context, pageParams, blockcontext) {
    var result = sn_nlu_workbench.NLUIARTuning.runAnalysis(blockcontext.selectedModelDetails.modelId);
    var tuneSubscriptionQuery = result.status === 'success' ? 'sys_id=' + result.analysisId : '';
    return {
        tuneSubscriptionQuery: tuneSubscriptionQuery,
        tuneInitiated: result.status === 'success' ? true : false,
        analysisId: result.analysisId
    };
})(context, pageParams, blockcontext);
