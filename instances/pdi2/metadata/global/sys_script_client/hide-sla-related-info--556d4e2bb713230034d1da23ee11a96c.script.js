function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	function showEverything() {
		g_form.setVisible("process_non_contractual_slas", true);
		g_form.showRelatedList("contract_rel_contract_sla");
		g_form.showRelatedList("contract_rel_ci");
		g_form.showRelatedList("contract_rel_user");
		g_form.showRelatedList("contract_rel_group");
		g_form.showRelatedList("contract_rel_location");
	}
	
	function hideEverything() {
		g_form.setVisible("process_non_contractual_slas", false);
		g_form.hideRelatedList("contract_rel_contract_sla");
		g_form.hideRelatedList("contract_rel_ci");
		g_form.hideRelatedList("contract_rel_user");
		g_form.hideRelatedList("contract_rel_group");
		g_form.hideRelatedList("contract_rel_location");
	}
   
	var classSysIds = g_scratchpad.attach_sla_class_ids || [];
	if (classSysIds.indexOf(newValue) !== -1)
		showEverything();
	else
		hideEverything();
}
