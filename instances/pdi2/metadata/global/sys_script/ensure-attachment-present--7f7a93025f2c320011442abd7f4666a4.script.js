(function executeRule(current, previous /*null when async*/) {
	//Check for attachment presence
	var attachment = new GlideRecord("sys_attachment");
	if (!attachment.get(current.script_attachment)) {
		gs.clearMessages();
		gs.addErrorMessage(gs.getMessage("'{0}' attachment is missing, please attach script file", current.name));
	}
})(current, previous);
