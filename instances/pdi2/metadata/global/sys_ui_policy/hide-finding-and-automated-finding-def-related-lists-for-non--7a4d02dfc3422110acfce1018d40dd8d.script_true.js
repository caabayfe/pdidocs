function onCondition() {
    if (!g_form.isNewRecord()) {
        var gaProminUtil = new GlideAjax('global.ProminUIActionClient');
        gaProminUtil.addParam('sysparm_name', 'isAuditEnabledTable');
        gaProminUtil.addParam('sysparm_table', g_form.getValue("table"));
        gaProminUtil.getXML(getIsAuditEnabledTableResponse);
    }
}

function getIsAuditEnabledTableResponse(response) {
    var isAuditEnabled = response.responseXML.documentElement.getAttribute("answer");
    if (isAuditEnabled == "false") {
        g_form.hideRelatedList("promin_finding_def");
        g_form.hideRelatedList("promin_automated_finding");
    } else {
        g_form.showRelatedList("promin_finding_def");
        g_form.showRelatedList("promin_automated_finding");
    }
}
