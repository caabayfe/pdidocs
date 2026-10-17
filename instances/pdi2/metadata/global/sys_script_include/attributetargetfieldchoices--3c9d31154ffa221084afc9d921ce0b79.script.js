var AttributeTargetFieldChoices = Class.create();
AttributeTargetFieldChoices.prototype = {
    initialize: function() {},

    process: function(tableName) {
        var allowedFields = [];
        var allowedTypes = ['reference', 'string', 'integer'];
        var gr = new GlideRecordSecure(tableName);
        var fields = gr.getElements();

        for (var i = 0; i < fields.size(); i++) {
            var field = fields.get(i);
            var name = field.getED().getName();
            var type = field.getED().getInternalType() + '';
            if (!name.startsWith('sys') && allowedTypes.includes(type)) {
                allowedFields.push(name);
            }
        }

        return allowedFields;
    },

    type: 'AttributeTargetFieldChoices'
};
