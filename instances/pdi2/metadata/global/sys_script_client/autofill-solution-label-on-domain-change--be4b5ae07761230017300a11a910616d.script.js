//PRB1313741 - Handle change in the domain name and include it in the solution name
function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }   
	g_form.setValue("solution_name", getSolutionLabel());

}

function getSolutionLabel() {
	var solutionLabel = g_form.getValue("solution_label");
	var solutionName = "ml_" + g_scratchpad.companyName + '_' + getDomainName() +'_' + solutionLabel.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');

	while (solutionName.indexOf("__") != -1) {
		solutionName = solutionName.replace(/__/g, "_");
	}

	// Replace any trailing underscores
	while (solutionName != '' && solutionName.charAt(solutionName.length - 1) == '_') {
		solutionName = solutionName.substring(0, solutionName.length - 1);
	}

	return solutionName;
}

function getDomainName() {
	// The domain name prefix is by default global.
	var domain_name = "global";
	var domain_sys_id = g_form.getValue('sys_domain');

	if (domain_sys_id === null ) {
		return domain_name;
	}
	
	var gr = new GlideRecord("sys_domain");
	gr.addQuery("sys_id",domain_sys_id);
	gr.query();
	if(gr.next()) {
		domain_name = gr.getValue("name").toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
	}
	
	return domain_name;
}
