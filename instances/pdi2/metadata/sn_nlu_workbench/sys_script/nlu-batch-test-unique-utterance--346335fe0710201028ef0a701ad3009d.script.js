(function executeRule(current, previous /*null when async*/ ) {

    var tables = NLUWorkbenchConstants.tables;

    // Check if a record exists with same utterance under the test set:
    var gr = new GlideRecord(tables.NLU_BATCH_TEST_UTTERANCE);
    gr.addQuery('test_set', current.test_set);
    gr.addQuery('utterance', current.utterance);
    gr.query();
    while (gr.next()) {
        if (gr.utterance.toString() === current.utterance.toString()) {
            gs.addErrorMessage(gs.getMessage('Invalid insert, utterance {0} already exists in this test set.', GlideStringUtil.escapeHTML(current.utterance)));
            current.setAbortAction(true);
        }
    }

})(current, previous);
