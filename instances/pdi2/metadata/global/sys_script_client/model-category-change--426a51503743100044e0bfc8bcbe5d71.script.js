function onChange(control, oldValue, newValue, isLoading) {
	if (isLoading || (!isLoading && (!newValue || newValue == ''))) {
		showHideBundleCheckbox();
		return;
	}

	var ga = new GlideAjax('ModelCategoryCheck');
	ga.addParam('sysparm_name', 'checkCategory');
	ga.addParam('sysparm_ids', newValue);
	ga.getXMLAnswer(function(answer) {
		if (answer > 1) {
			alert(getMessage("Cannot pick categories with different asset creation options"));
			g_form.setValue('cmdb_model_category', oldValue);
			return false;
		}
		showHideBundleCheckbox();
	});
}

function showHideBundleCheckbox() {
	// If bundle model category
	if (g_form.getValue('cmdb_model_category').indexOf('94028b6a1b5310002502fbcd2c071315') !== -1) {
		g_form.setDisplay('bundle_assets', true);
	} else {
		g_form.setDisplay('bundle_assets', false);
	}
}
