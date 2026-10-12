function transform(input) {
    var tableName = input.table && input.table.trim();
    if (!tableName) return {};
	var sysId = input.sysId;
	return new global.ListAndRecordPagePropsUtil().getPageProps(tableName, sysId, input.optional_query, input.view);

}
