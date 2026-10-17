function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    g_form.getReference("finding_def", getFindingDefType);
}

function getFindingDefType(grFindingDef) {
    var findingType = grFindingDef.type;
    if (findingType == 'PROJECT') {
        g_form.setDisplay("entity", true);
        g_form.setMandatory("entity", true);
        g_form.setValue("entity", '');
        g_form.setDisplay("table", false);
        g_form.setValue("table", g_form.getControl("table").options[0].value);
    } else if (findingType == "PROCESS") {
        g_form.setMandatory("entity", false);
        g_form.setDisplay("entity", false);
        var gaProminUtil = new GlideAjax('global.ProminUtilsAJAX');
        gaProminUtil.addParam('sysparm_name', 'getProcessDefTable');
        gaProminUtil.addParam('sysparm_findingDefSysId', g_form.getValue("finding_def"));
        gaProminUtil.getXML(gaProminUtilResponse);
    }
}

function gaProminUtilResponse(response) {
    var tableName = response.responseXML.documentElement.getAttribute("answer");
    if (tableName && tableName != null) {
        g_form.setValue("table", tableName);
        g_form.setDisplay("table", true);
    }
}
