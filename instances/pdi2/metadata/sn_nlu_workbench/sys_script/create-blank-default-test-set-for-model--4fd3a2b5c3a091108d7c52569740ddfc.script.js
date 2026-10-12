(function executeRule(current, previous /*null when async*/ ) {

    try {
        var constants = global.NLUConstants.constants;
        sn_nlu_workbench.NLUBatchTestSet.addRecord(
            constants.DEFAULT_TEST_SET_PREFIX + current.display_name,
            current.language,
            'uploaded',
            current.sys_id
        );
    } catch (err) {
        gs.error("Unable to process BR - Create blank default test set for model" + err.message);
        current.setAbortAction(true);
    }

})(current, previous);
