(function executeRule(current, previous /*null when async*/ ) {
    var CC_VALUES = ['public', 'private'];
    if (CC_VALUES.indexOf(''+current.value) == -1) {
        var errMsg = gs.getMessage("You can change the values to any of {0}", CC_VALUES.join(","));
        gs.addErrorMessage(errMsg);
        current.setAbortAction(true);
    }
})(current, previous);
