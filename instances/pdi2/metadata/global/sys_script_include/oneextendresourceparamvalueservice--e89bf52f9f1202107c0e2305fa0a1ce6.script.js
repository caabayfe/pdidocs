var OneExtendResourceParamValueService = Class.create();

OneExtendResourceParamValueService.createResourceParam = function(resource_mapping, param_name, param_value) {
    var gr = new GlideRecord(Constants.tables.ONE_EXTEND_RESOURCE_PARAM_VALUE);
    gr.initialize();
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_PARAM_VALUE__RESOURCE_MAPPING, resource_mapping);
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_PARAM_VALUE__PARAM_NAME, param_name);
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_PARAM_VALUE__PARAM_VALUE, param_value);
    gr.insert();
    return gr.getValue(Constants.fields.SYS_ID);
};

OneExtendResourceParamValueService.prototype = {
    tableName: Constants.tables.ONE_EXTEND_RESOURCE_PARAM_VALUE,

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
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_PARAM_VALUE__RESOURCE_MAPPING);
    },

    getParamName: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_PARAM_VALUE__PARAM_NAME);
    },

    getParamValue: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_PARAM_VALUE__PARAM_VALUE);
    },

    setResourceMapping: function(resource_mapping) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_PARAM_VALUE__RESOURCE_MAPPING, resource_mapping);
    },

    setParamName: function(param_name) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_PARAM_VALUE__PARAM_NAME, param_name);
    },

    setParamValue: function(param_value) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_PARAM_VALUE__PARAM_VALUE, param_value);
    },

    type: 'OneExtendResourceParamValueService'
}
