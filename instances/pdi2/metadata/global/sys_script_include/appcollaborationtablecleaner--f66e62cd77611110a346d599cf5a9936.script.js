var AppCollaborationTableCleaner = Class.create();
AppCollaborationTableCleaner.prototype = {
    initialize: function() {
		this._emptyRecords = {};
		this._sysAppReferenceField = {
			fieldName: 'application',
			referenceTableName: 'sys_app'
		};
    },
	
	_hasEmptyReferenceFields: function (glideRecord, referenceFields) {
		var hasEmptyReference = false;
		
		for (var i=0; i<referenceFields.length; i++ ){
			var referenceField = referenceFields[i];
			var refRecord = glideRecord.getElement(referenceField.fieldName).getRefRecord();
			
			if (!refRecord.isValidRecord()) {
				hasEmptyReference = true; 
				break;
			}
		}
		
		return hasEmptyReference;
	},
	
	_cleanTable: function(current, options) {
		/* options: {
			execute: boolean,
			tableName: 'string'
			referenceFields: [{fieldName, referenceTableName}]
		} */
		
		var gr = new GlideRecordSecure(options.tableName);
		gr.addQuery('descriptor', current.getValue('sys_id'));
		gr.query();
		
		this._emptyRecords[options.tableName] = {
			sysIds: [],
			count: 0
		};
		
		while(gr.next()) {
			var recordSysId = gr.getValue('sys_id');
			
			if(this._hasEmptyReferenceFields(gr, options.referenceFields)) {
				this._emptyRecords[options.tableName].sysIds.push(recordSysId);
				
				if(options.execute) {
					gr.deleteRecord();
				}
			}
		}
		
		this._emptyRecords[options.tableName].count = this._emptyRecords[options.tableName].sysIds.length;
	},
	
	_cleanTables: function (current, execute) {
		this._cleanAppCollaborationGroupTable(current, execute);
		this._cleanAppCollaborationUserTable(current, execute);
	},
	
	_cleanAppCollaborationGroupTable: function (current, execute) {
		var options = {
			execute: execute,
			tableName: 'sys_appcollab_group',
			referenceFields: [
				{
					fieldName: 'group',
					referenceTableName: 'sys_user_group'
				},
				this._sysAppReferenceField
			]
		};
		
		this._cleanTable(current, options);

	},
	
	_cleanAppCollaborationUserTable: function (current, execute) {				
		var options = {
			execute: execute,
			tableName: 'sys_appcollab_user',
			referenceFields: [
				{
					fieldName: 'user',
					referenceTableName: 'sys_user'
				},
				this._sysAppReferenceField
			]
		};
		
		this._cleanTable(current, options);
	},

	/**
	* Returns an object that can be used to preview information for
	* records that will be removed
	* @param {Object} current GlideRecord [sys_appcollab_descriptor]
	* @return {Object} map tableName: {sysIds: [], count }
	*/
	previewCleanTables: function(current) {
		this._cleanTables(current, false);

		return this._emptyRecords;
	},
	
	/**
	* Returns an object that can be used to display information for
	* records that were removed
	* @param {Object} current GlideRecord [sys_appcollab_descriptor]
	* @return {Object} map tableName: {sysIds: [], count }
	*/
	cleanTables: function(current) {
		this._cleanTables(current, true);
		
		return this._emptyRecords;
	},

    type: 'AppCollaborationTableCleaner'
};
