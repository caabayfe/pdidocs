function openAnalystWorkbench() {
    var gaPromin = new GlideAjax('global.ProminUtilsAJAX');
    gaPromin.addParam('sysparm_name', 'getWorkBenchUrl');
    gaPromin.addParam('sysparm_projectDefID', rowSysId);
    gaPromin.getXML(getWorkBenchUrlResponse);
    function getWorkBenchUrlResponse(response) {
        var workBenchUrl = response.responseXML.documentElement.getAttribute("answer");
        if (workBenchUrl) {
            g_navigation.open(workBenchUrl, "_blank");
        }
    }
}
