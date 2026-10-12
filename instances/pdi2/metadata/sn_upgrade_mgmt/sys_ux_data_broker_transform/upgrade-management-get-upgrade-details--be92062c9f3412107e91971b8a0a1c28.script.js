function transform(input) {
	const functionName = input.functionName;
	const sys_id = input.sys_id;
	const value = input.value;
    const field = input.field;
    const apiUtil = new global.UpgradeManagementApiUtil();

    if (apiUtil[functionName]) {
		if(field && value) return apiUtil[functionName](field, value);
		if(field) return apiUtil[functionName](field);
		if(sys_id) return apiUtil[functionName](sys_id,value);
        return apiUtil[functionName]();
    }
    return apiUtil.getUpgradeDetails();
}
