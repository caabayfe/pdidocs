(function process( /*ResolverEnvironment*/ env) {
    try {

        var args = env.getArguments();
        return {
            status: 'success',
            data: sn_nlu_workbench.NLUBatchTestSetQuality.getTestSetQuality(args.models, args.testSetId, args.isOptimize)

        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }
})(env);
