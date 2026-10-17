(function executeRule(current, previous /*null when async*/) {
	GlideLicensingUtils.deleteDSUserReport(current.sys_id, current.name);

	var auditHelper = new SubscriptionAuditHelper();
	
	auditHelper.recordSubscriptionDeleted(current);

})(current, previous);
