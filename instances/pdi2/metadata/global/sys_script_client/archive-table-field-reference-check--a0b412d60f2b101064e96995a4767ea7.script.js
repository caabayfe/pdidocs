function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'ar_' + g_form.getValue('table'));
    gr.addQuery('internal_type', 'reference');
	gr.query();
    if (gr.hasNext()) {
        //archive table already exists for this table and has reference types
		g_form.setValue('retain_references',true);
		g_form.setDisabled('retain_references', true);
    } else {
		g_form.setValue('retain_references',false);
		g_form.setDisabled('retain_references', false);
    }
}
