var PDActivityAppObjectRepository = Class.create();
PDActivityAppObjectRepository.prototype = {
    initialize: function(tableName) {
        this.table = tableName || PDConstants.TABLES.PD_DIAGRAM_ACTIVITY_APP_OBJECT;
    },

    getByActivities: function(activitySysIds) {
        if (!Array.isArray(activitySysIds)) return null;

        var gr = new GlideRecord(this.table);
        gr.addQuery(PDConstants.FIELDS.ACTIVITY, 'IN', activitySysIds.join(','));
        gr.query();

        var result = [];
        while (gr.next()) {
            result.push(PDUtils.grToObject(gr, this.RECORD_FIELDS));
        }
        return result;
    },
	
	insertActivityAppObject: function(activityAppObject) {
		var activityId = (activityAppObject || {}).activityId;
		var targetTable = (activityAppObject || {}).targetTable;
		var targetRecord = (activityAppObject || {}).targetRecord;
		var sysId = (activityAppObject || {}).sysId;
		if (!activityId || !targetTable || !targetRecord)
			throw (gs.getMessage(
				'Missing one or more of required fields: activityId, targetTable, targetRecord'));
		
		var FIELDS = PDConstants.FIELDS;
		var gr = new GlideRecord(this.table);
		gr.setValue(FIELDS.ACTIVITY, activityId);
		gr.setValue(FIELDS.TARGET_TABLE, targetTable);
		gr.setValue(FIELDS.TARGET_RECORD, targetRecord);
		if (sysId)
			gr.setNewGuidValue(sysId);
		if (!gr.insert())
			throw (gs.getMessage('Unable to insert record in {0}', this.table));
		return PDUtils.grToObject(gr, this.RECORD_FIELDS);
	},
	
	deleteActivityAppObjects: function(activityAppObjects) {
		var noAppObjectsErrMsg = gs.getMessage('No activity app objects to delete');
		if (!Array.isArray(activityAppObjects) || !activityAppObjects.length)
			throw (noAppObjectsErrMsg);
		var activityId;
		var targetRecords = [];
		for (var i = 0; i < activityAppObjects.length; i++) {
			var aao = activityAppObjects[i];
			if (!activityId)
				activityId = aao.activityId;
			if (aao.activityId !== activityId)
				throw (
					gs.getMessage('App objects for deletion must belong to the same Activity'));
			if (aao.targetRecord)
				targetRecords.push(aao.targetRecord);
		}		
		if (!targetRecords.length)
			throw (noAppObjectsErrMsg);

		var FIELDS = PDConstants.FIELDS;
		var m2mIds = [];
		var grM2M = new GlideRecord(this.table);
		grM2M.addQuery(FIELDS.ACTIVITY, activityId);
		grM2M.addQuery(FIELDS.TARGET_RECORD, 'IN', targetRecords.join(','));
		grM2M.query();
		while(grM2M.next())
			m2mIds.push(grM2M.getUniqueValue());
		grM2M = new GlideRecord(this.table);
		grM2M.addQuery(FIELDS.SYS_ID, 'IN', m2mIds.join(','));
		grM2M.query();
		grM2M.deleteMultiple();
	},

    RECORD_FIELDS: [{
            name: PDConstants.FIELDS.SYS_ID,
			hasDisplayValue:true
        },
        {
            name: PDConstants.FIELDS.ACTIVITY,
			hasDisplayValue:true
        },
        {
            name: PDConstants.FIELDS.TARGET_TABLE,
			hasDisplayValue:true
        },
        {
            name: PDConstants.FIELDS.TARGET_RECORD,
			hasDisplayValue:true
        }
    ],

    type: 'PDActivityAppObjectRepository'
};
