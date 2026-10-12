(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        return {
            status: 'success',
            data: new sn_nlu_workbench.NLUExpertFeedbackUtil().getIntentList(args.modelId)
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
