(function executeRule(current, previous /*null when async*/ ) {
    if (sn_mif.MIFBase.isManagerInstance(current.application)) {
        var errorMsg = gs.getMessage('Current instance cannot be both a managing and managed instance');
        gs.addErrorMessage(errorMsg);
        gs.error(errorMsg);
        current.setAbortAction(true);
    }
})(current, previous);
