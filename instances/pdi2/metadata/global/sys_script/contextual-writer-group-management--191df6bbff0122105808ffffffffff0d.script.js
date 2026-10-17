(function executeRule(current, previous /*null when async*/ ) {
    // Exit early if the 'active' status hasn't changed
    if (current.active == previous.active)
        return;

    // Adds active users with snc_internal and one additional role to the Contextual Script Writer group, removing them if inactive or criteria not met.
    SNC.ScriptingGovernanceUtils.updateScriptWriterGroupMembershipForUser(current.sys_id, current.active);

})(current, previous);
