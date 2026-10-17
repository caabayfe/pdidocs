function getConfigsAndMetadata(input) {
    const {tableName, ruleSysID, ruleType} = input;

    if (!tableName)
        return;
	
	const isEditFlow = !!(ruleSysID || ruleType);

    const ruleManagementEnabled = JSON.parse(gs.getProperty("com.glide.data_management.console.rule_management_enabled", false));

    return {
        currentScope: new DMCAppScopeUtils().getCurrentScope(),
        tableMetadata: new TableMetadataLoader().getMetadata(tableName, isEditFlow),
        dateTimeFormat: {
            userDateTimeFormat: gs.getSession().getDateTimeFormat(),
            timeZoneOffset: new GlideDateTime().getTZOffset()
        },
        ruleManagementEnabled: ruleManagementEnabled
    };
}
