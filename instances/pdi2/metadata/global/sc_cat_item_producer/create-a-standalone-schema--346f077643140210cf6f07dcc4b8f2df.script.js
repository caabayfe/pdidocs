var schemaUtil = new StandaloneSchemaUtil();
var redirectString = "/com.glideapp.servicecatalog_cat_item_view.do?v=1&sysparm_id=" + RP.getParameterValue('sysparm_id');
var schemaId = producer.schema_id;
var stringSchema = getInputSchemaFromFileOrJson();

var schemaGR = new GlideRecord("standalone_stream_connect_schema");
schemaGR.addQuery("schema", stringSchema);
schemaGR.setLimit(1);
schemaGR.query();
if (!schemaGR.next()) {
    var parsedSchema = JSON.parse(stringSchema);
    current.schema = stringSchema;
    current.schema_id = schemaId;
    current.name = parsedSchema.name;
    current.schema_registry = 'f93579a943a00210cf6f07dcc4b8f26d';

    if (!gs.nil(parsedSchema))
        current.name = parsedSchema.name;
    gs.addInfoMessage(gs.getMessage("The Schema with id {0} was created successfully",[schemaId]));
} else {
    // Create the html contents of the information message
    var link = '<a href="standalone_stream_connect_schema.do?sys_id=' + schemaGR.getUniqueValue() + '" class="breadcrumb" >' + gs.getMessage('Schema Link') + '</a>';
    var message = link + '<br/>';

    //Create the html contents of the information message
    producer.redirect = redirectString;
    gs.addInfoMessage(gs.getMessage("The Schema already exists with Schema Id {0} - {1}", [schemaGR.getValue("schema_id"),message]));

}

function redirectOnError(errorMsg) {
    producer.redirect = redirectString;
    if (errorMsg)
        gs.addErrorMessage(errorMsg);
	exit;
}

// validates and returns the JSON Schema string for either File or JSON source
function getInputSchemaFromFileOrJson() {
    if (producer.input_source_choices == "attachment")
        schemaStr = schemaUtil.getSchemaStringForFileAttachment(producer.attach_schema_file);
    else
        schemaStr = producer.json_schema_string;
    
    if (gs.nil(schemaStr))
        redirectOnError(producer.input_source_choices + " cannot be empty!");
    else {
        var validatedSchemaStr = schemaUtil.validateSchema(schemaStr);
        var parsedStrSchema = JSON.parse(validatedSchemaStr);
        if (!(parsedStrSchema.valid)) 
            redirectOnError(parsedStrSchema.error);
    }
    return schemaStr;
}
