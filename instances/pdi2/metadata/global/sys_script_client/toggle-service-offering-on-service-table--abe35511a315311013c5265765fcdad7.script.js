function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var ga = new GlideAjax('ServiceMappingAjaxUtils');
    ga.addParam('sysparm_name', 'getMappingLevelForServiceTable');
    ga.addParam('sysparm_service_table', g_form.getValue('service_table'));
    ga.getXML(parseResponse);
}

function parseResponse(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
	
    switch (answer) {
        case "service":
            toggleField("csdm_service", true);
            toggleField("csdm_service_offering", false);
            break;

        case "service_offering":
            toggleField("csdm_service", false);
            toggleField("csdm_service_offering", true);
            break;

        default:
            break;
    }
}

function toggleField(fieldName, enable) {
    g_form.setMandatory(fieldName, enable);
    g_form.setDisplay(fieldName, enable);
}
