(function executeRule(current, previous /*null when async*/) {
	new AttachmentGranularUtils().isValid(current.getValue("hidden_attachment_sources"));	
})(current, previous);
