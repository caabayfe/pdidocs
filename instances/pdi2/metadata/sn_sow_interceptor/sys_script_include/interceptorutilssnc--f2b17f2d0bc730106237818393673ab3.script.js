var InterceptorUtilsSNC = Class.create();
InterceptorUtilsSNC.prototype = {
    LOG_PROPERTY: 'sn_sow_interceptor_utils.log.level',

	RECORD_TYPE_TABLE: 'sn_sow_interceptor_record_type_selector',

	FIELD_APPLIES_TO: 'applies_to',
	FIELD_TITLE: 'title',
	FIELD_DESCRIPTION: 'description',
	FIELD_TARGET_TABLE: 'target_table',
	FIELD_VALUES: 'values',
	FIELD_SYS_ID: 'sys_id',
	FIELD_CONDITION: 'condition',
	FIELD_ORDER: 'order',

	initialize: function() {
		this._log = new global.GSLog(this.LOG_PROPERTY, this.type);
		this._log.includeTimestamp();

		if (this._log.atLevel(global.GSLog.DEBUG))
			this._log.debug('[initialize] type: ' + this.type);
	},

	getTableHierarchy: function() {
		var tableHierarchy = {};
		var taskTable, extensionTable, taskExtensions, tableExtensions;
		var extensionTableName, extensionTables, extensionTableMap;

		taskTable = new GlideTableHierarchy('task');
		if (taskTable.hasExtensions()) {
			taskExtensions = taskTable.getAllExtensions();
			
			for (var i = 0; i < taskExtensions.length; i++) {
				extensionTableName = taskExtensions[i];
				extensionTable = new GlideTableHierarchy(extensionTableName);

				extensionTables = [];

				if (extensionTable.hasExtensions()) {
					tableExtensions = extensionTable.getAllExtensions();
					
					for (var j = 0; j < tableExtensions.length; j++) {						
						extensionTableMap = {};
						extensionTableMap.name = tableExtensions[j];
						extensionTableMap.label = new GlideRecord(tableExtensions[j]).getClassDisplayValue();
						extensionTables.push(extensionTableMap);
					}

				} else {
					extensionTableMap = {};
					extensionTableMap.name = extensionTableName;
					extensionTableMap.label = new GlideRecord(extensionTableName).getClassDisplayValue();
					extensionTables.push(extensionTableMap);
				}

				tableHierarchy[extensionTableName] = extensionTables;
			}
		}
		return tableHierarchy;
	},

	getRecordTypes: function(appliesTo, referencedField, parentSysId) {
		var recTypes = [];
		var appliesToVal = appliesTo + '';
		var referencedFieldVal = referencedField + '';
		var parentSysIdVal = parentSysId + '';

		if (!appliesToVal)
			return recTypes;

		var recGr = new GlideRecord(appliesToVal);
		recGr.initialize();
		if (referencedFieldVal && parentSysIdVal)
			recGr.setValue(referencedFieldVal, parentSysIdVal);

		var records = this._getRecords(appliesToVal);
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			if (!record.condition)
				recTypes.push(record);
			else {
				if (GlideFilter.checkRecord(recGr, record.condition))
					recTypes.push(record);
			}	
		}

		return recTypes;
	},

	_getRecords: function(appliesTo) {
		var recordArray = [];
		
		var recordGr = new GlideRecord(this.RECORD_TYPE_TABLE);
		recordGr.addActiveQuery();
		recordGr.addQuery(this.FIELD_APPLIES_TO, appliesTo);
		recordGr.orderBy(this.FIELD_ORDER);
		recordGr.query();
		while (recordGr.next()){
			var record = {};
			record[this.FIELD_TITLE] = recordGr.getDisplayValue(this.FIELD_TITLE);
			record[this.FIELD_DESCRIPTION] = recordGr.getDisplayValue(this.FIELD_DESCRIPTION);
			record[this.FIELD_TARGET_TABLE] = recordGr.getValue(this.FIELD_TARGET_TABLE);
			record[this.FIELD_VALUES] = recordGr.getValue(this.FIELD_VALUES);
			record[this.FIELD_CONDITION] = recordGr.getValue(this.FIELD_CONDITION);
			record[this.FIELD_SYS_ID] = recordGr.getUniqueValue();
			recordArray.push(record);
		}

		return recordArray;
	},

    type: 'InterceptorUtilsSNC'
};
