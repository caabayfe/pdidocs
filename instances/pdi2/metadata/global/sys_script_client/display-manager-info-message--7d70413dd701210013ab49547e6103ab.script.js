function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading)
        return;

    if (newValue) {
        //Ajax call to check does user has knowledge_managment role
        var ga = new GlideAjax('UserHasRoleAjax');
        ga.addParam('sysparm_name', 'ajaxFunction_userHasRole');
        ga.addParam('sysparm_user_sys_ids', newValue);
        if(g_form.isNewRecord())
			ga.addParam('sysparm_kb','-1');
		else
			ga.addParam('sysparm_kb', g_form.getUniqueValue());
        ga.addParam('sysparm_field', 'kb_managers');
        ga.getXML(setHighlight);
    }
}

function setHighlight(response) {
    var hasNotRole = response.responseXML.documentElement.getAttribute("answer");

    if (hasNotRole) {
        var singular = "User {0} will be assigned the {1} role after adding";
        var plural = "Users {0} will be assigned the {1} role after adding";
        // Extracting the translated message and replacing the parameters
        var keys = [singular, plural];
        var msgs = getMessages(keys);
        var msg = msgs[singular];

        if (hasNotRole.indexOf(",") != -1)
            msg = msgs[plural];

        g_form.showFieldMsg('kb_managers', new GwtMessage().format(msg, hasNotRole, "knowledge_manager"), 'info');
    }

}
