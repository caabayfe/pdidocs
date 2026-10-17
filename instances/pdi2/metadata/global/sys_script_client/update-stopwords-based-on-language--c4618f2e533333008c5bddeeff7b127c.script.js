function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        return;
    }

    var languages = [newValue, 'en'];
    var ga = new GlideAjax("GetStopwordSysIDBasedOnLanguage");
    ga.addParam('sysparm_name', "setStopwordList");
    ga.addParam('sysparm_language', languages);
    ga.getXML(SetStopwordSysID);

    function SetStopwordSysID(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        var sysIds = answer.split(',');
        g_form.setValue("stopwords", sysIds);
    }
}
