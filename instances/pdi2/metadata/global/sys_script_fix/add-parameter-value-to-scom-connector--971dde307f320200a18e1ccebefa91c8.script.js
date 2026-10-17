var gr = new GlideRecord("em_connector_definition");
gr.addQuery("name", "SCOM");
gr.query();
if (gr.next()){
	
	var scomDef = gr.getValue("sys_id");
	
	var grInst = new GlideRecord("em_connector_instance");
	grInst.addQuery("connector_definition", scomDef);
	grInst.query();
	while (grInst.next()){
		var grVal = new GlideRecord("em_connector_instance_value");
		grVal.addQuery("connector_instance", grInst.getValue("sys_id"));
		grVal.addQuery("name", "scom_initial_sync_in_days");
		grVal.query();
		if (!grVal.next()){
			grVal.connector_instance = grInst.sys_id;
			grVal.name = "scom_initial_sync_in_days";
			grVal.value = "7";
			grVal.insert();
		}		
	}
}
