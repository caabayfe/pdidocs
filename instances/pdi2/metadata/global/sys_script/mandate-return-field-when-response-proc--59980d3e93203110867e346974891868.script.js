(function executeRule(current, previous /*null when async*/ ) {
    gs.addErrorMessage(gs.getMessage("'Return fields' is mandatory in conjunction with 'AIS response processor script'."));
    current.setAbortAction(true);
})(current, previous);
