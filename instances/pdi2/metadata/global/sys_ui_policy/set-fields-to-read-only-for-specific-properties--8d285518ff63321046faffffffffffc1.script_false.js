function onCondition() {
	var fields = ["property_name", "property_value", "topic_name"]; // add all relevant fields
    for (var i = 0; i < fields.length; i++) {
        g_form.setReadOnly(fields[i], false);
    }
}
