function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(isLoading || newValue === '')
		return;

	if (newValue !== '')
		g_form.getReference("parent", toggleIsMain);
}

function toggleIsMain(parent) {
	var cat = parent.cmdb_model_category.toString();
	if (cat.indexOf("94028b6a1b5310002502fbcd2c071315") !== -1) { //Bundle model category
		g_form.setDisplay("master", true);
	} else {
		g_form.setValue("master", false);
		g_form.setDisplay("master", false);
	}
}
