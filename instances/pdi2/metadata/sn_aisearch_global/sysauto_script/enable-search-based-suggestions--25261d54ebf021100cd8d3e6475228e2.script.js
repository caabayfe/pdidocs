enableSearchBasedSuggestions();

/**
 * Enable OOTB Search-Based and User History suggestion reader groups for AIS Next Experience (global) search which are supported from Tokyo
 * and disable existing Suggestion Query and Suggested Result reader groups.
 */
function enableSearchBasedSuggestions() {
    var oldReaderGroupGR = new GlideRecord('sys_suggestion_reader_group');
    oldReaderGroupGR.addEncodedQuery('context_config_id=6ebf8fe1531201107f03ddeeff7b122b^sys_idIN72bf8fe1531201107f03ddeeff7b1235,febf8fe1531201107f03ddeeff7b123a'); //Suggestion Query and suggested result reader groups IDs
    oldReaderGroupGR.query();
    while (oldReaderGroupGR.next()) {
        oldReaderGroupGR.setValue('context_config_id', ''); //Remove from [AIS] Next Experience search application
        oldReaderGroupGR.setWorkflow(false);
        oldReaderGroupGR.update();
    }

    var newReaderGroupGR = new GlideRecord('sys_suggestion_reader_group');
    newReaderGroupGR.addEncodedQuery('context_config_id=NULL^sys_idIN3155a41ceb3021100cd8d3e6475228b0,83721d8feb2021100cd8d3e64752289d'); //User History and Search based suggestion reader groups IDs
    newReaderGroupGR.query();
    while (newReaderGroupGR.next()) {
        newReaderGroupGR.setValue('context_config_id', '6ebf8fe1531201107f03ddeeff7b122b'); //Add to [AIS] Next Experience search application
        newReaderGroupGR.setWorkflow(false);
        newReaderGroupGR.update();
    }
}
