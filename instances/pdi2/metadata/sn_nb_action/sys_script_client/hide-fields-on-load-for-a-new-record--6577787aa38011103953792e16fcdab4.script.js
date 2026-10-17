function onLoad() {
    //Type appropriate comment here, and begin script below
    if (g_form.isNewRecord()) {
        var fields = ['recommendation_message', 'confidence', 'recommendation_method', 'recommendation_preference', 'recommended_value', 'confidence_threshold_for_direct_assignment'];
        for (var fieldIdx = 0; fieldIdx < fields.length; fieldIdx++) {
            g_form.setDisplay(fields[fieldIdx], false);
        }
        g_form.addInfoMessage(getMessage('Save the record to configure more details.'));
    }
}
