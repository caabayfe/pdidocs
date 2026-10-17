function onLoad() {
    var viewName = getView();
    if (viewName == "portal_preferences") {
        g_form.setValue('applicable_for', 'portal_preferences_widget');
    } else if (viewName == "") {
        g_form.setValue('applicable_for', 'platform_preferences');
    }
}
