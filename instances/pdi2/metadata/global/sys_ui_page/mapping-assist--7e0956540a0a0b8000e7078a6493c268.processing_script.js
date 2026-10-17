processRequest();
response.sendRedirect("sys_transform_map.do?sys_id=" + sysparm_map_sys_id);
 
function processRequest() {   
	if (cancelled == "true") {
		gs.log("mapping assist cancelled");
	} else {
		var source_fields = source_field_list.split(',');
		var target_fields = target_field_list.split(',');
		
		var preserve = "";
		
		for (var i = 0; i < source_fields.length; i++) {
			var transformEntryGRSysId = handleFieldMapping(source_fields[i], target_fields[i]);
			preserve += transformEntryGRSysId + ",";
		}
		deleteStaleTransformEntries(preserve);
	}
}	

function handleFieldMapping(sourceField, targetField) {
	var transformEntryGRSysId = "";
	var transformEntryGR =  getTransformEntryGR(targetField);
	
	if(transformEntryGR.next()) {
		//handle existing entry.
		var oldTransEntrySourceField = transformEntryGR.getValue("source_field");
		var newTransEntrySourceField = sourceField;
		
		//case: source_field changed, delete old entry and create new one.
		if(newTransEntrySourceField !== oldTransEntrySourceField) {
			deleteTransformMapEntry(transformEntryGR.sys_id);
			transformEntryGRSysId = createTransformEntry(sourceField, targetField);
		}else {
			//case: no change, mark to avoid deletion.
			transformEntryGRSysId = transformEntryGR.sys_id;
		}
	}else {
		//case: new mapping.
		transformEntryGRSysId = createTransformEntry(sourceField, targetField);
	}
	return transformEntryGRSysId;
}

function getTransformEntryGR(targetField) {
	var sourceTable = sysparm_source_table;
	var targetTable = sysparm_target_table;
	
	var entryGR = new GlideRecord("sys_transform_entry");
	entryGR.addQuery("map",sysparm_map_sys_id);
	entryGR.addQuery("source_table",sourceTable);
	
	entryGR.addQuery("target_table",targetTable);
	entryGR.addQuery("target_field",targetField);
	entryGR.query();
	return entryGR;
}

function createTransformEntry(sourceField, targetField) {
	var sysid = "";
	var sourceTable = sysparm_source_table;
	var targetTable = sysparm_target_table;
	
	var entryGR = new GlideRecord("sys_transform_entry");
	
	entryGR.initialize();
	entryGR.map = sysparm_map_sys_id;
	entryGR.source_table = sourceTable;
	entryGR.source_field = sourceField;
	entryGR.target_table = targetTable;
	entryGR.target_field = targetField;
	entryGR.insert();
	
	return entryGR.sys_id;
}

function deleteTransformMapEntry(transformEntrySysId) {
	var targetTable = sysparm_target_table;
	
	var entryGR = new GlideRecord("sys_transform_entry");
	entryGR.addQuery("sys_id",transformEntrySysId);
	
	entryGR.query();
	if (entryGR.next()) {
		entryGR.deleteRecord();
	}
}

function deleteStaleTransformEntries(preserve) {
	var entryGR = new GlideRecord("sys_transform_entry");
	entryGR.addQuery("map",sysparm_map_sys_id);
	entryGR.query();
	while(entryGR.next()) {
		if (preserve.indexOf(entryGR.sys_id.toString()) == -1) {
			if (entryGR.target_field.toString().indexOf('sys_') != 0)
				entryGR.deleteRecord();
		}
	}
}
