(function executeRule(current, previous /*null when async*/ ) {

    if (gs.hasRole("adaptive_auth_admin"))
        return;

    /*adaptive_auth_policy_admin can only create/modify policy input for the policy created by them
	  and can view policy inputs for all the policies
	*/
    var authPolicyName = current.policy.name;
    var currentUser = gs.getUserName();
    if (current.policy.sys_created_by != currentUser) {
        gs.addErrorMessage(gs.getMessage("Cannot create or modify policy " + authPolicyName + " which is not created by " + currentUser));
        current.setAbortAction(true);
    }


})(current, previous);
