(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        var data = sn_nlu_workbench.NLUBatchTestSet.getTestUtteranceCount(args.modelId, args.intentName);
        return {
            status: 'success',
            count: data
        };
    } catch (e) {
        return {
            status: 'failure',
            message: e.message
        };
    }

})(env);
