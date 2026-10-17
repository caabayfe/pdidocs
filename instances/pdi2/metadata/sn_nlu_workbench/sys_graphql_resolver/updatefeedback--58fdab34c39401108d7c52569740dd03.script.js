(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        var selectedIntent = args.selectedIntent || '';
        var feedbackConfig = JSON.parse(args.feedbackConfig);
        return {
            status: 'success',
            message: gs.getMessage('Feedback updated successfully'),
            reviewProgress: new sn_nlu_workbench.NLUExpertFeedbackUtil().updateFeedback(selectedIntent, feedbackConfig)
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
