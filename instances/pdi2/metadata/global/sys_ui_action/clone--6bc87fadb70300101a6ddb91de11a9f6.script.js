var pb = new global.PlaybookUtils();

// Process Automation Definition Shared table definitions used here
var activityTypePropertyTable = current.getTableName() + '_prop'; //'sys_pd_activity_type_prop'; 

action.setRedirectURL(copyActivityType(current));
// Clone Activity Type
function copyActivityType(src) {
	var srcId = src.getUniqueValue();
	var copyName = pb.getCopyName(src.getTableName(), 'name', src.getValue('name'));
	var copiedActivityUI;
		
	var newFields = [{'name': copyName}, {'sys_policy': ''}];
	var gRU = new GlideRecordUtil();
	var hasActivityUIs = false;
	var previousActivityUIId;
	
	// check if we have the plugins turned on for activity UIs
	gRU.getFields(src).forEach(function(field) {
		if (field === 'default_activity_ui') {
			hasActivityUIs = true;
		}
	});
	// if we have activity UI's from the plugin, set up the copy of default UI
	if (hasActivityUIs) {
                // Setting this default_activity_ui here is needed, otherwise the business rule will generate 
                // a new record of sys_playbook_experience_activity_ui with blank activity ui as ui template.
		newFields.push({'default_activity_ui': pb.BLANK_ACTIVITY_UI_SYS_ID});
		// if we previously had no default UI use default
		previousActivityUIId = src.getValue('default_activity_ui') || pb.DEFAULT_ACTIVITY_UI_SYS_ID;
	}
	
	var copy = pb.copyRecord(src, newFields);
	var copyId = copy.getUniqueValue();
	
	pb.copyRelatedRecords(activityTypePropertyTable, 'model', srcId, copyId, [{'model': copyId}, {'model_id': copyId}]);
	
	pb.copyVariableRecords(srcId, copyId);
	
	if (!previousActivityUIId)
		return copy;

	// generate a new default activity UI linking back to this record, if a default activity UI exists
	copiedActivityUI = pb.copyDefaultActivityUIOfActivityType(previousActivityUIId, copyId);

	// after we create the new record attach the activity UI back to this 
	var updateCopiedUI = new GlideRecord(src.getTableName());
	updateCopiedUI.get(copyId);
	updateCopiedUI.setValue('default_activity_ui', copiedActivityUI.getUniqueValue());
	updateCopiedUI.update();
	
	return updateCopiedUI;
}
