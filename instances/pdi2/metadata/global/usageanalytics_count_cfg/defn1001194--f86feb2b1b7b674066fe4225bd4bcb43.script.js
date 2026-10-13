answer = JSON.stringify(constructCloudServiceAccountsJSON());

function constructCloudServiceAccountsJSON() {
	var result = {};
	
	if (!GlideTableDescriptor.isValid('cmdb_ci_cloud_service_account'))
		return result;
		
	if (!GlideTableDescriptor.isValid('cmdb_ci_logical_datacenter'))
		return result;
	
	var total_count = 0;
	var accountTypeCounts = {};
	
	var datacenterTypes = GlideDBObjectManager.get().getAllExtensions('cmdb_ci_logical_datacenter');
	for (var i = 0; i < datacenterTypes.size(); i++) {
		var datacenterType = datacenterTypes.get(i);
		accountTypeCounts[datacenterType] = 0;
	}
	
	var accountsGr = new GlideRecord('cmdb_ci_cloud_service_account');
	accountsGr.query();
	while (accountsGr.next()) {
		var accountType = accountsGr.getValue('datacenter_type');
		accountTypeCounts[accountType]++;
		total_count++;
	}
	
	result['cloud_service_accounts_by_datacenter'] = accountTypeCounts;
	result['count'] = total_count;
	
	return result;
}
