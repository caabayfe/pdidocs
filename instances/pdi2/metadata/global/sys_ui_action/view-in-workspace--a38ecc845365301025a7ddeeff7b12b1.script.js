function openVersionInAnalystWorkbench() {
    var gaPromin = new GlideAjax('global.ProminUtilsAJAX');
    gaPromin.addParam('sysparm_name', 'getGotoWorkbenchURLforVersion');
    gaPromin.addParam('sysparm_versionId', rowSysId);
    gaPromin.getXML(getWorkbenchURLforVersionResponse);

    function getWorkbenchURLforVersionResponse(response) {
        var workBenchUrl = response.responseXML.documentElement.getAttribute("answer");
        if (workBenchUrl) {
            g_navigation.open(workBenchUrl, "_blank");
        }
    }
}
