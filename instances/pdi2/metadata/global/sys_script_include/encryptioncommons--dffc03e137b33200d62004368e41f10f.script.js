var EncryptionCommons = Class.create();
EncryptionCommons.prototype = {
    initialize: function() {
    },
	
	/*
	Lists all fields that can be encrypted for a given table
	Takes an additionalValidator as parameter that can be passed to apply additional checks
	The validator should take the fieldName as parameters and return true if the field can be encrypted
	Note that we are passing the ED, available as 'this' in the validator
	*/
	getEncryptableFieldsForTable: function(tableName, additionalValidator) {
		if (gs.nil(tableName)) {
			gs.warn('getEncryptableFieldsForTable called with empty table name');
			return [];
		}
			
		var descriptor = GlideTableDescriptor.get(tableName);
		
		if (!descriptor.isValid()) {
			gs.warn('getEncryptableFieldsForTable called on an invalid table');
			return [];
		}
		
		var elements = descriptor.getSchemaList();
		var encryptableFields = [];
		for (var i = 0, len = elements.size(); i < len; i++) {
			var ed = elements.get(i);
			var fieldName = ed.getName();
			var isNumber = fieldName == 'number';
			try {
				// don't allow columns starting with 'sys' or named 'number', virtual fields, or choice fields or synchronized fields(DEF0572869) to be encrypted
				if (fieldName.startsWith('sys') || fieldName.startsWith('edge_') || isNumber || ed.isVirtual() || ed.isChoiceTable() || ed.getBooleanAttribute('synchronizePartitions'))
					  continue;
				
				// Inherited date and date/time fields cannot be marked for encryption
				if (ed.getInternalType() == 'glide_date' || ed.getInternalType() == 'glide_date_time') {
					if (ed.getFirstTableName() != tableName)
						continue;
				}

				//either there is no validator and we add to the list, or we run the validator
				// anonymous function can get variable number of parameters
				// pass THIS object to validator
				if (additionalValidator === undefined || additionalValidator.call(ed, fieldName, this))
					encryptableFields.push(fieldName);
			} catch (e) {
				gs.debug('EncryptionCommons failed to process ' + tableName + '.' + fieldName);
				gs.debug(e);
			}
		}
		return encryptableFields;
	},
	
	addToArrayTablesWithBooleanAttributeSetToTrue: function(array, attributeName) {
		var tableDefinition = new GlideRecord('sys_dictionary');

		tableDefinition.addQuery('internal_type', 'collection');
		tableDefinition.addQuery('attributes', 'CONTAINS', attributeName);
		tableDefinition.query();

		while (tableDefinition.next()) {
			var tableName = tableDefinition.getValue('name');
			if (GlideTableDescriptor.get(tableName).getED().getBooleanAttribute(attributeName)) {
				array.push(tableName);
			}
		}

		return array;
	},

	/**
	 * Returns true if the table is marked for auditing, false otherwise.
	 */
	isTableAudited : function(tableName) {
		var auditor = new GlideAuditor(tableName, null);
		return auditor.auditTable();
	},

	getUsableCryptoModules: function() {
		var moduleIDs = "";
		var moduleGR = new GlideRecord("sys_kmf_crypto_module");
		moduleGR.addQuery("name", "!=", "column_level_encryption");
		if (!gs.hasRole("maint"))
			moduleGR.addQuery("internal_module", "false");
		moduleGR.query();
		
		while (moduleGR.next()) {
			var moduleID = moduleGR.getUniqueValue();
			if (moduleGR.getValue("parent_crypto_module") == "620aed380b233300af4deaf1a3673a09" && 
			    moduleGR.getValue("crypto_module_lifecycle_state") == "published") {
				moduleIDs += moduleID + ",";
			} else if (moduleGR.getValue("parent_crypto_module") != "620aed380b233300af4deaf1a3673a09"){
				moduleIDs += moduleID + ",";
			}
		}

		if (moduleIDs.length > 0) {
			moduleIDs = moduleIDs.substring(0, moduleIDs.length - 1);
		}

		return moduleIDs;
	},

	getCleDefaultSupportedFieldTypes: function() {
		var defaultFields = new SNC.ColumnLevelEncryptionAPI().getDefaultFieldsList();
		var errorMessage = "Error getting the default fields array";

		if (defaultFields.some((x) => x.includes(errorMessage))){
			gs.addErrorMessage(errorMessage);
			return [];
		}
			
		return defaultFields;
	},

	getCleEnterpriseSupportedFieldTypes: function() {
		var enterpriseFields = new SNC.ColumnLevelEncryptionAPI().getEnterpriseFieldsList();
		var errorMessage = "Error getting the enterprise fields array.";
		
		if (enterpriseFields.some((x) => x.includes(errorMessage))){
			gs.addErrorMessage(errorMessage);
			return [];
		}
			
		return enterpriseFields;
	},

    type: 'EncryptionCommons'
};
