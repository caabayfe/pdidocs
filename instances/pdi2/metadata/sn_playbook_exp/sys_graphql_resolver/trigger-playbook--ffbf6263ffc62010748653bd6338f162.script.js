(function process(env) {
	var args = env.getArguments();
	
	var parentGlideRecord = new GlideRecordSecure(args.parentTable);
	var contextId = null;
	
	if (!parentGlideRecord.isValid())
		return {
			errorType: "PARENT_TABLE_NOT_VALID",
			message: gs.getMessage("'{0}' is not a valid table.", args.parentTable),
			parent_table: args.parentTable,
			parent_record: args.parentRecord
		};
	
	if(!parentGlideRecord.canCreate() && !parentGlideRecord.canWrite()) 
		return {
			errorType: "INSUFFICIENT_PERMISSIONS",
			message: gs.getMessage("You do not have permission to trigger a Playbook on this parent record."),
			parent_table: args.parentTable,
			parent_record: args.parentRecord
		};
	
	if(!parentGlideRecord.get(args.parentRecord))
		return {
			errorType: "PARENT_RECORD_NOT_FOUND",
			message: gs.getMessage("'{0}' not found in {1} table.", [args.parentRecord, args.parentTable]),
			parent_table: args.parentTable,
			parent_record: args.parentRecord
		};
	
	try {
		var shouldTriggerPlaybook = true;
		
		if (args.onlyIfNoProcessRunning)
			shouldTriggerPlaybook = !sn_playbook.PlaybookExperience.parentRecordContainsPlaybook(parentGlideRecord);
		
		if (shouldTriggerPlaybook)
			contextId = sn_playbook.PlaybookExperience.triggerPlaybook(args.scopedName, parentGlideRecord);
	} catch(e){
		return {
			errorType: "TRIGGER_PLAYBOOK_FAILED",
			message: e.getMessage(),
			parent_table: args.parentTable,
			parent_record: args.parentRecord
		};
	}
	
	return {
		sys_id: contextId,
		parent_table: args.parentTable,
		parent_record: args.parentRecord
	};
	
})(env);
