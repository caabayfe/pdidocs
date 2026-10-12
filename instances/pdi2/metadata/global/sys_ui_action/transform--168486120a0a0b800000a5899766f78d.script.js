current.update();

var robustTransformerRec = new GlideRecord('sys_robust_import_set_transformer');
robustTransformerRec.addActiveQuery();
robustTransformerRec.addQuery('source_table', current.table_name);
robustTransformerRec.query();

if (robustTransformerRec.next()) {
	gs.setRedirect("run_import_rte.do?sysparm_set=" + current.sys_id);
} else{
	var mgr = new GlideRecord("sys_transform_map");
	mgr.addQuery("source_table", current.table_name);
	mgr.query();
	if (mgr.next()) {
		gs.setRedirect("run_import.do?sysparm_set=" + current.sys_id);
	} else {
		gs.addInfoMessage("Please create a transform map first");
		gs.setRedirect("sys_transform_map.do?sys_id=-1&sysparm_query=source_table=" + current.table_name);
	}
}
