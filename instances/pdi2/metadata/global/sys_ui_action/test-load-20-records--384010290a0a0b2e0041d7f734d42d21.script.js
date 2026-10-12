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

redirectStr += "&sysparm_default_state=test";

redirectStr += "&max_rows=20"; // change this number if you want more test rows

var info = "Test loading 20 rows, please review the list below - ";

info += "<a style='text-decoration:underline;color:blue' href=sys_data_source.do?sys_id=" + current.sys_id + ">Return to data source</a><img width='3' src='images/s.gif'/>";

gs.addInfoMessage(info);

gs.setRedirect(redirectStr);
