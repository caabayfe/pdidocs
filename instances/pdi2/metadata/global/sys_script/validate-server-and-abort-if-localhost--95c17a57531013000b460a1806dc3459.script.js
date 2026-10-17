(function executeRule(current, previous /*null when async*/) {
	//result is a JSON Object containing message if the hostname is not valid
	var result = SNC.EmailHostValidator.validate(current.getValue("server"));
	if (!result.isValid) {
		var escapedServerValue = GlideStringUtil.escapeHTML(current.getValue("server"));
		gs.addInfoMessage(gs.getMessage("Host name {0} is not allowed", escapedServerValue));
	}
})(current, previous);
