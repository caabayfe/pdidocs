function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || g_form.getValue("type") !== 'DEFAULT') {
        return;
    }
    var field = g_form.getValue("field");
    var activityField = field.split(".");
    if (activityField.length > 1 && activityField.length < 3) {
        showLoadingDialog();
        jQuery(document).ready(function() {
            setTimeout(updateDisplayName, 2000);
        });
    } else if (activityField.length > 2) {
        g_form.clearValue("display_name");
        g_form.setMandatory("display_name", true);
    }
    if (activityField.length < 2) {
        g_form.clearValue("display_name");
        g_form.setMandatory("display_name", false);
    }

}

function updateDisplayName() {
    g_form.setMandatory("display_name", true);
    var dotWalkField = g_form.getDisplayBox('field').innerHTML;
    g_form.setValue('display_name', dotWalkField);

    hideLoadingDialog();
}
