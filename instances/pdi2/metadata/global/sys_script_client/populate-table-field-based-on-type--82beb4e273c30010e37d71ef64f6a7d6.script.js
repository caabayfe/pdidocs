function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    /* Set the table value, only if the template field is filled
     * If the template field is empty, on change client script on template field will fill the value of the table field
     */
    if (!g_form.getValue("template")) return;
    if ((isLoading || newValue === '')) {
        setTableValue();
        return;
    }
    setTableValue();
}

function setTableValue() {
    var ga = new GlideAjax("ActivityUtilsAJAX");
    ga.addParam("sysparm_name", "getTemplateFieldSourceTable");
    ga.addParam("sysparm_templateId", g_form.getValue("template"));
    ga.addParam("sysparm_type", g_form.getValue("type"));
    ga.getXML(parseAnswer);
}

function parseAnswer(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    if (answer) {
        g_form.setValue('table', answer);
        g_form.setReadonly('table', true);
    }
}
