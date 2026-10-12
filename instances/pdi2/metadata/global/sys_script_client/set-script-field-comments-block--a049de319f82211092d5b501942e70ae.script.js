function onLoad() {
    //Type appropriate comment here, and begin script below
    if (g_form.isNewRecord()) {
        var propGR = new GlideRecord('sys_properties');
        propGR.addQuery('name', 'glide.security.use_script_classifier_for_checking_current');
        propGR.query();
        var useSimpleMessage = propGR.next() && propGR.getValue('value') === "true";

        g_form.setValue(
            'script',
            useSimpleMessage ?
            "/** \n * Using 'current' in the script or included script-includes is not allowed. \n*/\n" :
            "/** \n * Using 'current', 'root_rule', 'g_approval_form_request' in the script or included script-includes is not allowed. \n*/\n"
        );
    }
}
