function onClick(g_form) {
    var gaPromin = new GlideAjax('global.ProminUtilsAJAX');
    gaPromin.addParam('sysparm_name', 'getWorkBenchUrl');
    gaPromin.addParam('sysparm_projectDefID', g_form.getUniqueValue());
    gaPromin.getXML(getWorkBenchUrlResponse);

    function getWorkBenchUrlResponse(response) {
        var workBenchUrl = response.responseXML.documentElement.getAttribute("answer");
        if (workBenchUrl) {
            top.window.open(workBenchUrl, "_blank");
        }
    }
}
