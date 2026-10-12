(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        var modelId = args.modelId;
        var testSetId = args.testSetId;

        return {
            count: sn_nlu_workbench.NLUBatchTestSetQuality.getSkippedUtterancesCountForClone(modelId, testSetId)
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
