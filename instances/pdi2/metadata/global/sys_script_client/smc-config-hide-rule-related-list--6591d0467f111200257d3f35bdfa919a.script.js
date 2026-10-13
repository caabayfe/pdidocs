function onChange(control, oldValue, newValue, isLoading) {  
	
	if (!g_form.hasField('model'))
		return;
 
	if (!newValue)
		return;
	
	if (newValue === '1') {
		g_form.showRelatedList("sa_rca_smc_rule.config_id");
	} else if (newValue === '2') {
		g_form.hideRelatedList("sa_rca_smc_rule.config_id");
	}
		
}
