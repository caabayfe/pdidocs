current.update();

// refresh data stream schema
if (current.type == 'data_stream') {
	var dsUtil = new sn_impex.GlideDataSourceUtility();
	dsUtil.refreshDataStreamSchema(current.sys_id);
}

var redirectStr = "sys_import.do?"; // the URI

redirectStr += "import_source=data_source"; // this is a Data Source import

redirectStr += "&sysparm_data_source=" + current.sys_id; // the sys_id of this

redirectStr += "&sysparm_tablename=" + current.import_set_table_name; // always create the same test

redirectStr += "&sysparm_recreate_table=false"; // we dont want to overwrite existing

redirectStr += "&sysparm_tablelabel=" + current.name;

redirectStr += "&create_new_module=ON";

redirectStr += "&sysparm_extends=sys_import_set_row"; // always extends this

redirectStr += "&selected_application=import_sets";

gs.setRedirect(redirectStr);
