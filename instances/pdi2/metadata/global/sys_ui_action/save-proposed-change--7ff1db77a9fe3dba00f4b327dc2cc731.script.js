(function(current, action, RP) {
	var taskciId = RP.getParameterValue("sysparm_changeset");
	var base = new SNC.CMDBUtil();
	base.baselineProposedChangesGenDIFF(current, taskciId);
	var taskci = new GlideRecord("task_ci");
	if (taskci.get(taskciId)) {
		taskci.manual_proposed_change = true;
		taskci.update();
	}
	action.setRedirectURL("chg_close_proposed_change_popup.do");
})(current, action, RP);
		
