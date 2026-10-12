function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    g_form.setReadOnly("source_table", true);
    if (!g_form.getValue("activity_type")) return;
    setSourceVal();
}

function setSourceVal() {
    var actTable = "sn_actsub_activity";
    if (g_form.getValue("fetch_from_activities") == "true") {
        if (g_form.getValue("source_table") != actTable) {
            g_form.setValue("source_table", actTable);
        }
    } else {
        var type = g_form.getReference("activity_type", setSource);
    }
    g_form.setReadOnly("source_table", true);
}

function setSource(typeGr) {
    g_form.setValue("source_table", typeGr.activity_source_table + "");
}
