function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    g_form.setValue("relation_type", "");
    var parentEntity = g_form.getReference('parent_entity');
    var parentEntitySource = parentEntity.source_type;
    var currentEntitySource = g_form.getValue('source_type');
    if (parentEntitySource == 'EXTERNAL_DATA' && currentEntitySource == 'EXTERNAL_DATA') {
        g_form.addErrorMessage(getMessage("Both parent and child table configuration with source type as External Data is not allowed"));
    }
	if (parentEntitySource == 'ARCHIVED_DATA' && currentEntitySource == 'ARCHIVED_DATA') {
        g_form.addErrorMessage(getMessage("Both parent and child table configuration with source type as Archived Data is not allowed"));
    }
}
