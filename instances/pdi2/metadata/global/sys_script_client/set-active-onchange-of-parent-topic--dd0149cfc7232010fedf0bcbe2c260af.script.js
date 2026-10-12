function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }
    if (newValue == '') {
        if (g_form.getValue('taxonomy') != '' && g_form.getReference('taxonomy').active == 'true') {
            if (!isLoading)
                g_form.setValue("active", true);
            g_form.setDisabled("active", false);
        }
        return;
    }
    if (g_form.getReference('parent_topic').active == 'true') {
        if(g_form.getReference('parent_topic').apply_to_child_topics === 'true')
            g_form.setValue("template",g_form.getReference('parent_topic').template);
        if (!isLoading)
            g_form.setValue("active", true);
        g_form.setDisabled("active", false);
    } else
        deactivate();
    return;
}

function deactivate() {
    g_form.setValue("active", false);
    g_form.setDisabled("active", true);
}
