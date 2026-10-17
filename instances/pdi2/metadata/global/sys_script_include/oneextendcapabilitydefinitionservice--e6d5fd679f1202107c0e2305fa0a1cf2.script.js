var OneExtendCapabilityDefinitionService = Class.create();

OneExtendCapabilityDefinitionService.createCapabilityDefinition = function(name, capability, api_type, api, category, connection, description, filter_properties, advanced, truncate_strategy, preprocessor, postprocessor, sys_domain) {
    var gr = new GlideRecord(Constants.tables.ONE_EXTEND_CAPABILITY_DEFINITION);
    gr.initialize();
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__NAME, name);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__CAPABILITY, capability);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__API_TYPE, api_type);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__API, api);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__CATEGORY, category);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__CONNECTION, connection);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__DESCRIPTION, description);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__FILTER_PROPERTIES, filter_properties);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__ADVANCED, advanced);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__TRUNCATE_STRATEGY, truncate_strategy);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__PREPROCESSOR, preprocessor);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__POSTPROCESSOR, postprocessor);
    gr.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__SYS_DOMAIN, sys_domain);
    gr.insert();
    return gr.getValue(Constants.fields.SYS_ID);
};

OneExtendCapabilityDefinitionService.prototype = {
    tableName: Constants.tables.ONE_EXTEND_CAPABILITY_DEFINITION,

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

    getName: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__NAME);
    },

    getCapability: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__CAPABILITY);
    },

    getAPIType: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__API_TYPE);
    },

    getAPI: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__API);
    },

    getCategory: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__CATEGORY);
    },


    getConnection: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__CONNECTION);
    },


    getDescription: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__DESCRIPTION);
    },

    getFilterProperties: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__FILTER_PROPERTIES);
    },

    isAdvanced: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__ADVANCED);
    },

    getTruncateStrategy: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__TRUNCATE_STRATEGY);
    },

    getPreprocessor: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__PREPROCESSOR);
    },

    getPostprocessor: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__POSTPROCESSOR);
    },

    getSysDomain: function() {
        return this.currentRecord.getValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__SYS_DOMAIN);
    },

    getAllScripts: function() {

        var gr = new GlideRecord('sys_one_extend_capability_definition');
        gr.addQuery('api_type', 'Script Include');
        gr.query();

        var scripts = [];

        while (gr.next()) {
            var script = {
                sys_id: gr.sys_id.toString(),
                name: gr.name.toString()
            };
            scripts.push(script);
        }

        return scripts;
    },

    getAllSubFlows: function() {

        var gr = new GlideRecord('sys_one_extend_capability_definition');
        gr.addQuery('api_type', 'Flow Designer Subflow');
        gr.query();

        var subflows = [];

        while (gr.next()) {
            var script = {
                sys_id: gr.sys_id.toString(),
                name: gr.name.toString()
            };
            subflows.push(script);
        }

        return subflows;
    },

    setName: function(name) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__NAME, name);
    },

    setCapability: function(capability) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__CAPABILITY, capability);
    },

    setAPIType: function(api_type) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__API_TYPE, api_type);
    },

    setAPI: function(api) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__API, api);
    },

    setCategory: function(category) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__CATEGORY, category);
    },

    setConnection: function(connection) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__CONNECTION, connection);
    },

    setDescription: function(description) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__DESCRIPTION, description);
    },

    setTruncateStrategy: function(truncate_strategy) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__TRUNCATE_STRATEGY, truncate_strategy);
    },

    setPreprocessor: function(preprocessor) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__PREPROCESSOR, preprocessor);
    },

    setPostprocessor: function(postprocessor) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__POSTPROCESSOR, postprocessor);
    },

    setSysDomain: function(sys_domain) {
        this.currentRecord.setValue(Constants.fields.ONE_EXTEND_CAPABILITY_DEFINITION__SYS_DOMAIN, sys_domain);
    },

    type: 'OneExtendCapabilityDefinitionService'
}
