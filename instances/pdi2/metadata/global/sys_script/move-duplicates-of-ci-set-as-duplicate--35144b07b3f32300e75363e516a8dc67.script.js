(function executeRule(current, previous /*null when async*/ ) {

	// Skip if being marked as duplicate of the Unknown Main CI
	var unknownMasterSysID = "8fbc3c053bc07300b924874064efc4ae";
	if (current.duplicate_of == unknownMasterSysID) {
		return;
	}

	// If there are duplicates of current CI being set as
	// duplicate of another CI (masterCI) update them to be
	// duplicates of masterCI
	// In the case masterCI was itself a duplicate of the CI
	// (switching the master of the set) clear its duplicate_of value
	
	var myDuplicates = new GlideRecord('cmdb_ci');
	
	if (!myDuplicates.canWrite()) {
		return;
	}
	// Avoid invoking this same BR for the duplicate CIs,
	// restrict the change to one level
	myDuplicates.setWorkflow(false);
	
	// Handle duplicate Cis except for new Master
	myDuplicates.addQuery('duplicate_of', current.sys_id);
	myDuplicates.addQuery('sys_id', '!=', current.duplicate_of);
	myDuplicates.query();
	
	if (myDuplicates.getRowCount() > 0) {
		
		var msgArray = [];
		msgArray.push(current.getDisplayValue());
		msgArray.push(current.duplicate_of.getDisplayValue());
		gs.addInfoMessage(gs.getMessage("{0} is now a duplicate CI and {1} is set as its main CI. Therefore, all CIs that were set with {0} as their main CI are now set with {1} as their main CI.", msgArray));
			
			myDuplicates.setValue('duplicate_of', current.duplicate_of);
			myDuplicates.updateMultiple();
		}
		
		// Trying to swap the master
		// CI  DuplicateOf     CI  DuplicateOf
		// A               --> A   B
		// B   A               B   [clear the value]
		myDuplicates = new GlideRecord('cmdb_ci');
		
		myDuplicates.addQuery('duplicate_of', current.sys_id);
		myDuplicates.addQuery('sys_id', current.duplicate_of);
		myDuplicates.query();
		
		// Not disabling Business Rule since Business Rule
		// will take care of clearing duplicate value in
		// discovery source for this CI
		if (myDuplicates.next()) {
			myDuplicates.setValue('duplicate_of', '');
			myDuplicates.update();
		}
		
	})(current, previous);
