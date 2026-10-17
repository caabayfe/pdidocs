(function process( /*ResolverEnvironment*/ env) {
    var args = env.getArguments();

    try {
        var sysId = args.sysId;
        var utterance = args.utterance;
        var intents = args.intents;
        var source = args.source;

        var tables = sn_nlu_workbench.NLUWorkbenchConstants.tables;
        var gr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
        gr.get('sys_id', sysId);
        gr.query();

        if (gr.next()) {
            if (!sn_nlu_workbench.NLUBatchTestSet.canPerformEditOperations(gr.getValue('test_set'))) {
                return {
                    status: 'Failure',
                    message: 'User Does not have ACL permissions.'
                };
            }
            gr.setValue('utterance', utterance);
            gr.setValue('intent', intents);
            gr.setValue('source', source);
            gr.update();
        }

        return {
            status: "success",
            sys_id: sysId,
            utterance: gr.getValue('utterance'),
            intents: gr.getValue('intent'),
            source: gr.getDisplayValue('source'),
            sys_updated_on: gr.getValue('sys_updated_on')
        };
    } catch (err) {
        return {
            status: "error " + err.message
        };
    }




})(env);
