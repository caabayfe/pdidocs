var OneExtendCapabilityService = Class.create();

OneExtendCapabilityService.createOneExtendCapability = function (capability, active, resource_type) {
    var gr = new GlideRecord(Constants.tables.ONE_EXTEND_CAPABILITY);
    gr.initialize();
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY__CAPABILITY, capability);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY__ACTIVE, active);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY__RESOURCE_TYPE, resource_type);
    gr.insert();
    return gr.getValue(Constants.fields.SYS_ID);
};

OneExtendCapabilityService.prototype = {
    tableName: Constants.tables.ONE_EXTEND_CAPABILITY,

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

    getCapability: function () {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY__CAPABILITY);
    },

    isActive: function () {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY__ACTIVE);
    },

    getCapabilityResourceType: function () {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY__RESOURCE_TYPE);
    },


    setCapability: function (capability) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY__CAPABILITY, capability);
    },


    setActive: function (active) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY__ACTIVE, active);
    },


    setCapabilityResourceType: function (resource_type) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY__RESOURCE_TYPE, resource_type);
    },

    type: 'OneExtendCapabilityService'
}
