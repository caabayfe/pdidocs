(function deleteReferenceRecords(current, previous) {
    var recordTables = [{
            tableName: 'sys_app_template_manifest',
            columnName: 'template'
        }
    ];

	// If the delete action is aborted by some other script, then do not delete the records.
    if (!gs.nil(current) && !current.isActionAborted()) {
        var templateSysId = current.getValue("sys_id");
        recordTables.forEach(function(recordTable) {
            var records = new GlideRecord(recordTable.tableName);
            records.addQuery(recordTable.columnName, templateSysId);
            records.query();

            if (records.hasNext()) {
                records.deleteMultiple();
            }
        });

        var templateMappingGR = new GlideRecord('sys_app_flow_template_mapping');
        templateMappingGR.addQuery('template', templateSysId);
        templateMappingGR.query();
        if(templateMappingGR.next()) {
            var flowTemplateSysId = templateMappingGR.getValue('flow');
            var query =  'sys_id=' + flowTemplateSysId;
			var flowRecord = new GlideRecord('sys_hub_flow');
			flowRecord.addEncodedQuery(query);
			flowRecord.query();
			if (flowRecord.hasNext()) {
				flowRecord.deleteMultiple();
			}			
        }
		

    }
})(current, previous);
