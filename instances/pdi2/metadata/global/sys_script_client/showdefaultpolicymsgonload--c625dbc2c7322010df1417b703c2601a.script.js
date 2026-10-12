function onLoad() {
    var msg = "";
    var defaultPolicy = g_form.getValue("default_policy");
    var policy = g_form.getValue(defaultPolicy);
    var gr = new GlideRecord('sys_authentication_policy');
    gr.get(policy);

    var status = gr.active;

    if (status == 'false') {
        msg = formatMessage(getMessage("'{0}' which is referred in this context is Inactive. Kindly enable it using the Activate Policy link on the page, to get it executed as expected."), gr.name);

        g_form.addErrorMessage(msg);
    }

    if (defaultPolicy === "stepup_mfa_policy") {
        msg = formatMessage(getMessage("Default Policy is '{0}'. Users will be shown with Multi-factor Authentication if policy configured in Step-Up MFA Policy evaluates to true. Policy takes precedence over the user or role based configuration."), g_form.getOption("default_policy", defaultPolicy).text);
    } else {
        msg = formatMessage(getMessage("Default Policy is '{0}'. Users will not be shown with Multi-factor Authentication if policy configured in Step-Down MFA Policy evaluates to true. Policy takes precedence over the user or role based configuration."), g_form.getOption("default_policy", defaultPolicy).text);
    }
    // Show the Corresponding Message on Load of the Auth Policy context form.
    g_form.addInfoMessage(msg);
}
