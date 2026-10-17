(function executeRule(current, previous /*undefined when async or display*/ ) {
	var util = new StdChangeUtils();
	var appModGr = new GlideRecord('sys_app_module');
	if (appModGr.get(util.APP_MODULE_STD_CHG_CAT)) {
		appModGr.query = 'com.glideapp.servicecatalog_category_view.do?v=1&sysparm_parent=' +
			current.category;
		appModGr.update();
	}

	var interceptorGr = new GlideRecord('sys_wizard_answer');
	if (interceptorGr.get(util.INTERCEPTOR_STD_CHG)) {
		interceptorGr.target_url = 'com.glideapp.servicecatalog_category_view.do?v=1&sysparm_parent=' +
			current.category;
		interceptorGr.update();
	}

})(current, typeof previous != 'undefined' ? previous : null);
