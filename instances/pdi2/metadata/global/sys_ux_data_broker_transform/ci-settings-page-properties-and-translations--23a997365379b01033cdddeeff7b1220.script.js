function transform(input) {
    var tableName = input.table && input.table.trim();
    if (!tableName) return {};
	var sysId = input.sysId;
	return new CIRecordPagePropsUtil().getPageProps(tableName, sysId, input.optional_query);

}
