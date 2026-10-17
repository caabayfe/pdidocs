(function executeRule(current, previous /*null when async*/ ) {

    /*
    - Check if there is an entry with same text and label exist
    - If label_reference is passed, check for that too:
    */
    var filter = 'sys_id!=' + current.getUniqueValue();
    if (MLLabeledData.recordExists(current, filter)) {
        gs.addErrorMessage(gs.getMessage('Invalid insert - already an entry with this text & label exists'));
        current.setAbortAction(true);
    }

})(current, previous);
