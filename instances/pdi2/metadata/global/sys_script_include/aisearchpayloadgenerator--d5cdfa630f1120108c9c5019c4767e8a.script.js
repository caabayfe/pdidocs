var AISearchPayloadGenerator = Class.create();
AISearchPayloadGenerator.prototype = {
    initialize: function(templateScopeId, scanId, searchConfigPrefix) {
		this.templateScopeId = templateScopeId;
		this.scanId = scanId;
		this.searchConfigPrefix = searchConfigPrefix || "search";
    },
	
	count: 0,
	templateScopeId: '',
	scanId: '',
	searchConfigPrefix: '',
	
	generatePayload: function(searchConfigId) {
		
		var searchConfigRecord = new GlideRecord("sys_search_context_config");
		if (!searchConfigRecord.get(searchConfigId)) {
			var error = "Couldn't find Search Application with sys_id: " + searchConfigId;
			gs.error(error);
			throw error;
		}
		
		var doc = new XMLDocument2();
		
		var recordUpdateElement = doc.createElement("record_update");
		recordUpdateElement.setAttribute("table", "sys_search_context_config");
		doc.setCurrentElement(recordUpdateElement);

		this.addRecordToPayload(searchConfigRecord, doc);
		doc.setCurrentElement(recordUpdateElement);
		
		this.queryAndAddRecordsToPayload("sys_search_facet", searchConfigId, doc, recordUpdateElement);
		this.queryAndAddRecordsToPayload("sys_search_filter", searchConfigId, doc, recordUpdateElement);
		this.queryAndAddRecordsToPayload("m2m_search_context_config_search_source", searchConfigId, doc, recordUpdateElement);
		this.queryAndAddRecordsToPayload("m2m_search_context_config_search_scripted_processor", searchConfigId, doc, recordUpdateElement);
		
		//Create the payload!
		var payloadRecord = new GlideRecord("sys_app_scan_payload");
		payloadRecord.setValue('sys_scope', this.templateScopeId);
		payloadRecord.setValue('serialized_record', doc);
		payloadRecord.setValue('source_class', 'sys_search_context_config');
		payloadRecord.setValue('source_sys_id', searchConfigId);
		payloadRecord.setValue('scan_instance', this.scanId);
		if (!payloadRecord.insert()) {
			var error = "Couldn't create payload";
			gs.error(error);
			throw error;
		}
		
		gs.info(doc);
		return doc;
	},
	
	addRecordToPayload: function(record, doc) {
		doc.setCurrentElement(doc.createElement(record.getRecordClassName()));
		var recordElements = record.getElements();
		for (var i = 0; i < recordElements.size(); ++i) {
			
			var elementName = recordElements.get(i).getName();
			var elementValue = recordElements.get(i).getValue();
			
			//Special handling of certain elements
			if (!gs.nil(elementValue)) {
				if (elementName === 'sys_id') {
					//First lookup to see if we have this variable already
					var variableName = this.findScanVariableWithOriginalValue(elementValue);
					if (!variableName) {
						//We don't have a variable so we'll create one
						variableName = this.searchConfigPrefix + "_sys_id_" + this.count++;
						this.createScanVariable(variableName, elementValue);
						doc.createElementWithTextValue(elementName, "!!!" + variableName + "!!!");
					} else {
						//Use the variable we found
						doc.createElementWithTextValue(elementName, "!!!" + variableName + "!!!");
					}
				} else if (elementName === 'application_id') {
					doc.createElementWithTextValue(elementName, "!!!app_sys_id!!!");
				} else if (elementName === 'search_profile' || elementName === 'ais_search_source' 
						|| elementName === 'source' || elementName == 'search_scripted_processor'
						|| elementName === 'search_context_config') {
					var variableName = this.findScanVariableWithOriginalValue(elementValue);

					if (!variableName) {
						doc.createElementWithTextValue(elementName, elementValue);
					} else {
						doc.createElementWithTextValue(elementName, "!!!" + variableName + "!!!");
					}
				} else if (elementName === 'ais_facet_name') {
					var splits = elementValue.split(".");
					var tableName = splits[0];
					var tableNameVariable = this.findScanVariableWithOriginalValue(tableName);
					doc.createElementWithTextValue(elementName, "!!!" + tableNameVariable + "!!!" + "." + splits[1]);
				} else {
					//default
					doc.createElementWithTextValue(elementName, elementValue);
				}
			} else {
				// Empty element values should just be copied over
				doc.createElementWithTextValue(elementName, elementValue || '');			
			}
		}
	},
	
	queryAndAddRecordsToPayload: function(tableName, searchConfigId, doc, recordUpdateElement) {
		var records = new GlideRecord(tableName);
		records.addQuery("search_context_config", searchConfigId);
		records.query();
		while (records.next()) {
			this.addRecordToPayload(records, doc);
			doc.setCurrentElement(recordUpdateElement);
		}
	},
	
	findScanVariableWithOriginalValue: function(originalValue) {
		var scanVariable = new GlideRecord("sys_app_scan_variable");
		scanVariable.addQuery('sys_scope', this.templateScopeId);
		scanVariable.addQuery('original_value', originalValue);
		scanVariable.query();
		
		if (scanVariable.next()) {
			return scanVariable.getValue('name');
		}
	},
	
	createScanVariable: function(variableName, originalValue) {
		var scanVariable = new GlideRecord("sys_app_scan_variable");
		
		//If scan variable exists we don't need to create it:
		scanVariable.addQuery('sys_scope', this.templateScopeId);
		scanVariable.addQuery('original_value', originalValue);
		scanVariable.query();
		
		if (scanVariable.next()) {
			return;
		}
		
		scanVariable = new GlideRecord("sys_app_scan_variable");
		scanVariable.initialize();
		scanVariable.setValue('sys_scope', this.templateScopeId);
		scanVariable.setValue('name', variableName);
		scanVariable.setValue('original_value', originalValue);
		scanVariable.setValue('scan_instance', this.scanId);
		scanVariable.setValue('type', '242d82a65bea101001fb0c370581c7ea'); //Reference
		if (!scanVariable.insert()) {
			var error = "Couldn't create scan variable for: " + originalValue;
			gs.error(error);
			throw error;
		}
	},

    type: 'AISearchPayloadGenerator'
};
