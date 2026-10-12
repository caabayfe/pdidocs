function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || g_form.getValue("field") === '') {
        return;
    }
    newValue = newValue == 'true';
    if (!newValue) {
        g_form.setValue("change_name", '');
    } else if (newValue) {
        var field = g_form.getValue("field");
        var newField = field.split(".");
        if (newField.length < 3) {
            showLoadingDialog();
            jQuery(document).ready(function() {
                setTimeout(updateGroupActivityName, 2000);
            });
        } else if (newField.length > 2) {
            g_form.clearValue("change_name");
            g_form.setMandatory("change_name", true);
        }
    }
}

function updateGroupActivityName() {
    if (g_form.getValue("field") !== '') {
        var dotWalkField = g_form.getDisplayBox('field').innerHTML;
        g_form.setValue('change_name', dotWalkField + ' changed');
    }
    hideLoadingDialog();
}
