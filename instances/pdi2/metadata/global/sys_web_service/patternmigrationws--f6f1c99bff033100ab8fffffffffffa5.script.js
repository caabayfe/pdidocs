try {
	gs.log("Executing PatternMigrationWS: " + request.purpose);
	gs.log("Incoming json string: " + request.jsonStr);
	var params = JSON.parse(request.jsonStr);
	switch(request.purpose) {
		case 'createTable': {
			var xmlStr = params.dictionaryXml;
			var doc = new GlideXMLDocument();
			var isValid = doc.parse(xmlStr);
			if (!isValid)
				throw new Error("Invalid dictionary xml");
			
			var boot = new GlideBootstrap(doc.getDocument());
			response.result = boot.upgradeTables();
			
			// Creating tables with dictionary xmls doesn't add them to the current update set,
			// so we need to do that explicitly for customer support
			if (params.addToUpdateSet == 'true')
				addToUpdateSet(params, doc);
			break;
		}
		case 'uploadPatterns': {
			var xmlStr = params.updateXml;
			var loader = new GlideLoader();
			loader.loadXML(xmlStr);
			response.result = "DONE";
			break;
		}
		case 'getTables': {
			var tableName = params.tableName;
			var tableUtils = new TableUtils(tableName);
			var tables = tableUtils.getTables();
			response.result = tables;
			break;
		}
		case 'getUpdateXml': {
			var gr = new GlideRecord(params.tableName);
			gr.addQuery("sys_id",params.sysId);
			gr.query();
			gr.next();
			var xml = gs.unloadRecordToXML(gr,true);
			response.result = xml;
			break;
		}
		case 'syncWithMIDServers': {
			var ptl = new PatternLibrary();
			var citChanged = params.citChanged;
			var patternChanged = params.patternChanged;
			if (citChanged == 'true')
				ptl.notifyMIDsCitChanged();
			if (patternChanged == 'true')
				ptl.notifyMIDs(params.patternNames, 'migration');
			response.result = 'DONE';
			break;
		}
		default:
		unknownRequest(request.purpose);
	}
} catch(err){
	response.result = 'PATTERN_MIGRATION_WS_ERROR: ' + err;
}

function unknownRequest(purpose) {
	response.result = 'UNKNOWN_REQUEST: ' + purpose;
}

function addToUpdateSet(params, doc) {
	gs.log("*** Adding dictionary xml to current update set ***");
	// Getting current update set id
	var api = new UpdateSetAPI();
	var updateSetId = api.getCurrentUpdateSetID();
	if (updateSetId == null) {
		gs.log("*** No current update set found ***");
		return;
	}
	
	// Wrapping the dictionary xml with record_update tag
	var recordUpdateDoc = GlideXMLUtil.newDocument('record_update');
	var payload = recordUpdateDoc.importNode(doc.getDocumentElement(), true);
	recordUpdateDoc.getDocumentElement().appendChild(payload);
	
	// Adding a record to sys_update_xml, referencing the current update set and holding
	// the dictionary xml as payload
	var tableName = params.tableName;
	if (tableName == null) {
		gs.log("*** Table name is empty, not adding to current update set ***");
		return;
	}
	
	var gr = new GlideRecord('sys_update_xml');
	gr.setValue('category', 'customer');
	gr.setValue('name', params.tableName + '.xml');
	gr.setValue('table', params.tableName);
	gr.setValue('update_domain','global');
	gr.setValue('target_name', params.label);
	gr.setValue('update_set', updateSetId);
	gr.setValue('payload', GlideXMLUtil.toString(recordUpdateDoc));
	gr.setValue('action', 'INSERT');
	gr.setValue('comments', 'Created during ServiceWatch migration');
	gr.setValue('type', 'Database field(s)');
	gr.insert();
	
	gs.log("*** Dictionary xml was added to update set ***");
}
