(function process( /*ResolverEnvironment*/ env) {
    try {
        var args = env.getArguments();
        var testUttrGr = new GlideRecord('nlu_batch_test_utterance');
        var tableMetadata = {
            "canWrite": testUttrGr.canWrite(),
            "canCreate": testUttrGr.canCreate(),
            "canRead": testUttrGr.canRead(),
            "canDelete": testUttrGr.canDelete()
        };
        testUttrGr.addEncodedQuery(args.queryConditions);
        testUttrGr.query();

        var testUtterances = [];
        while (testUttrGr.next()) {
            testUtterances.push({
                sys_id: testUttrGr.getValue('sys_id'),
                utterance: testUttrGr.getValue('utterance'),
                intent: testUttrGr.getValue('intent'),
                source: testUttrGr.getDisplayValue('source'),
                sys_updated_on: {
                    value: testUttrGr.getValue('sys_updated_on'),
                    displayValue: testUttrGr.getDisplayValue('sys_updated_on')
                },
                test_set: testUttrGr.getValue('test_set')
            });
        }
        return {
            status: 'success',
            testUtterances: testUtterances,
            _table_metadata: tableMetadata
        };
    } catch (e) {
        return {
            status: 'failure',
            error: e.message
        };
    }
})(env);
