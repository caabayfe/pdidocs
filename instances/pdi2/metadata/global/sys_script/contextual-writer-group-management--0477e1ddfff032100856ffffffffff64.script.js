(function executeRule(current, previous /*null when async*/ ) {
    if (current.role.nil() || current.group.nil())
        return;
    var groupGR = current.group.getRefRecord();
    if (!groupGR.isValidRecord()) {
    	return;
    }
    var grMember = new GlideRecord('sys_user_grmember');
    grMember.addQuery('group', groupGR.getUniqueValue());
    grMember.query();
    while (grMember.next()) {
    	var userGR = grMember.user.getRefRecord();
        // Adds active users with snc_internal and one additional role to the Contextual Script Writer group,
        // removing them if inactive or criteria not met.
        SNC.ScriptingGovernanceUtils.updateScriptWriterGroupMembershipForUser(userGR.getUniqueValue(), userGR.active);
    }
})(current, previous);
