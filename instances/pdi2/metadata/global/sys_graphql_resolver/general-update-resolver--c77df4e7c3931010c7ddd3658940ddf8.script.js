(function process(env) {	
	var sysId = env.getArguments().sysId;		
	var gr1 = new GlideRecordSecure('sys_ux_page_registry');
	if (gr1.get(sysId)) {
		gr1.setValue('title', env.getArguments().title);
		gr1.setValue('path', env.getArguments().path);
		gr1.update();	
		
		var gr2 = new GlideRecordSecure('sys_ux_app_config');	
			if (gr2.get(gr1.getValue('admin_panel'))) {
				gr2.setValue('description', env.getArguments().description);
				gr2.update();
			}

		return {
			title: gr1.title,
			description: gr2.description,
			path: gr1.path
		};
	}

	return null;
})(env);
