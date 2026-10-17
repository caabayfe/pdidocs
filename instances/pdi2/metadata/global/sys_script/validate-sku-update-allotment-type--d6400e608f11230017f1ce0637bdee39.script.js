(function executeRule(current, previous /*null when async*/) {
	
	current.app_name = current.table_ref.sys_scope.name;
	current.app_scope = current.table_ref.sys_scope.scope;
	
	var license = new SNSubscriptionUtils();
	license.isSubscriptionValidToMap(current, previous);

})(current, previous);
