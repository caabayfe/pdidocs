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

    if (defaultPolicy === "deny_policy") {
        msg = formatMessage(getMessage("Default Policy is '{0}'. The Login for users are allowed by default and the login is denied only if the conditions defined in Deny Policy evaluates to true."), g_form.getOption("default_policy", defaultPolicy).text);
    } else {
        msg = formatMessage(getMessage("Default Policy is '{0}'. The Login for users are restricted by default and the login is allowed only if the conditions defined in Allow Policy evaluates to true."), g_form.getOption("default_policy", defaultPolicy).text);
    }
    // Show the Corresponding Message on Load of the Auth Policy context form.
    g_form.addInfoMessage(msg);
}
