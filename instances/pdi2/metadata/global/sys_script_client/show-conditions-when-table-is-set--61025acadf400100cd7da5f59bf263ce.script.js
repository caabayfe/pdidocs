function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }
    // If the table is now set, show condition lists based on audit type
	if (oldValue == '') {
		var auditType = g_form.getValue('audit_type').toString();
        CertificationTemplateUtils.showConditionLists(auditType);
    }
}
