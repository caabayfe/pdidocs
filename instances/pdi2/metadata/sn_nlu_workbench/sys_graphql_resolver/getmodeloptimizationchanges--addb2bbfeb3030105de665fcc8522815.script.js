(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        var result = new sn_nlu_workbench.NLUBatchTestExecution(args.executionId).getModelOptimizationChanges(args.currentOutcome, args.optimizedOutcome, args.offset, args.limit, args.sortBy, args.sortOrder);
        return {
            status: 'success',
            data: result.data,
            count: result.count
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
