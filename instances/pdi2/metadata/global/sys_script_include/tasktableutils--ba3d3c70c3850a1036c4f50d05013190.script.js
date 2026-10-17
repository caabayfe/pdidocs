var TaskTableUtils = Class.create();
TaskTableUtils.prototype = {
    initialize: function() {},

    getRecordCardData: function(tableName, recordId, isTaskBasedTable) {
        var title = '';
        var subtitle = '';
        var fields = [];
        var short_description = '';
        var gr;
        
        if (isTaskBasedTable)
            gr = new GlideRecordSecure('task');
        else
            gr = new GlideRecordSecure(tableName);

        var inputTableGR = new GlideRecord(tableName);
        title = inputTableGR.getClassDisplayValue();
        if (gr.get(recordId)) {
            var ge;
            if (gr.isValidField('task_effective_number'))
                subtitle = (gr.getValue('task_effective_number') || '').toString();
            else
                subtitle = (gr.getValue('number') || '').toString();

            if (gr.isValidField('short_description')) {
                short_description = (gr.getDisplayValue('short_description') || '').toString();
                ge = gr.getElement('short_description');

                fields.push({
                    "fieldLabel": ge ? ge.getLabel() : gs.getMessage("Short description"),
                    "fieldValue": short_description
                });
            }
            if (gr.isValidField('state')) {
                ge = gr.getElement('state');
                fields.push({
                    "fieldLabel": ge ? ge.getLabel() : gs.getMessage("State"),
                    "fieldValue": (gr.getDisplayValue('state') || '').toString()
                });
            }
        }

        return {
			"title": title,
			"subtitle": subtitle,
			"fields": fields
		};
    },

    type: 'TaskTableUtils'
};
