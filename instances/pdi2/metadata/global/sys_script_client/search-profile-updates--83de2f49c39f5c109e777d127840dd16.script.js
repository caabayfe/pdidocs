function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}
	if (g_form.isNewRecord()) {
		doComplete();
		return;
	}
	
	if (newValue === g_scratchpad.prev_profile) return;
	
	//Confirm Modal to warn users of losing NavTab configs
	var dialog = new GlideModal('glide_modal_confirm', true, 400);
	dialog.setTitle(getMessage('Confirmation'));
	dialog.setPreference('body', getMessage("Are you sure you want to change the Search Profile? Doing so will remove all configurations made to the Source Facet Bucket."));
	dialog.setPreference('focusTrap', true);
	dialog.setPreference('onPromptComplete', doComplete);
	dialog.setPreference('onPromptCancel', doCancel);
	dialog.render();
	return;
	
	function doComplete() {
		validateExistingFacets();
		getNavTabs();
		g_scratchpad.prev_profile = newValue;
	}
	
	function doCancel() {
			g_form.setValue('search_profile', g_scratchpad.prev_profile);
	}

	function validateExistingFacets() {
		if (g_form.isNewRecord()) return;
		var ga = new GlideAjax('ValidateFacets');
		ga.addParam('sysparm_name', 'validate_existing_records');
		ga.addParam('sysparm_search_profile', newValue);
		ga.addParam('sysparm_search_config', g_form.getUniqueValue());
		ga.getXMLAnswer(update);

		function update(answer) {
			var invalidFacets = JSON.parse(answer);
			g_form.clearMessages();

			//Display warning if any invalid facets
			if (invalidFacets.length > 0) {
				g_form.addErrorMessage(getMessage("Warning. The following search facets are invalid. Please either remove the facet record or update the search sources in the Search Profile to include the table these facets are mapped to."));
				g_form.addErrorMessage(answer.slice(1, answer.length-1).replaceAll(/",/g, "\", "));
			}
			return;	
		}
	}
	
	function getNavTabs() {
		//Call script includes to get Search Sources associated with new Value - glideAjax		
		var ga = new GlideAjax('UpdateNavTabRecords');
		ga.addParam('sysparm_name', 'updateRecords');
		ga.addParam('sysparm_search_profile', newValue);
		ga.addParam('sysparm_search_config', g_form.getUniqueValue());
		ga.getXML(updateTabFilterList);


		function updateTabFilterList(response) {
			//Refresh Related list
			var NavTabList = GlideList2.get(g_form.getTableName() + '.sys_search_filter.search_context_config');
			NavTabList.refresh();
		}
	}
  
}
