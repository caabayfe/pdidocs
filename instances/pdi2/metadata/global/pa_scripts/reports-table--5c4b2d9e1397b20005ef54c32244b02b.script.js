var getTableSysID = function(tableName) {
	var gr = new GlideRecord('sys_db_object');
	gr.get('name', tableName);
	return gr.getUniqueValue();
};
getTableSysID(current.table);
