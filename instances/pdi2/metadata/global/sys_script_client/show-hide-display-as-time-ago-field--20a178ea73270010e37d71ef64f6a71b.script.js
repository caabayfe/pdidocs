function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        getInternalType();
        return;
    }
    getInternalType();
}

function getInternalType() {
    g_form.setVisible("display_as_timeago", false);
    var table = g_form.getValue("table");
    var field = g_form.getValue("name");
    if (!table || !field) return;
    var ga = new GlideAjax("ActivityUtilsAJAX");
    ga.addParam("sysparm_name", "isDateTypeField");
    ga.addParam("sysparm_table", table);
    ga.addParam("sysparm_field", field);
    ga.getXML(parseAnswer);
}

function parseAnswer(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    if (answer == "true")
        g_form.setVisible("display_as_timeago", true);
}
