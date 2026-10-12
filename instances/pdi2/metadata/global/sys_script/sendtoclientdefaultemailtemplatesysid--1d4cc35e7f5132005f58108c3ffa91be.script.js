(function executeRule(current, previous /*null when async*/) {

	var defaultTemplateSysId = gs.getProperty('glide.notification.email.default_template_sys_id');

	// Make sure the record exists before returning it
	var templateGR = new GlideRecord('sysevent_email_template');
	if (defaultTemplateSysId && templateGR.get(defaultTemplateSysId))
		g_scratchpad.defaultEmailTemplateSysId = defaultTemplateSysId;
	else 
		g_scratchpad.defaultEmailTemplateSysId = "";
})(current, previous);
