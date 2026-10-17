(function refineQuery(current, parent) {
	current.addQuery('logical_table_name', parent.table_name);
	current.addQuery('col_name_string', GlideStringUtil.join(parent.column_names));
})(current, parent);
