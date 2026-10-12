var PDPanelOverrideRepository = Class.create();
PDPanelOverrideRepository.prototype = {
    initialize: function() {
        this.table = PDConstants.TABLES.PD_PANEL_OVERRIDE;
    },

    getPanelOverrides: function(processTypeId) {
        var gr = new GlideRecord(this.table);

        if (processTypeId && processTypeId !== "null") {
            gr.addEncodedQuery(PDConstants.FIELDS.PROCESS_TYPE + '=' + processTypeId + '^OR' + PDConstants.FIELDS.PROCESS_TYPE + 'ISEMPTY');
        } else {
            gr.addNullQuery(PDConstants.FIELDS.PROCESS_TYPE);
        }
        gr.orderByDesc(PDConstants.FIELDS.SYS_CREATED_ON);
        gr.query();

		if (!gr.canRead()) {
			throw PADConstants.Errors.Messages.UNAUTHORIZED;
		}

        var results = [];
        while (gr.next()) {
            results.push({
                name: gr.getValue(PDConstants.FIELDS.NAME),
                itemType: gr.getValue(PDConstants.FIELDS.ITEM_TYPE),
                activityDefinitionId: gr.getValue(PDConstants.FIELDS.ACTIVITY_DEFINITION),
                tagName: gr.getDisplayValue(PDConstants.FIELDS.UI_COMPONENT),
                processTypeId: gr.getValue(PDConstants.FIELDS.PROCESS_TYPE),
                additionalFunctionality: gr.getValue(PDConstants.FIELDS.ADDITIONAL_FUNCTIONALITY)
            });
        }

        return results;
    },

    type: 'PDPanelOverrideRepository'
};
