var ProminAllowedConstraintFieldList = Class.create();
ProminAllowedConstraintFieldList.prototype = {
    initialize: function() {},

    process: function(tableName, currentTableName, conditionId) {
        var allowedFields = [];
        if (!gs.nil(conditionId)) {
            var conditionGr = new GlideRecord('promin_finding_def_condition');
            if (conditionGr.get(conditionId) && !gs.nil(conditionGr.getValue('entity'))) {
                var gr = new GlideRecord('promin_activity_def');
                gr.addQuery('entity', conditionGr.getValue("entity"));
                gr.query();
                while (gr.next()) {
                    allowedFields.push(gr.getValue('field'));
                }
                return (allowedFields.length > 0) ? allowedFields : null;
            }
        }
        return new ProminAllowedColumnList().process(tableName);
    },

    type: 'ProminAllowedConstraintFieldList'
};
