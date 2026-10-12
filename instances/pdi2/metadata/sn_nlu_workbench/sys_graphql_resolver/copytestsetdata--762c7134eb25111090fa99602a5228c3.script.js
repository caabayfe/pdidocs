(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        var sourceId = args.sourceId;
        var targetId = args.targetId;

        return sn_nlu_workbench.NLUBatchTestSet.copyTestSetData(sourceId, targetId);
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
