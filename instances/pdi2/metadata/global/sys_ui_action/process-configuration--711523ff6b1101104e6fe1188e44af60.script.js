function showRelatedProcessConfiguration() {
	
	var tableName = g_form.getValue('table');

    var gaPromin = new GlideAjax('global.ProminUtilsAJAX');
    gaPromin.addParam('sysparm_name', 'getRelatedProcessConfigList');
    gaPromin.addParam('sysparm_entityTable', tableName);
    gaPromin.getXML(getRelatedProcessConfigListResponse);

    function getRelatedProcessConfigListResponse(response) {
        var processConfigUrl = response.responseXML.documentElement.getAttribute("answer");
        if (processConfigUrl) {
            g_navigation.open(processConfigUrl, "_blank");
        }
    }

}
