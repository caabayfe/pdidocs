var GeneratorTypeInputService = Class.create();

GeneratorTypeInputService.getBySysId = function(typeSysId) {
    var typeInputs = [];
    var gr = new GlideRecord("sn_nb_action_generator_type_input");
    gr.addQuery(Constants.COL_MODEL, typeSysId);
    gr.query();

    while (gr.next()) {
        typeInputs.push(new GeneratorTypeInputService(gr).getName());
    }
    return typeInputs;
};

GeneratorTypeInputService.prototype = {
    tableName: "sn_nb_action_generator_type_input",

    initialize: function(grOrSysId) {
        if (grOrSysId && grOrSysId.sys_class_name) {
            this.currentRecord = grOrSysId;
        } else if (grOrSysId) {
            var gr = new GlideRecord(this.tableName);
            if (gr.get(grOrSysId)) {
                this.currentRecord = gr;
            }
        }
    },

    getName: function() {
        return this.currentRecord.getValue(Constants.COL_ELEMENT);
    },

    type: 'GeneratorTypeInputService'
};
