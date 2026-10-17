(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        return {
            status: 'success',
            data: sn_nlu_workbench.NLUBatchTestExecution.getTestRunDataWithLabel(args.modelId)
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }
})(env);
