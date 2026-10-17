(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        var data = sn_nlu_workbench.NLUConflictExecution.getConflictsCountForIntent(args.intentId, args.type);
        return {
            status: 'success',
            count: data ? data.count : 0,
            executionId: data && data.executionId
        };
    } catch (e) {
        return {
            status: 'failure',
            message: e.message
        };
    }

})(env);
