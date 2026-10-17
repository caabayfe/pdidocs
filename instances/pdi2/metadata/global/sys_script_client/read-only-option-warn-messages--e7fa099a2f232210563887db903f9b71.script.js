function onLoad() {

    function getProperty(property) {
        var propGR = new GlideRecord("sys_properties");
        propGR.addQuery("name", property);
        propGR.query();
        return propGR.next() ? propGR.getValue("value") : "client_script_modifiable";
    }

    if (!g_form.isVisible('read_only_option')) {
        g_form.addWarningMessage(getMessage('To manage read only settings, the <b>Read only option</b> must be configured in the form.'));
    }

    if (g_form.getValue('read_only_option') === 'instance_configured') {
        var instance_configured_value = getProperty("glide.read_only.legacy_read_only_behavior");
        var gwt = new GwtMessage();
        var warn_msg = gwt.getMessage("This option is currently controlled by a system property and behaves as {0}. Choose a specific option to confirm the read only behavior.", instance_configured_value);

        g_form.showFieldMsg('read_only_option',
            warn_msg,
            'warning',
            true);
    }
}
