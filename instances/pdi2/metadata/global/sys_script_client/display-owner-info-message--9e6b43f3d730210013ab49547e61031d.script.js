function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading)
        return;

    if (newValue) {
        checkUserRoleAjaxCall(newValue);
    }
}

function checkUserRoleAjaxCall(ownerSysId) {
    //Ajax call to check does user has knowledge_managment role
    var ga = new GlideAjax('UserHasRoleAjax');
    ga.addParam('sysparm_name', 'ajaxFunction_userHasRole');
    ga.addParam('sysparm_user_sys_ids', ownerSysId);
	if(g_form.isNewRecord())
		ga.addParam('sysparm_kb','-1');
	else
		ga.addParam('sysparm_kb', g_form.getUniqueValue());
    ga.addParam('sysparm_field', 'owner');
    ga.getXML(setHighlight);

}

function setHighlight(response) {
    var hasNotRole = response.responseXML.documentElement.getAttribute("answer");
    if (hasNotRole) {
        var ownerInfoMsg = getMessage('User {0} will be assigned the knowledge_manager role after adding!');
        ownerInfoMsg = ownerInfoMsg.replace('{0}', hasNotRole);
        g_form.showFieldMsg('owner', ownerInfoMsg, 'info');
    }

}
