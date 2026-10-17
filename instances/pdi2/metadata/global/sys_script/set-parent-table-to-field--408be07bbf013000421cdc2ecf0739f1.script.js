// set the name of the dictionary record to the valid name of the parent
if(parent.operation() == 'insert') {
	current.name = new TableUtils().getValidTableName(parent.sys_scope.toString(), parent.name.toString());
} else {
	var parentRecord = new GlideRecord(parent.getTableName());
	parentRecord.get(parent.sys_id);
	current.name = parentRecord.name;
}
