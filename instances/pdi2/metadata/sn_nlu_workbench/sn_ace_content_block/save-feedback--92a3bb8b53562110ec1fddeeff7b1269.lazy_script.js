(function(context, pageParams, blockcontext) {
    var feedback = blockcontext.feedback;
    new sn_nlu_workbench.NLUExpertFeedbackUtil().updateCorrectedLabel(feedback);
    return {
        done: {},
        disableSaveFeedback: true
    };
})(context, pageParams, blockcontext);
