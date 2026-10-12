(function executeRule(current, previous /*null when async*/ ) {
    var failUpdate = false;
    var value = parseFloat(current.value);
    var property = current.name.toString();
    var sysProps = NLUConstants.SYS_PROPS;
    var optMinLabeledData = Number(gs.getProperty('sn_nlu_workbench.glide.nlu.optimize.min_labeled_data'));

    switch (property) {
        case sysProps.MAX_UTTERANCES_PER_INTENT:
            if (isNaN(value) || value < 5 || value > 300) {
                failUpdate = true;
                gs.addErrorMessage(gs.getMessage('Set a value between 5 and 300 for maximum utterances per intent.'));
            } else if (value > 200) {
                gs.addInfoMessage(gs.getMessage('A maximum of 200 utterances per intent is recommended.'));
            }
            break;
        case sysProps.MAX_TABLE_LOOKUP_RECORDS:
            if (isNaN(value) || value < 0 || value > 100000) {
                failUpdate = true;
                gs.addErrorMessage(gs.getMessage('Set a value less than or equal to 100,000 for maximum records in a table vocabulary source.'));
            }
            break;
        case sysProps.MAX_STATIC_LOOKUP_RECORDS:
            if (isNaN(value) || value < 0 || value > 1000) {
                failUpdate = true;
                gs.addErrorMessage(gs.getMessage('Set a value less than or equal to 1,000 for maximum records in a list vocabulary source.'));
            }
            break;
        case sysProps.ACTIVE_LEARNING_MAX_RECORDS:
            if (isNaN(value) || value < optMinLabeledData) {
                failUpdate = true;
                gs.addErrorMessage(gs.getMessage('Set a value greater than {0} for Maximum number of utterances to display for feedback in expert feedback loop.', optMinLabeledData));
            }
            break;
        default:
            break;
    }
    if (failUpdate)
        current.setAbortAction(true);
})(current, previous);
