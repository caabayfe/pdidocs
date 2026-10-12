var PDSwimLaneRepository = Class.create();
PDSwimLaneRepository.prototype = {
    initialize: function() {},
    type: 'PDSwimLaneRepository',
	
	insertSwimLane: function(fields) {
		fields = fields || {};
		var sysId = fields.sysId;
		var processDefinition = fields.processDefinition;
		var label = fields.label;
		var order = fields.order;
		var active = fields.active;
		var image = fields.image;
		
		if (!sysId || !processDefinition || !label || !order)
			throw (gs.getMessage(
				'Missing one or more of required fields: sysId, processDefinition, label, order') );
		
		var grProcessDefinition = new GlideRecord(PDConstants.TABLES.PD_PROCESS_DEFINITION);
		if (!grProcessDefinition.get(processDefinition))
			throw (gs.getMessage('Unable to find Process Definition with id: {0}', processDefinition));
		
		var FIELDS = PDConstants.FIELDS;
		var gr = new GlideRecord(PDConstants.TABLES.PD_SWIMLANE);
		gr.setNewGuidValue(sysId);
		gr.setValue(FIELDS.PROCESS_DEFINITION, processDefinition);
		gr.setValue(FIELDS.LABEL, label);
		gr.setValue(FIELDS.ORDER, order);
		active !== undefined && gr.setValue(FIELDS.ACTIVE, active);
		image !== undefined && gr.setValue(FIELDS.IMAGE, image);
		if (!gr.insert())
			throw gs.getMessage(
					'Unable to insert swim lane. {0}', gr.getLastErrorMessage());
		return PDUtils.grToObject(gr, this.RECORD_FIELDS);
	},
	
	updateSwimLane: function(fields) {
		fields = fields || {};
		var sysId = fields.sysId;
		var processDefinition = fields.processDefinition;
		var label = fields.label;
		var order = fields.order;
		var active = fields.active;
		var image = fields.image;

		if (!sysId)
			throw (gs.getMessage('Missing required field: sysId'));

		var gr = new GlideRecord(PDConstants.TABLES.PD_SWIMLANE);
		if (!gr.get(sysId))
			throw (gs.getMessage('Unable to find swim lane with id: {0}', sysId));
		
		var FIELDS = PDConstants.FIELDS;
		processDefinition !== undefined && gr.setValue(FIELDS.PROCESS_DEFINITION, processDefinition);
		label !== undefined && gr.setValue(FIELDS.LABEL, label);
		order !== undefined && gr.setValue(FIELDS.ORDER, order);
		active !== undefined && gr.setValue(FIELDS.ACTIVE, active);
		image !== undefined && gr.setValue(FIELDS.IMAGE, image);
		if (!gr.update())
			throw gs.getMessage(
					'Unable to update swim lane. {0}', gr.getLastErrorMessage());
		return PDUtils.grToObject(gr, this.RECORD_FIELDS);
	},
	
	deleteSwimLanes: function(swimLaneIdsStr) {
		if (!(swimLaneIdsStr || '').length)
			throw (gs.getMessage('No swim lane ids provided for deletion'));

		var gr = new GlideRecord(PDConstants.TABLES.PD_SWIMLANE);
		gr.addQuery(PDConstants.FIELDS.SYS_ID, 'IN', swimLaneIdsStr);
		gr.query();
		gr.deleteMultiple();
	},

	RECORD_FIELDS: [
		{
            name: PDConstants.FIELDS.SYS_ID,
			hasDisplayValue:true
        },
        {
            name: PDConstants.FIELDS.PROCESS_DEFINITION,
			hasDisplayValue:true
        },
        {
            name: PDConstants.FIELDS.LABEL,
			hasDisplayValue:true
        },
        {
            name: PDConstants.FIELDS.ORDER,
			hasDisplayValue:true
        },
		{
            name: PDConstants.FIELDS.ACTIVE,
			hasDisplayValue:true
        },
		{
            name: PDConstants.FIELDS.IMAGE,
			hasDisplayValue:true
        }
    ]
};
