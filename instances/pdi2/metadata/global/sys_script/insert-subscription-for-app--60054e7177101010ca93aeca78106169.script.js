(function executeRule(current, previous /*null when async*/) {
	
	if (current.allotment_type == '2') return;//for grandfather license - do not map license for other tables in the same application

	var licenseReferenceTable = SNC.UsageAnalyticsScriptUtils.canRouteToEMS() ? current.subscription_entitlement : current.license;

	var skipReload = current.allotment_type == '3';
	SNC.UACTScriptUtils.updateSubscription(current.table_ref.sys_scope, licenseReferenceTable, current.allotment_type, skipReload);

})(current, previous);
