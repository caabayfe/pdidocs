function onLoad() {
    g_form.setDisplay('config_property', false);
    g_form.setValue('config_property', false);
    var builderConfigValue = g_form.getValue('builder_configuration');
    if (builderConfigValue) {
        g_form.setValue('config_property', true);
    }
}
