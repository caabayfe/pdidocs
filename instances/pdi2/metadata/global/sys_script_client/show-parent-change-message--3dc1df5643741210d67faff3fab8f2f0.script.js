function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === ''|| newValue === oldValue) {
        return;
    }
	
	var ga = new GlideAjax('global.SPMClientUtilAjax');
	ga.addParam('sysparm_name', 'hasChildServices');
	ga.addParam('sysparm_sys_id', newValue);
	ga.getXML(showMessage);
}

function showMessage(response) {
	var parentHasChildServices = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));

	if (parentHasChildServices)
		g_form.showFieldMsg('parent', nowapi.g_i18n.getMessage("By updating the parent, you are reparenting the services. This means that the child services of the new parent will be assigned to this node."), 'info');
	else
		g_form.showFieldMsg('parent', nowapi.g_i18n.getMessage("By updating the parent, this node and its child nodes or services will also move to the updated parent."), 'info');
}
