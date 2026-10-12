function onCondition() {
    try {
        var fieldValue = g_form.getValue('field');
        if (fieldValue != '') {
            var fieldLabel = g_form.getOption('field', fieldValue);
            if (fieldLabel != null && fieldLabel != "") {
                fieldLabel = fieldLabel.text;
                g_form.setValue('change_name', fieldLabel + ' changed');
            }
        }
    } catch (error) {
        jslog("Error in UI Policy 'Show/Populate change name field'", error);
    }
}
