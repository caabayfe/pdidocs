function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '' || !g_form.isNewRecord()) {
      return;
   }
	g_form.setValue("solution_name", getName(newValue));   
}
function getName(newValue) {
	var name = "ml_" + g_scratchpad.companyName + '_' + g_scratchpad.scope+'_'+getDomainName() +'_' + newValue.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

	while (name.indexOf("__") != -1) {
		name = name.replace(/__/g, "_");
	}

	// Replace any trailing underscores
	while (name != '' && name.charAt(name.length - 1) == '_') {
		name = name.substring(0, name.length - 1);
	}

	return name;
}
function getDomainName() {
	// The domain name prefix is by default global.
	var domain_name = "global";
	var domain_sys_id = g_form.getValue('sys_domain');

	if (domain_sys_id === null ) {
		return domain_name;
	}
	
	var gr = new GlideRecord("domain");
	gr.addQuery("sys_id",domain_sys_id);
	gr.query();
	if(gr.next()) {
		domain_name = gr.getValue("name").toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
	}
	
	return domain_name;
}
