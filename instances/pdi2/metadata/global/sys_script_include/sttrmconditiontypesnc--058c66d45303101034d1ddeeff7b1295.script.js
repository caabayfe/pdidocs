var STTRMConditionTypeSNC = Class.create();
STTRMConditionTypeSNC.prototype = {
    initialize: function(conditionTypeGr, _gs) {
        this._gr = conditionTypeGr;
        this._gs = _gs;
    },

    evaluate: function(currentGr) {
        var conditionType = this._gr.getValue('condition_type');
        if (conditionType === 'condition' || conditionType === 'mandatory_fields')
            return GlideFilter.checkRecord(currentGr, this._gr.getValue('condition'), true);

        if (conditionType === 'script')
            return new GlideScopedEvaluator().evaluateScript(this._gr, 'condition_script', {
                'current': currentGr
            });

        return false;
    },

	getMandatoryFieldsEncQuery: function() {
        if (!this._gr || this._gr.getValue('condition_type') !== 'mandatory_fields')
            return null;

        var mandatoryFieldsGr = this.getMandatoryFields();
        if (!mandatoryFieldsGr)
            return null;

        var gr = new GlideRecord(this._gr.getValue('table_name'));
        while (mandatoryFieldsGr.next())
            gr.addQuery(mandatoryFieldsGr.getValue('name'), 'ISNOTEMPTY', null);

        return gr.getEncodedQuery();
    },

    getMandatoryFields: function() {
        if (!this._gr || this._gr.getValue('condition_type') !== 'mandatory_fields')
            return null;

        var gr = new GlideRecord('sttrm_condition_type_field');
        gr.addQuery('sttrm_condition_type', this._gr.getUniqueValue());
        gr.query();
        return gr;
    },

    toJS: function() {
        var result = {
            'name': this._gr.getDisplayValue('name') || '',
            'description': this._gr.getDisplayValue('description') || '',
            'sys_id': this._gr.getUniqueValue()
        };

        if (this._gr.getValue('condition_type') !== 'mandatory_fields')
            return result;

        var mandatoryFieldsGr = this.getMandatoryFields();
        if (!mandatoryFieldsGr)
            return result;

        result.mandatory_fields = [];
        while (mandatoryFieldsGr.next())
            result.mandatory_fields.push(mandatoryFieldsGr.getValue('name'));

        return result;
    },

    type: 'STTRMConditionTypeSNC'
};
