(function executeRule(current, previous /*null when async*/ ) {
    if (current.user.nil())
        return;
    var userGR = current.user.getRefRecord();
    if (userGR.isValidRecord()) {
        // Adds active users with snc_internal and one additional role to the Contextual Script Writer group, 
        // removing them if inactive or criteria not met.
        SNC.ScriptingGovernanceUtils.updateScriptWriterGroupMembershipForUser(userGR.getUniqueValue(), userGR.active);
    }
})(current, previous);
