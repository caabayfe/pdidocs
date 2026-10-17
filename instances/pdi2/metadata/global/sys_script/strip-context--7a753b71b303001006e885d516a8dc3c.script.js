(function executeRule(current, previous /*null when async*/) {
	
	//from a message with comments, remove the comments
	// "This item costs {value ? integer - currency}" becomes "This item costs {value}"

	var commentedMessage = current.getValue("commented_message");
	var strippedMessage = sn_i18n.Message.stripComments(commentedMessage);
	current.setValue("message", strippedMessage);

})(current, previous);
