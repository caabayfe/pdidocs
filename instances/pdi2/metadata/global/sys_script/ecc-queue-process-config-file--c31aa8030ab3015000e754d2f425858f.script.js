processConfigFile();

function processConfigFile() {
	var midName = new String(current.source).split("/")[1];
	var midID = getMidServerID(midName);
	if (!midID)
		return;
	
	var newParams = getNewParams();
	var curParams = getCurParams(midID);
	
	// Collect information for tagged records. Records with 'NO Overwrite' tag, will not be modified
	var tagUtil = new TagUtil();
	var tagSysId = tagUtil.getTagSysId('NO Overwrite');
	var taggedRecords = tagSysId ? tagUtil.getTaggedRecords(tagSysId, 'ecc_agent_config') : [];
	var taggedRecordsNumber = taggedRecords.length;
	
	// reconcile new and current...
	for (var curName in curParams) {
		curValue = curParams[curName];
		newValue = newParams[curName];
		if (newValue == null) 
			deleteCur(midID, curName, taggedRecords, tagSysId);
		else
			updateCur(midID, curName, newValue, taggedRecords, tagSysId);
		delete newParams[curName];
	}
	
	for (var newName in newParams) {
		// Process all new parameters except 'mid_sys_id'
		if (newName !== 'mid_sys_id') {
			newValue = newParams[newName];
			insertCur(midID, newName, newValue);
		}
	}

	// Process 'mid_sys_id' last and call autoSyncMIDProfile
	if (newParams['mid_sys_id']) {
        	insertCur(midID, 'mid_sys_id', newParams['mid_sys_id']);
        	autoSyncMIDProfile(midID);
	}

	// If for the current config.file ecc queue record we avoid updating any record
	// MID Server needs to sync with the instance to retrieve the existing information
	if (taggedRecords.length < taggedRecordsNumber) {
		var priority = 'Interactive';
		var eccParams = {
			'source': 'updateConfig',
			'topic': 'SystemCommand'
		};
		new SNC.MidEccSender().sendMessageToSpecificMid(midName, priority, eccParams, {});
		
		// If we processed all tagged records, it is safe to remove the tag
		if (taggedRecords.length == 0 && tagSysId) {
			tagUtil.deleteTag(tagSysId);
		}
	}
	
	current.state = 'processed';
}

function deleteCur(midID, name, taggedRecords, tagSysId) {
	var tagUtil = new TagUtil();
	var gr = new GlideRecord('ecc_agent_config');
	gr.addQuery('ecc_agent', midID);
	gr.addQuery('param_name', name);
	gr.query();
	gr.setWorkflow(false);
	while (gr.next()) {
		var recIndex = taggedRecords.indexOf(gr.sys_id + '');
		if (recIndex > -1) {
			tagUtil.deleteTagEntry(tagSysId, taggedRecords[recIndex], 'ecc_agent_config');
			taggedRecords.splice (recIndex, 1);
			
		} else {
			gr.deleteRecord();
		}
	}
}

function updateCur(midID, name, value, taggedRecords, tagSysId) {
	var tagUtil = new TagUtil(); 
	var gr = new GlideRecord('ecc_agent_config');
	gr.addQuery('ecc_agent', midID);
	gr.addQuery('param_name', name);
	gr.query();
	if (!gr.next())
		return;
	var recIndex = taggedRecords.indexOf(gr.sys_id + '');
	if (recIndex > -1) {
		tagUtil.deleteTagEntry(tagSysId, taggedRecords[recIndex], 'ecc_agent_config');
		taggedRecords.splice (recIndex, 1);
	} else {
		if (gr.value != value) {
			gr.value = value;
			gr.setWorkflow(false);
			gr.update();
		}
	}
}

function insertCur(midID, name, value) {
	var gr = new GlideRecord('ecc_agent_config');
	gr.initialize();
	gr.ecc_agent = midID;
	gr.param_name = name;
	gr.value = value;
	gr.setWorkflow(false);
	gr.insert();
}

// We need to autoconfigure profile settings after parameters from config.xml file are synced to the instance to avoid them from getting overwritten.
// Auto Config will only happen the first time the MID connects to the instance.
function autoSyncMIDProfile(midID) {
    var gr = new GlideRecord('ecc_agent');
    gr.get(midID);
    var midProfileId = gr.profile_id;
    if (midProfileId) {
        var mcu = new MIDConfigurationUtil();
        mcu.configure(midProfileId, gr.sys_id);
    }
}

function getNewParams() {
	var result = {};
	var XMLUtil = GlideXMLUtil;
	var doc = XMLUtil.parse(current.payload);
	var params = XMLUtil.selectNodes(doc.getDocumentElement(), "//parameter");
	for (var i = 0; i < params.getLength(); i++) {
		var param = params.item(i);
		var name = param.getAttribute('name');
		var value = param.getAttribute('value');
		result[name] = value;
	}
	return result;
}

function getCurParams(midID) {
	var result = {};
	var gr = new GlideRecord('ecc_agent_config');
	gr.addQuery('ecc_agent', midID);
	gr.query();
	while (gr.next())
		result['' + gr.param_name] = '' + gr.value;
	return result;
}

function getMidServerID(midName) {
	var gr = new GlideRecord('ecc_agent');
	gr.addQuery('name', midName);
	gr.query();
	return gr.next() ? gr.sys_id : null;
}
