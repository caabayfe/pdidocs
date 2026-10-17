function onLoad() {
    //Type appropriate comment here, and begin script below
    var hasScript = g_form.getValue('script');
    var hasControlledByRefs = g_form.getValue('controlled_by_refs');

    if (!hasScript && !hasControlledByRefs) {
        g_form.setValue("advanced", false);
        g_form.setReadOnly("advanced", false);
    } else {
        g_form.setValue("advanced", true);
        g_form.setReadOnly("advanced", true);
    }
}
