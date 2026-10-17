//Delete all choices related to this choice set
		var gr = new GlideRecord("sys_choice");
		gr.addQuery("name", current.getValue("name"));
		gr.addQuery("element", current.getValue("element"));
		gr.query();
		gr.deleteMultiple();
