(function executeRule(current, previous /*null when async*/) {

	var auditHelper = new UserSetAuditHelper();
	
	auditHelper.recordUserSetDeleted(current);

})(current, previous);
