var WorkflowAccess = {
    initialize: function() {
    },

    type: 'WorkflowAccess',

	userHasWorkflowAccess: function() {
		var user = gs.getUser();
		if (user.hasRole("maint"))
			return true;

		if (user.isXML() && (user.hasRole("admin") || user.hasRole("workflow_admin")))
			return true;
		
		return gs.hasRole("snc_required_script_writer_permission");
	}
};
