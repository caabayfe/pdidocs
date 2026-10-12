function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (oldValue === newValue)
        return;

    var sysID = g_form.getUniqueValue();
    var gr = new GlideRecord("asmt_metric");
    gr.addQuery("depends_on", sysID);
    gr.query();

    //First check if other question dependent on and then check if current question dependent on
    if (gr.rows.length == 0 && !g_form.getValue('depends_on'))
        return;

    //Type appropriate comment here, and begin script below
    var dialog = new GlideModal('update_metric_category', false);
    dialog.setTitle(new GwtMessage().getMessage('Updating category'));
    dialog.setSize(500);
    dialog.setPreference('category_type', oldValue);
    dialog.render();

}
