(function executeRule(current, previous /*null when async*/) {

    // Add your code here
    var condition = current.getValue('condition');
    if (condition && condition.toLowerCase().indexOf('javascript:') !== -1) {
        gs.addErrorMessage(gs.getMessage('JavaScript conditions are not supported for security reasons. Please use standard conditions'));
        current.setAbortAction(true);
        return false;
    }

})(current, previous);
