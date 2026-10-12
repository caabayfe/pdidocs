function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }

    var id = g_form.getValue("schema_id");

    if (id > 0 && id <= 2147483647 && !(id.includes('.'))) {
        var standAloneSchemaGR = new GlideRecord("standalone_stream_connect_schema");
        standAloneSchemaGR.addQuery("schema_id", id);
        standAloneSchemaGR.query();
        if (standAloneSchemaGR.hasNext()) {
            var msg = "Standalone Schema with Id " + id + " already exists. Please enter a different Id for the Schema and try again";
            g_form.clearValue("schema_id");
            g_form.showFieldMsg("schema_id", msg, "info", false);
        }
    } else {
        g_form.clearValue("schema_id");
        g_form.showFieldMsg("schema_id", "Schema Id should to be a positive Integer", "info", false);
    }
}
