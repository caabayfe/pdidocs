(function executeRule(current, previous /*null when async*/) {

	var operation = current.operation();
	var auditHelper = new UserSetAuditHelper();
	
	if (operation == "insert") 
		auditHelper.recordUserSetCreated(current);
	else if (operation == "update")
		auditHelper.recordUserSetUpdated(current, previous);

})(current, previous);
