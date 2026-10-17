function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue)
        g_form.getReference('variable_set', toggleFieldsBasedOnSetType);
    else {
        g_form.setDisplay('unique', false);
        g_form.setDisplay('hide_on_grid', false);
    }
}

function toggleFieldsBasedOnSetType(variableSet) {
    //unique field not supported for formatting, attachments and list collector variable types
    var nonSupportedTypes = ['11', '12', '14', '15', '17', '19', '20', '21', '24', '32', '33'];
    var isDisplayUniqueField = (variableSet.type === 'one_to_many') && (!nonSupportedTypes.includes(g_form.getValue('type')));
    var showHideOnGrid = (variableSet.type === 'one_to_many');

    g_form.setDisplay('unique', isDisplayUniqueField);
    g_form.setDisplay('hide_on_grid', showHideOnGrid);
}
