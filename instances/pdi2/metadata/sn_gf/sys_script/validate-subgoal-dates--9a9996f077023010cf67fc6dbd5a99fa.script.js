(function executeRule(current, previous /*null when async*/ ) {
    var errorMsg = (new sn_gf.GFCoreGoal(current.getUniqueValue(), current)).validateSubGoalDates();
    if (errorMsg) {
        gs.addErrorMessage(errorMsg);
        current.setAbortAction(true);
    }
})(current, previous);
