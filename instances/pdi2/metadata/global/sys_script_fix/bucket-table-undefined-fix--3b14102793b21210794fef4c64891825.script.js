var gr = new GlideRecord("sys_analytics_app");
gr.addQuery('application_name','undefined');
gr.addQuery('table_name','sp_portal');
gr.query();

while(gr.next()) {
	var portalRecord = new GlideRecord("sp_portal");
	portalRecord.addQuery('sys_id', gr.getValue('app_sys_id'));
	portalRecord.query();
	if(portalRecord.next()) {
	    gr.setWorkflow(false);
        gr.autoSysFields(false);
		gr.setValue('application_name',portalRecord.getValue('title'));
		gr.update();
	}
}
