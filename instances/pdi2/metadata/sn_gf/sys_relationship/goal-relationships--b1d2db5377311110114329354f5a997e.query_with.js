(function refineQuery(current, parent) {
	
	current.addQuery('table_name', parent.getTableName());
    current.addQuery('entity_id', parent.sys_id);

})(current, parent);
