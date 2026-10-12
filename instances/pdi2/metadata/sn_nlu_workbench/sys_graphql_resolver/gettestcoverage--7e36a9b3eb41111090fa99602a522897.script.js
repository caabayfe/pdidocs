(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();

        return sn_nlu_workbench.NLUBatchTestSetQuality.getTestCoverage(args.model);
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }
})(env);
