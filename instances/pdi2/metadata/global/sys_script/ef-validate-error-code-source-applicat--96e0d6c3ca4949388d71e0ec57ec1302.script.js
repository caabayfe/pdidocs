(function executeRule(current, previous /*null when async*/) {

    var errorCategoryId = current.getValue('error_category');
    var sourceAppId = current.getValue('source_application');

    if (!errorCategoryId || !sourceAppId) return;

    var catGr = new GlideRecord('sys_error_cat');
	
	// If the category is not found, it's a new record, so we can skip the validation
    if (catGr.get(errorCategoryId) && catGr.getValue('source_application') !== sourceAppId) {
        gs.addErrorMessage(sn_i18n.Message.getMessage(
            'error_framework',
            'Insert/Update Failed: Error Category "{category}" must belong to the selected Source Application.',
            { category: catGr.getDisplayValue() }
        ));
        current.setAbortAction(true);
    }

})(current, previous);
