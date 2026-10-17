function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    var activityTable = "sn_actsub_activity";
    if (isLoading) {
        if (!g_form.getValue("activity_type") && g_form.getValue("fetch_from_activities") == "true") {
            g_form.setValue("source_table", activityTable);
            setDefaultValue(activityTable);
        }
        return;
    }
    if (g_form.getValue("source_table") == activityTable) {
        setDefaultValue(activityTable);
    } else {
        g_form.setValue("source_mapping_field", "");
    }
}

function setDefaultValue(activityTable) {
    var ga = new GlideAjax("ActivityUtilsAJAX");
    ga.addParam("sysparm_name", "getSourceMappingFieldDefault");
    ga.addParam("sysparm_source_table", activityTable);
    ga.getXML(parseAnswer);
}

function parseAnswer(response) {
    var answer = response.responseXML.documentElement.getAttribute("answer");
    if (answer) {
        g_form.setValue("source_mapping_field", answer);
    }
}
