function setActionLinkUrl(actionSysId) {
    var annotationElement = $j("#rest-integrationhub-annotation-span > a");
    if (!annotationElement)
        return;

    var url = "/$flow-designer.do?sysparm_nostack=true#/action-designer/";
    if (actionSysId)
        url = url + actionSysId + "/var/input";
    else
        url = url + "new/datasource_request";
    annotationElement.attr("href", url);
}

function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading)
        return;

    setActionLinkUrl(newValue);
}
