var StandaloneSchemaUtil = Class.create();
StandaloneSchemaUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getGreatestSchemaID: function() {
        var schemaID = 0;
        var standaloneSchemaGA = new GlideAggregate("standalone_stream_connect_schema");
		standaloneSchemaGA.addAggregate('MAX', 'schema_id');
        standaloneSchemaGA.query();
		while(standaloneSchemaGA.next())
			schemaID = standaloneSchemaGA.getAggregate('MAX', 'schema_id');
			
        schemaID++;
        return schemaID + '';

    },

    validateSchema: function(schemaString) {
        return new sn_sc_schema.KafkaStreamSchema().validateSchema(schemaString);
    },

    validateSchemaFile: function(schemaAttachmentSysId) {
		return new sn_sc_schema.KafkaStreamSchema().validateSchemaFile(schemaAttachmentSysId); 
    },

	getSchemaStringForFileAttachment: function(schemaAttachmentSysId) {
		return new sn_sc_schema.KafkaStreamSchema().getSchemaStringFromAttachment(schemaAttachmentSysId);  
    },

    type: 'StandaloneSchemaUtil'
});
