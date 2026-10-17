function transform(input) {
	var functionName = input.functionName;
	var sys_id = input.sys_id;
	var value = input.value;
    var field = input.field;
    var apiUtil = new sn_upgrade_mgmt.UpgradeManagementApiUtilOverview();

    if (apiUtil[functionName]) {
		if(field && value) return apiUtil[functionName](field, value);
		if(field) return apiUtil[functionName](field);
		if(sys_id) return apiUtil[functionName](sys_id,value);
        return apiUtil[functionName]();
    }
}
