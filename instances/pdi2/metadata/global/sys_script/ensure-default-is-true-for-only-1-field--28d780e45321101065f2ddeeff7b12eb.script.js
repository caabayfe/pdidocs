(function executeRule(current, previous /*null when async*/) {
	var gr;
	
	if(current.operation() == "delete" && current.default_content) {
		gr = new GlideRecord("help_content");
		gr.addQuery("guidance_step", current.guidance_step);
		gr.orderByDesc("sys_updated_on");
		gr.query();
		
		if(gr.hasNext()) {
			gr.next();
			gr.default_content = "1";
			gr.update();
		}
	} else if (current.default_content == true && current.default_content.changes()) {
		gr = new GlideRecord("help_content");
		gr.addQuery("guidance_step", current.guidance_step);
		gr.addQuery("default_content", "1");
		gr.query();

		while(gr.next()) {
			if(gr.getUniqueValue() !== current.sys_id.toString()) {
				gr.setValue("default_content", "0");
				gr.update();
			}
		}
	}

})(current, previous);
