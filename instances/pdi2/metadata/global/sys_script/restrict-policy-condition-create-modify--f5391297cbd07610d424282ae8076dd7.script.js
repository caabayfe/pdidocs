(function executeRule(current, previous /*null when async*/ ) {

    if (gs.hasRole("adaptive_auth_admin"))
        return;

    /*adaptive_auth_policy_admin can only create/modify policy condition for the policy created by them
	  and can view policy conditions for all the policies
	*/
    var authPolicyName = current.decision_table.name;
    /*adaptive_auth_policy_admin cannot modify Session Validation Policy.
     The decision table name corresponding to Sessionn Validation Policy is IP Address Range Binding Policy.
     Since decision table name is different from corresponding policy name, we need to handle it separately
    */
    if (authPolicyName == "IP Address Range Binding Policy") {
        gs.addErrorMessage(gs.getMessage("You do not have the permission to modify this policy"));
        current.setAbortAction(true);
    }
    var gr = new GlideRecord('sys_authentication_policy');
    gr.addQuery('name', authPolicyName);
    gr.query();
    if (gr.next()) {
        var createdBy = gr.getValue('sys_created_by');
        var currentUser = gs.getUserName();
        if (createdBy != currentUser) {
            gs.addErrorMessage(gs.getMessage("Cannot create or modify policy " + authPolicyName + " which is not created by " + currentUser));
            current.setAbortAction(true);
        }
    }


})(current, previous);
