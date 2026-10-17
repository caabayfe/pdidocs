var tc = new GlideRecord("ha_table_check");
tc.initialize();
tc.setValue("table_name",current.table_name.toString());
tc.setValue("target_database",current.clone.ha_database.sys_id.toString());
gs.addInfoMessage("Table check started on table '" + current.table_name.toString() + "'");
var tcId = tc.insert();
gs.setRedirect("ha_table_check.do?sys_id=" + tcId);
