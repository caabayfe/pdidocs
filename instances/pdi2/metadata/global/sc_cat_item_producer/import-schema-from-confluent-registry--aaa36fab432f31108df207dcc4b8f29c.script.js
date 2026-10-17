var subject = producer.schema_subject;
var version = producer.schema_version;
var redirectString = "/com.glideapp.servicecatalog_cat_item_view.do?v=1&sysparm_id=" + RP.getParameterValue('sysparm_id');
var recSysId;

if (gs.nil(subject) || gs.nil(version)) {
    gs.addErrorMessage(gs.getMessage("There are no Schemas in the Confluent Schema Registry"));
} else {

    var schemaGR = new GlideRecord("confluent_stream_connect_schema");
    schemaGR.addQuery("subject", subject);
    schemaGR.addQuery("version", version);
    schemaGR.setLimit(1);
    schemaGR.query();
    if (!schemaGR.next()) {
        var response = new ConfluentUtil().getSchema(subject, version);
        if (!gs.nil(response)) {
            var responseBody = JSON.parse(response);

            if (responseBody.errorMessage) {
                var errMessage = responseBody.errorMessage;
                g_form.addErrorMessage(errMessage);
            } else {
                var schmGR = new GlideRecord("confluent_stream_connect_schema");
                schmGR.addQuery("schema_id", responseBody.id);
                schmGR.addQuery("schema_registry", "21923727ff000210fe6343d0653bf163");
                schmGR.setLimit(1);
                schmGR.query();

                if (!schmGR.next()) {
                    current.subject = subject;
                    current.version = version;
                    current.schema_id = responseBody.id;
                    current.schema = responseBody.schema;
                    current.schema_registry = '21923727ff000210fe6343d0653bf163';
					current.name = getSchemaName(responseBody.schema);
                    gs.addInfoMessage(gs.getMessage("The Schema with subject {0} and version {1} was imported successfully", [subject, version]));
                } else {
                    schmGR.subject = subject;
                    schmGR.version = version;
					schmGR.name = getSchemaName(responseBody.schema);
                    schmGR.update();
                    recSysId = schmGR.getUniqueValue();
                    redirectExistingSchemaMessage(recSysId, "id");
                }
            }
        }
    } else {
        recSysId = schemaGR.getUniqueValue();
        redirectExistingSchemaMessage(recSysId, "subject");
		
    }
}

function redirectExistingSchemaMessage(recSysId, type) {
    var link = '<a href="confluent_stream_connect_schema.do?sys_id=' + recSysId + '" class="breadcrumb" >' + gs.getMessage('Schema Link') + '</a>';
    var message = link + '<br/>';
    producer.redirect = redirectString;
    if (type.contains("id"))
        gs.addInfoMessage(gs.getMessage("The Schema with schema Id {0} already exists {1}", [schmGR.getValue("schema_id"), message]));
    else
        gs.addInfoMessage(gs.getMessage("The Schema with subject {0} and version {1} already exists {2}", [subject, version, message]));
	exit;
}

function getSchemaName(schema) {
    if (!gs.nil(schema) && schema.trim() != "") {
        return JSON.parse(schema).name;
    }
}
