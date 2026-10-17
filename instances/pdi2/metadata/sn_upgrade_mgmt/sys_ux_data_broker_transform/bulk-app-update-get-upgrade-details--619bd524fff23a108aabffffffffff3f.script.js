function transform(input) {
    const apiUtil = new global.UpgradeManagementApiUtil();
    const utilFunc = apiUtil[input.functionName];

    if (typeof utilFunc === 'function') {
        if (input.field && input.value) return utilFunc(input.field, input.value);
        if (input.field) return utilFunc(input.field);
        if (input.sys_id) return utilFunc(input.sys_id, input.value);
        return utilFunc();
    }

    return apiUtil.getUpgradeDetails();
}
