(function executeRule(current, previous /*null when async*/ ) {
    var errorMsg = (new sn_gf.GFStrategy(current.getUniqueValue(), current)).validateDates();
    if (errorMsg) {
        gs.addErrorMessage(errorMsg);
        current.setAbortAction(true);
    }
})(current, previous);
