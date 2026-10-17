function showSchemaMapOnClick() {
	var tableName = g_form.getValue('table');
	console.log(tableName);
	if (!tableName || tableName === '') return;
	var url = 'generic_hierarchy_erd.do?' +
			'sysparm_attributes=table_history=,table=' + tableName + ',show_internal=true,' +
			'show_referenced=true,show_referenced_by=true,show_extended=true,' +
		    'show_extended_by=true,table_expansion=,spacing_x=60,spacing_y=90,nocontext';
	var w = getTopWindow();
	w.popupOpenFocus(url, 'show_schema_map', 950, 700, '', false, false);
}
