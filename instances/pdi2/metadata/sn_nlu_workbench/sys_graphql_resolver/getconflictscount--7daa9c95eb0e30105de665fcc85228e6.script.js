(function process(/*ResolverEnvironment*/ env) {
	
     try {
        var args = env.getArguments();
        var count = sn_nlu_workbench.NLUConflictExecution.getConflictsCount(args.modelId, args.type);
        return {
            status: 'success',
            count: count
        };
    } catch (e) {
        return {
            status: 'failure',
            message: e.message
        };
    }

})(env);
