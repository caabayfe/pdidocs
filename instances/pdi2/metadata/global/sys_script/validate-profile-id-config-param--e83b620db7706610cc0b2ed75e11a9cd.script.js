(function executeRule(current, previous /*null when async*/ ) {
    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage("'mid_profile_id' config parameter cannot be modified directly. Modify the Profile ID field on the MID Server form instead"));
})(current, previous);
