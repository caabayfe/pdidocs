var OneExtendResourceMappingService = Class.create();

OneExtendResourceMappingService.createResourceMapping = function(resource_mapping, resource_param_name, resource_param_value, script) {
    var gr = new GlideRecord(Constants.tables.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING);
    gr.initialize();
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_MAPPING, resource_mapping);
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_PARAM_NAME, resource_param_name);
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_PARAM_VALUE, resource_param_value);
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__SCRIPT, script);
    gr.insert();
    return gr.getValue(Constants.fields.SYS_ID);
};

OneExtendResourceMappingService.prototype = {
    tableName: Constants.tables.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING,

    initialize: function(sysId) {
        if (sysId) {
            var gr = new GlideRecord(this.tableName);
            if (gr.get(grOrSysId)) {
                this.currentRecord = gr;
            }
        } else {
            gr = new GlideRecord(this.tableName);
            gr.initialize();
            this.currentRecord = gr;
        }
    },

    getResourceMapping: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_MAPPING);
    },

    getResourceParamName: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_PARAM_NAME);
    },

    getResourceParamValue: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_PARAM_VALUE);
    },

    getScript: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__SCRIPT);
    },

    setResourceMapping: function(resource_mapping) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_MAPPING, resource_mapping);
    },

    setResourceParamName: function(resource_param_name) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_PARAM_NAME, resource_param_name);
    },

    setResourceParamValue: function(resource_param_value) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_PARAM_VALUE, resource_param_value);
    },

    setScript: function(script) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__SCRIPT, script);
    },

    type: 'OneExtendResourceMappingService'
};
