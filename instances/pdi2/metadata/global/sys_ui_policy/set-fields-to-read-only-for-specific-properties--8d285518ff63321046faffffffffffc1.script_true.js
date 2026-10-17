function onCondition() {
    var props = ["cleanup.policy"];
    var propertyName = g_form.getValue("property_name");
    var readOnly = props.indexOf(propertyName) !== -1;

    var fields = ["property_name", "property_value", "topic_name"]; // add all relevant fields
    for (var i = 0; i < fields.length; i++) {
        g_form.setReadOnly(fields[i], readOnly);
    }
}
