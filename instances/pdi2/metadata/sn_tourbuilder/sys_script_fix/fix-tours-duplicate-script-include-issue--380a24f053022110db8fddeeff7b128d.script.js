	var VALID_SYS_ID = '4f359da087733200b38c0f4c59cb0b78';
	var gr = new GlideRecord("sys_script_include");
	gr.addQuery("api_name", "sn_tourbuilder.GTAutoLaunchController");
	gr.query();
	while(gr.next()) {
		if(gr.getUniqueValue() !== VALID_SYS_ID) {
			gs.info(gr.getUniqueValue());
			gr.active = "false";
			gr.setWorkflow(false);
			gr.autoSysFields(false);
			gr.update();
		} else {
			if(!!gr.getValue('active')) {
				gr.active = "true";
				gr.setWorkflow(false);
				gr.autoSysFields(false);
				gr.update();
			}
		}
	}

	
