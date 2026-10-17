function onLoad() {
    //Type appropriate comment here, and begin script below
    var activityUI = g_form.getValue('activity_ui');
    var uiType = g_form.getValue('ui_selector');

    if (activityUI && !uiType)
        g_form.setValue('ui_selector', 'activity_ui');
}
