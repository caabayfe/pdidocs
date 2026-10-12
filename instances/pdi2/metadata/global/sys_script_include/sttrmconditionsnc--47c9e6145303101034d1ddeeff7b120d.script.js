var STTRMConditionSNC = Class.create();
STTRMConditionSNC.prototype = {
    initialize: function(conditionGr, _gs) {
        this._gr = conditionGr;
        this._gs = _gs || gs;
    },

    evaluate: function(currentGr) {
        // These are conditions defined on the transition condition
        var conditionType = this._gr.getValue('condition_type');
        if (conditionType === STTRM.CONDITION_TYPE || conditionType === STTRM.MANDATORY_FIELDS)
            return GlideFilter.checkRecord(currentGr, this._gr.getValue('condition'), true);

        if (conditionType === STTRM.SCRIPT_TYPE)
            return new GlideScopedEvaluator().evaluateScript(this._gr, 'condition_script', {
                'current': currentGr
            });

        // This is a pre-defined condition a.k.a. canned condition
        return new STTRMConditionType(this._gr.condition_type.getRefRecord()).evaluate(currentGr);
    },

    getConditionTypeRefQual: function() {
        // dotwalk++
        var tableName = this._gr.sttrm_state_transition.from_state.sttrm_model.table_name + '';
        if (!tableName)
            return 'table_nameISEMPTY';

        var tables = [];
        var tableList = GlideDBObjectManager.get().getTables(tableName);
        for (var i = 0; i < tableList.size(); i++)
            tables.push(tableList.get(i));

        return 'table_nameISEMPTY^ORtable_nameIN' + tables.join(',');
    },

    getMandatoryFieldsEncQuery: function() {
        if (!this._gr || this._gr.getValue('condition_type') !== STTRM.MANDATORY_FIELDS)
            return null;

        var mandatoryFieldsGr = this.getMandatoryFields();
        if (!mandatoryFieldsGr)
            return null;

        var tableName = this._gr.sttrm_state_transition.from_state.sttrm_model.table_name + '';
        if (!tableName)
            return null;

        var gr = new GlideRecord(tableName);
        while (mandatoryFieldsGr.next())
            gr.addQuery(mandatoryFieldsGr.getValue('name'), 'ISNOTEMPTY', null);

        return gr.getEncodedQuery();
    },

    getMandatoryFields: function() {
        if (!this._gr || this._gr.getValue('condition_type') !== STTRM.MANDATORY_FIELDS)
            return null;

        var gr = new GlideRecord('sttrm_transition_condition_field');
        gr.addQuery('transition_condition', this._gr.getUniqueValue());
        gr.query();
        return gr;
    },

    toJS: function() {
        var result = {
            'name': this._gr.getDisplayValue('name') || '',
            'description': this._gr.getDisplayValue('description') || '',
            'sys_id': this._gr.getUniqueValue()
        };

        if (this._gr.getValue('condition_type') !== STTRM.MANDATORY_FIELDS)
            return result;

        var mandatoryFieldsGr = this.getMandatoryFields();
        if (!mandatoryFieldsGr)
            return result;

        result.mandatory_fields = [];
        while (mandatoryFieldsGr.next())
            result.mandatory_fields.push(mandatoryFieldsGr.getValue('name'));

        return result;
    },

    type: 'STTRMConditionSNC'
};
