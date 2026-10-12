//Use ONE IN to make sure table name gets set in new button from dictionary form
var tables = new GlideDBObjectManager.get().getAllExtensions(parent.name);
// check if the base table is in-scope
var joinedTables = GlideStringUtil.join(tables);
var baseTable = tables.get(0);
var selectedScopeId = gs.getCurrentApplicationId();
var tableRecord = new GlideRecord("sys_db_object");
tableRecord.addQuery("name", baseTable);
GlideAccessConditionBuilder.addScopeCondition(tableRecord, selectedScopeId);
tableRecord.query();
if(tableRecord.getRowCount() == 0) {
	// base table not in-scope so lets get an in-scope extending table to include in the front of the ONE IN conditon
	tableRecord = new GlideRecord("sys_db_object");
	tableRecord.addQuery("name", "IN", joinedTables);
	GlideAccessConditionBuilder.addScopeCondition(tableRecord, selectedScopeId);
	tableRecord.query();
	tableRecord.orderBy("name");
	if(tableRecord.next())
		joinedTables = tableRecord.name.toString() + ',' + joinedTables;
}
current.addQuery("name", "ONE IN", joinedTables);
current.addQuery("element", parent.element);
