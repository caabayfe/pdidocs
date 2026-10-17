function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {  
        return;
    }
    var entityName = g_form.getDisplayBox('attached_entity').value;
    if (!entityName) {
        g_form.setValue("change_name", "");
    } else {
        g_form.setValue("change_name", entityName + " Attached");
    }
}
