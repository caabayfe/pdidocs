function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (g_form.getValue('variable_set')) {
        g_form.getReference('variable_set', hideFieldsForNonSupportedTypesOnMRVS);
    }
}

function hideFieldsForNonSupportedTypesOnMRVS(variableSet) {
	//unique field not supported for formatting, attachments and list collector variable types
	var nonSupportedTypes = ['11','12','14','15','17','19','20','21','24','32','33'];
    var isFieldSupportedForVariableType = (variableSet.type === 'one_to_many') && (!nonSupportedTypes.includes(g_form.getValue('type')));
    g_form.setDisplay('unique', isFieldSupportedForVariableType);
	g_form.setDisplay('hide_on_grid', isFieldSupportedForVariableType);

}
