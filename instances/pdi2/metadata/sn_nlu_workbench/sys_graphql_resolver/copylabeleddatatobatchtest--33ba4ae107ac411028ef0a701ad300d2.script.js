(function process( /*ResolverEnvironment*/ env) {

    try {
        var args = env.getArguments();
        var modelId = args.modelId;
        var modelName = args.modelName;
        var testSetId = args.testSetId;

        var testSet = new sn_nlu_workbench.NLUBatchTestSet(testSetId);
        var copiedDataCount = testSet.copyFromULT(modelName);
        return {
            status: 'success',
            message: gs.getMessage('{0} test utterances are added to the test set', copiedDataCount),
            data: sn_nlu_workbench.NLUBatchTestSetQuality.getTestSetQuality([modelId], testSetId, true)
        };
    } catch (ex) {
        return {
            status: 'failure',
            message: ex.message
        };
    }

})(env);
