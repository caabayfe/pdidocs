function transform(input) {
    var tableName = input.table && input.table.trim();
	var sysId = input.sysId && input.sysId.trim();
    if (!tableName || !sysId) return {};
	return new sn_instance_clone.AdminCloneUtil().getCloneProfilesForDefinition(tableName,sysId);
}
