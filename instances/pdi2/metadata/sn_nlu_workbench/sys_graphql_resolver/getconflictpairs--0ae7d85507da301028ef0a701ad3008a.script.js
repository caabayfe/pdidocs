(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        return {
            status: 'success',
            data: new sn_nlu_workbench.NLUConflictExecution(args.executionId)
                .getConflictPairs(args.intentPair, args.filters, args.scope)
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }
})(env);
