var OneExtendResourceAttributeMappingService = Class.create();

OneExtendResourceAttributeMappingService.createResourceAttributeMapping = function (resource_mapping, resource_attribute_name, resource_attribute_value, script) {
    var gr = new GlideRecord(Constants.tables.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING);
    gr.initialize();
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_MAPPING, resource_mapping);
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_ATTRIBUTE_NAME, resource_attribute_name);
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_ATTRIBUTE_VALUE, resource_attribute_value);
    gr.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__SCRIPT, script);
    gr.insert();
    return gr.getValue(Constants.fields.SYS_ID);
};

OneExtendResourceAttributeMappingService.prototype = {
    tableName: Constants.tables.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING,

    initialize: function (sysId) {
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

    getResourceMapping: function () {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_MAPPING);
    },

    getResourceAttributeName: function () {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_ATTRIBUTE_NAME);
    },

    getResourceAttributeValue: function () {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_ATTRIBUTE_VALUE);
    },

    getScript: function () {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__SCRIPT);
    },


    setResourceMapping: function (resource_mapping) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_MAPPING, resource_mapping);
    },


    setResourceAttributeName: function (resource_attribute_name) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_ATTRIBUTE_NAME, resource_attribute_name);
    },


    setResourceAttributeValue: function (resource_attribute_value) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__RESOURCE_ATTRIBUTE_VALUE, resource_attribute_value);
    },


    setScript: function (script) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_RESOURCE_ATTRIBUTE_MAPPING__SCRIPT, script);
    },

    type: 'OneExtendResourceAttributeMappingService'
}
