(function executeRule(current, previous /*null when async*/ ) {

    var tables = NLUWorkbenchConstants.tables;
    var sysProps = NLUWorkbenchConstants.sysProps;

    // Check max number of records per test set: 
    var utteranceLimit = gs.getProperty(sysProps.UTTERANCE_LIMIT);
    var ga = new GlideAggregate(tables.NLU_BATCH_TEST_UTTERANCE);
    ga.addAggregate('COUNT');
    ga.addQuery('test_set', current.test_set);
    ga.query();
    if (ga.next() && parseInt(ga.getAggregate('COUNT')) >= parseInt(utteranceLimit)) {
        gs.addErrorMessage(gs.getMessage('Already maximum number of utterances present for the batch test set.'));
        current.setAbortAction(true);
    }

})(current, previous);
