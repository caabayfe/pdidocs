(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_notification_content');
	gr.addQuery('notification', current.notification);
	gr.addEncodedQuery('sys_class_name=sys_notification_va_content^ORsys_class_name=sys_notification_va_content_messaging');
	gr.query();
	
	if (gr.hasNext()) {
		g_scratchpad.vaContent = true;
	}
})(current, previous);
