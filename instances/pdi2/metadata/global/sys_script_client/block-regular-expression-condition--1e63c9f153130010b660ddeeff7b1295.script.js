function onSubmit() {
	var condition = g_form.getValue('condition');
	if(condition.indexOf('MATCH_RGX') > -1) {
		g_form.addErrorMessage("The operator to match the regular expressions [matches regex] is no longer supported when setting a condition for clone data preservation.");
		return false;
	}
	return true;
}
