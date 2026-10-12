(function process( /*ResolverEnvironment*/ env) {
    var args = env.getArguments();
    var testUttrIds = args.testUttrIds;

    try {
		var tables = sn_nlu_workbench.NLUWorkbenchConstants.tables;
        var gr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
        gr.get('sys_id', testUttrIds[0]);
        gr.query();

        if (gr.next() && !sn_nlu_workbench.NLUBatchTestSet.canPerformEditOperations(gr.getValue('test_set'))) {
            return {
                status: 'failure',
                message: 'User Does not have ACL permissions.'
            };
        }
        sn_nlu_workbench.NLUBatchTestSet.deleteTestUtterances(testUttrIds);
        return {
            status: 'success',
            count: testUttrIds.length
        };
    } catch (err) {
        return {
            status: 'failure',
            count: 0
        };
    }

})(env);
