function onLoad() {
	
    g_form.setValue("input_source_choices", "attachment");
    g_form.setDisplay("attach_schema_file", true);
    g_form.setDisplay("json_schema_string", false);
    var ga = new GlideAjax('StandaloneSchemaUtil');
    ga.addParam('sysparm_name', 'getGreatestSchemaID');
    ga.getXML(schemaParse);
}

function schemaParse(response) {
    var schemaID = response.responseXML.documentElement.getAttribute('answer');
    if (schemaID > 2147483647)
        g_form.addErrorMessage("The Schema ID is at Max value for an integer 2147483647");
    else
        g_form.setValue("schema_id", schemaID);
}
