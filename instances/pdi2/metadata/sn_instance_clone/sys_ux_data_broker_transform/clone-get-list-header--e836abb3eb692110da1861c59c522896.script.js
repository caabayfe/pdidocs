function transform(input) {
    var tableName = input.table && input.table.trim();
	var filter = input.filter && input.filter.trim();
    if (!tableName) return {};
	return new sn_instance_clone.AdminCloneUtil().getCloneProfileDefinitionDetails(tableName,filter);
}
