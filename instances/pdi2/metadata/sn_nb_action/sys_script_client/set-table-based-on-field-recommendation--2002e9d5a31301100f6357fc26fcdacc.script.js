function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var tableValue = g_form.getValue('table');
    if (isLoading && !newValue) { // new form
        return;
    }
    if (isLoading && newValue && tableValue) { // open saved record
        return;
    }
    g_form.getReference('field_recommendation', setTable);

    function setTable(fieldRecommendation) {
        g_form.setValue('table', fieldRecommendation.table || null);
    }

}
