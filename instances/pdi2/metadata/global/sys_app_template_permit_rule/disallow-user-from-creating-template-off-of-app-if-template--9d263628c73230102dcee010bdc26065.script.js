(function (/*String */ sysId) {
	
	// Only prevent templatization for templates "created from scratch" because when those are being 
	// generated, the existing template will be overridden. In this case, we don't want to override the 
	// old template as it's being executed and thus we will deny templatization. For snapshot templates, 
	// we never need to disallow templatization if existing versions are being executed.
	
	if (gs.nil(sysId)) {
		return 'deny'; // deny templatization b/c app sys_id is blank
	}
	
	var sysApp = new GlideRecord("sys_app");
	if (!sysApp.get(sysId)) {
		return 'deny'; // deny templatization b/c app could not be found
	}
	
	// We need to check if this app has a sys_app_info record - this will tell us that the template
	// was created from scratch and we should move forward with figuring out if we need to block 
	// templatization.
	
	var sysAppInfo = new GlideRecord("sys_app_info");
	var hasSysAppInfoRecord = sysAppInfo.get("sys_scope", sysId);
	
	if (!hasSysAppInfoRecord) {
		// we are not in the "create from scratch template" case don't deny templatization
		return 'allow'; 
	}
	
	// ensure the sys_app_info record has a "origin: create_from_scratch" property which tells you that 
	// the application assoicated with this record is used for a "create from scratch template"
	var properties = sysAppInfo.getValue("properties");
	try {
		var propertiesObj = JSON.parse(properties);
		if (!propertiesObj.hasOwnProperty("origin") && properties["origin"] != "create_from_scratch") {
			// some random value is in properties and this record is not used for a 
			// "create from scratch template"
			return 'allow';
		}
	} catch (e) {
		// the sys_app_info.properties column does not allow the user to store bad JSON, this
		// should never happen but is a fail-safe
		return 'allow'; 
	} 
	
	// Check if there is an existing mapplication record that correlates the application with an 
	// existing template (sys_mapplication records will only be generated for "create from scratch 
	// templates" so that the existing template is overridden on template execution).
	// This will allow us to figure out if there are any current template executions going on for that
	// template.
	
	var sysMapplication = new GlideRecord("sys_mapplication");
	sysMapplication.addQuery("referenced_table", "sys_app");
	sysMapplication.addQuery("source_id", sysId);
	sysMapplication.query();
	sysMapplication.setLimit(1);
	var hasSysMapplicationRecord = sysMapplication.next();
	
	if (!hasSysMapplicationRecord) {
		// we are not in the "create from scratch template" case OR the "create from scratch template" 
		// is being initially generated don't deny templatization b/c there can't be any active executions.
		return 'allow';
	}
	
	// We are trying to re-templatizing an application for a "create from scratch template",
	// move forward with figuring out if we need to block templatization.
	var templateAppSysId = sysMapplication.getValue("template");
	
	if (gs.nil(templateAppSysId)) {
		// template doesn't exist on the mapplication record, don't deny templatization
		// this should never happen, but is a fail-safe
		return 'allow';
	}
	
	var sysAppTemplate = new GlideRecord("sys_app_template");
	var hasTemplate = sysAppTemplate.get("sys_scope", templateAppSysId);
	
	if (!hasTemplate) {
		// Template's app exists but not the actual template record don't deny templatization 
		// b/c maybe they're making the template for the first time.
		return 'allow';
	}
	
	var sysAppTemplateInstance = new GlideRecord("sys_app_template_instance");
	sysAppTemplateInstance.addQuery("template", sysAppTemplate.getUniqueValue());
	sysAppTemplateInstance.addQuery("state", "IN", ["running", "pending"]);
	sysAppTemplateInstance.setLimit(1);
	sysAppTemplateInstance.query();
	
	// If there are active template instances, deny; otherwise allow.
	if (sysAppTemplateInstance.hasNext()) {
		return 'deny';
	}
	
	return 'allow';
	
})(sysId);
