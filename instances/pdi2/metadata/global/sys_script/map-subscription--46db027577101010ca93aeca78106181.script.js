(function executeRule(current, previous /*null when async*/) {

	current.app_name = current.table_ref.sys_scope.name;
	current.app_scope = current.table_ref.sys_scope.scope;
	new SNSubscriptionUtils().mapSubscription(current);

})(current, previous);
