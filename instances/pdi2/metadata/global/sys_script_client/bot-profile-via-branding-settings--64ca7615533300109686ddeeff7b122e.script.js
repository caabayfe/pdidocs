function onLoad() {
    var target = getParmVal("sysparm_target");
    if (target == 'sys_cs_branding_setup.va_profile') {
        g_form.setValue('short_description', 'This profile is for an auto-generated Virtual Agent bot user.');
        g_form.setDisabled('short_description', true);
    }
}

function getParmVal(name) {
    var url = new GlideURL();
    url.setFromCurrent();
    return url.getParam(name);
}
