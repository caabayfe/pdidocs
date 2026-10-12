(function executeRule(current, previous /*null when async*/ ) {

    var constants = global.NLUConstants.constants;

    NLUBatchTestSet.updateRecord('model=' + current.sys_id, {
        name: constants.DEFAULT_TEST_SET_PREFIX + current.display_name
    });

})(current, previous);
