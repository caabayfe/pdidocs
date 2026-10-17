(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    if (parseFloat(current.getValue('percent_complete')) != 0 && parseFloat(current.getValue('percent_complete')) != 100) {
        gs.addErrorMessage(gs.getMessage('Progress can be either 0 or 100 for milestone type.'));
        current.setAbortAction(true);
    }


})(current, previous);
