function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    //Type appropriate comment here, and begin script below
    if (g_form.isNewRecord())
        return;

    showField('recommendation_message', true);
    if (newValue === '1') {
        showField('recommended_value', false);
        showField('confidence', false);
        showField('confidence_threshold_for_direct_assignment', false);
        showField('recommendation_preference', false);
    } else if (newValue === '2') {
        showField('recommended_value', true);
        showField('confidence', true);
        showField('confidence_threshold_for_direct_assignment', true);
        showField('recommendation_preference', false);
    } else if (newValue === '3') {
        showField('recommended_value', true);
        showField('confidence', false);
        showField('confidence_threshold_for_direct_assignment', false);
        showField('recommendation_preference', true);
    }

    function showField(field, display) {
        g_form.setMandatory(field, display);
        g_form.setDisplay(field, display);
    }

}
