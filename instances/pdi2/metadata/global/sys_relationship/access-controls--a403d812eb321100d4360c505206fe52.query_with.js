//Use ONE IN to make sure table name gets set in new button from dictionary form
var tables = new GlideDBObjectManager.get().getAllExtensions(parent.name);
// check if the base table is in-scope
var baseTable = tables.get(0);
var firstTable = baseTable;
var selectedScopeId = gs.getCurrentApplicationId();
var tableRecord = new GlideRecord("sys_db_object");
tableRecord.addQuery("name", baseTable);
GlideAccessConditionBuilder.addScopeCondition(tableRecord, selectedScopeId);
tableRecord.query();
if(tableRecord.getRowCount() == 0) {
	// base table not in-scope so lets get an in-scope extending table to include in the front of the ONE IN conditon
	tableRecord = new GlideRecord("sys_db_object");
	tableRecord.addQuery("name", "IN", GlideStringUtil.join(tables));
	GlideAccessConditionBuilder.addScopeCondition(tableRecord, selectedScopeId);
	tableRecord.query();
	tableRecord.orderBy("name");
	if(tableRecord.next())
		firstTable = tableRecord.name.toString();
}
var fieldName = parent.element.toString();
var tableFields = [];
tableFields.push(firstTable + '.' + fieldName);
var l = tables.size();
for(var i = 0; i < l; i++)
	tableFields.push(tables.get(i) + '.' + fieldName);

current.addQuery('name', 'ONE IN', GlideStringUtil.join(tableFields));
