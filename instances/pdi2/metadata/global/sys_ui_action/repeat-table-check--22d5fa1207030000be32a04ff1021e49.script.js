var gr = new GlideRecord('ha_table_check');
gr.table_name = current.table_name;
gr.target_database = current.target_database;
var sysId = gr.insert();

gs.setRedirect("ha_table_check.do?sys_id=" + sysId);
