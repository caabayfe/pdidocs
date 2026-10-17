(function executeRule(current, previous /*null when async*/) {
	gs.log('You can not add the glide.servlet.uri property in the database');
	gs.addErrorMessage(gs.getMessage("You cannot modify <b>{0}</b>. This property is controlled by ServiceNow", "glide.servlet.uri"));
	current.setAbortAction(true);
})(current, previous);
