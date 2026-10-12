if (!current.canWrite()) {
	gs.addErrorMessage(gs.getMessage("You are not authorized to edit records in {0}", current.getTableName()));
	action.setReturnURL(current);
	action.setRedirectURL(current);
} else {
	current.update();
	var uri = action.getGlideURI();
	var path = uri.getFileFromPath();
	uri.deleteMatchingParameter("sys_");
	uri.deleteMatchingParameter("ni.");
	uri.deleteMatchingParameter(current.getTableName());
	uri.set('sysparm_m2m_ref', current.getTableName());
	uri.set('sysparm_stack', 'no');
	action.setReturnURL(current);
	action.setRedirectURL(uri.toString('sys_m2m_template.do'));
}
