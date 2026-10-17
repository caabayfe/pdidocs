(function executeRule(current, previous /*null when async*/) {

	var parentTable = current.process_def.table;
	var childTable = current.getValue("table");
	var sourceField = current.getValue("source_field");
	var targetField = current.getValue("target_field");
	var filter = current.getValue("filter");
	//Validate all mandatory fields are filled
	if(gs.nil(parentTable) || gs.nil(childTable) || gs.nil(sourceField) || gs.nil(targetField)) {
		gs.addErrorMessage(gs.getMessage("Please provide all mandatory fields"));
		current.setAbortAction(true);
		action.setRedirectURL(current);
		return;
	}

	//Validate user has write access on process config
    var grProcessConfig = current.process_def.getRefRecord();
    if (!grProcessConfig.canWrite()) {
        gs.addErrorMessage(gs.getMessage("You do not have permission to create this record"));
        current.setAbortAction(true);
		action.setRedirectURL(current);
        return;
    }
	
	//Validate source field is valid
	var grChild = new GlideRecord(childTable);
	if(!grChild.isValidField(sourceField)) {
		gs.addErrorMessage(gs.getMessage("Source field is not valid"));
		current.setAbortAction(true);
		action.setRedirectURL(current);
		return;
	}
	
	//Validate target field is valid
	var grParent = new GlideRecord(parentTable);
	if(!grParent.isValidField(targetField)) {
		gs.addErrorMessage(gs.getMessage("Target field is not valid"));
		current.setAbortAction(true);
		action.setRedirectURL(current);
		return;
	}
	
	//Validate that source field points to parentTable
	var allParentTables = new TableUtils(parentTable).getTables();
	var referenceTable = grChild[sourceField].getReferenceTable();
	if(allParentTables.indexOf(referenceTable) == -1) {
		gs.addErrorMessage(gs.getMessage("Source field '{0}' does not reference parent table '{1}'", [sourceField, parentTable]));
		current.setAbortAction(true);
		action.setRedirectURL(current);
		return;
	}
	
	//Validate that child config is not duplicate
	var processConfigUtil = new global.ProminProcessConfigUtil();
	var duplicateChildConfig = processConfigUtil.getDuplicateChildConfig(current.getValue("process_def"), childTable, sourceField, filter);
	if(!gs.nil(duplicateChildConfig)) {
		var link = '<a href="' + duplicateChildConfig + '" target="_blank">Click here</a>';
		gs.addErrorMessage(gs.getMessage("This child table config is already present. {0} to view existing child table configuration", [link]));
		current.setAbortAction(true);
		action.setRedirectURL(current);
		return;
	}

})(current, previous);
