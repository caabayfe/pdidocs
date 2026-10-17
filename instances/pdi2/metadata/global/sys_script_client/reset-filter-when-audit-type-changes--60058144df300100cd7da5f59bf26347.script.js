function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }
	g_form.setValue('filter', '');
	var table = g_form.getValue('table').toString();
	var auditType = g_form.getValue('audit_type').toString();
	if (table != '')
		CertificationTemplateUtils.showConditionLists(auditType);
}
