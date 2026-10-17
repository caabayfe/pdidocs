var GeneratorTypeService = Class.create();
GeneratorTypeService.prototype = {
    tableName: "sn_nb_action_resource_generator_type",

    initialize: function(grOrSysId) {
        if (grOrSysId && grOrSysId.sys_class_name == this.tableName) {
            this.currentRecord = grOrSysId;
        } else if (grOrSysId) {
            var gr = new GlideRecord(this.tableName);
            if (gr.get(grOrSysId)) {
                this.currentRecord = gr;
            }
        }
    },

    hasValidRecord: function() {
        return this.currentRecord && this.currentRecord.sys_class_name == this.tableName;
    },

    getGeneratorTypeName: function() {
        return this.currentRecord.getValue(Constants.COL_NAME);
    },

    getGeneratorScript: function() {
        return this.currentRecord.getValue(Constants.COL_HANDLER);
    },

    getGeneratorScriptAPIName: function() {
        return this.currentRecord[Constants.COL_HANDLER][Constants.COL_API_NAME];
    },

    isCustom: function() {
        return this.currentRecord[Constants.COL_USE_CUSTOM_MODEL];
    },

    getInputTable: function() {
        if (this.isCustom()) {
            return this.currentRecord[Constants.COL_MODEL_INPUT_TABLE];
        } else {
            return Constants.TBL_GENERATOR_TYPE_INPUT;
        }
    },

    type: 'GeneratorTypeService'
};
