function onSubmit() {
    if(g_form.getValue('active') === 'false')
        return true;
    var gwt = new GwtMessage();
    // based on number of active policies for given channel, decide.
    var ga = new GlideAjax('global.PrivacyCoreValidator');
    ga.addParam('sysparm_name', 'getNumActivePolicies');
    ga.addParam('sysparm_channel_sysid', g_form.getValue('channel'));
    ga.addParam('sysparm_policy_type', g_form.getValue('policy_type'));
    ga.getXMLWait();
    var numActivePolicies = parseInt(ga.getAnswer());
    if (numActivePolicies > 0) {
        var warningMessage = gwt.getMessage("One or more active privacy configurations for policy type {0} and data channel {1} exist.", g_form.getValue('policy_type'), g_form.getDisplayBox('channel').value);
        g_form.addInfoMessage(warningMessage);
        return false;
    }
    return true;
}
