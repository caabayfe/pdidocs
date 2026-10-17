(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        return {
            status: 'success',
            reportInfo: sn_nlu_workbench.NLUBatchTestExecution.getReportInfo(args.modelId, args.isOptimize, args.trainedVersion)
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }
})(env);
