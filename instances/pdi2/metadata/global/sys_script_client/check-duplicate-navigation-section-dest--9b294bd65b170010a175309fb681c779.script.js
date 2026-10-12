function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    if (isLoading || newValue === '')
        return;
	g_form.clearMessages();
    var sysId = g_form.getValue('navigation_section');
    var destSysId = g_form.getValue('navigation_section_destination');
    var getIsDuplicate = new GlideAjax('CheckForDuplicateNavigationSectionDest');
	getIsDuplicate.addParam('sysparm_name','getCheck');
    getIsDuplicate.addParam('sysparm_navigation_section',sysId);
    getIsDuplicate.addParam('sysparm_navigation_section_destination', destSysId);
    getIsDuplicate.getXML(getResult);

    function getResult(response) {
        var result = response.responseXML.documentElement.getAttribute("answer");
        if (result === 'true') {
            g_form.clearValue('navigation_section_destination');
            g_form.addErrorMessage("Navigation section destination is already mapped.");
        }
    }

}
