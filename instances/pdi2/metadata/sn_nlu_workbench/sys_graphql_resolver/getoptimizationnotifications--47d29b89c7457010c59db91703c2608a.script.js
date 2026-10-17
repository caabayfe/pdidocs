(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        return {
            status: 'success',
            notifications: new sn_nlu_workbench.NLUBatchTestExecution(args.executionId).getOptimizationNotifications()
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }
})(env);
