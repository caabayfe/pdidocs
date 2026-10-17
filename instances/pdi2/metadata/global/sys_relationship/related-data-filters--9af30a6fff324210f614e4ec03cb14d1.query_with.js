(function refineQuery(current, parent) {

    // Add your code here, such as current.addQuery(field, value);
    current.addQuery('sys_id', '!=', parent.sys_id);
	current.addQuery('table_name', parent.table_name);

})(current, parent);
