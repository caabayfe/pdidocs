function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue && g_form.getValue("type") == "DEFAULT") {
        g_form.setValue('track_change', false);
        g_form.setValue('field_values_selection_type', 'ALL');
    }
	
    // to handle DATE_TIME type and field change which must populate grouped node name
    if (g_form.getValue("type") == "DATE_TIME") {
        showLoadingDialog();
        jQuery(document).ready(function() {
            setTimeout(updateGroupActivityName, 2000);
        });
    }
}

function updateGroupActivityName() {

    var groupedActivitiesName = "";
    if (g_form.getValue('track_change') == "true") {
        var field = g_form.getValue('field');
        var newField = field.split(".");
        if (newField.length < 3) {
            var dotWalkField = g_form.getDisplayBox('field').innerHTML;
            groupedActivitiesName = dotWalkField + ' changed';
            g_form.setValue('change_name', dotWalkField + ' changed');
        }
        g_form.setValue("change_name", groupedActivitiesName);
    }

    hideLoadingDialog();

}
