var unknownMasterSysID = "8fbc3c053bc07300b924874064efc4ae";
ensureValidDuplicateOfValue();

function ensureValidDuplicateOfValue() {
	
	if (current == unknownMasterSysID) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Duplicate of cannot be set for this CI."));
		return;
	}

	if (current.duplicate_of == current.sys_id) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("The main CI that you entered sets {0} to be a duplicate of itself and therefore cannot be set.", current.getDisplayValue()));
		return;
	}
	
	var masterGr = new GlideRecord("cmdb_ci");
	if (!masterGr.get(current.duplicate_of)) {
		// invalid reference
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("The main CI that you entered is invalid and therefore cannot be set. For example, an invalid sys_ID or a non-existent CI."));
		return;
	}
	
	if (current.sys_domain != masterGr.sys_domain) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("The main CI {0} that you entered is from another domain and therefore cannot be set.", masterGr.getDisplayValue()));
		return;
	}

	var masterOfMaster = masterGr.getValue('duplicate_of');

	if (!gs.nil(masterOfMaster))
		handleMasterIsAlsoDuplicate(masterGr);
	
}

function handleMasterIsAlsoDuplicate(masterGr) {

	var masterOfMaster = masterGr.getValue('duplicate_of');

	if (masterOfMaster == current.sys_id) {
		// Trying to swap the master
		// CI  DuplicateOf     CI  DuplicateOf
		// A               --> A   B
		// B   A               B
		return;
	}

	// Check if the master CI is itself a duplicate that was migrated with a master
	// reference to the Unknown CI
	if (masterGr.duplicate_of == unknownMasterSysID) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("The main CI {0} that you entered is a duplicate CI and its main CI is unknown. Therefore it cannot be set.", masterGr.getDisplayValue()));
		return;
	}

	
	// set CI as duplicate of master of the provided main CI
	current.duplicate_of = masterOfMaster;
	
	var msgArray = [];
	msgArray.push(masterGr.getDisplayValue());
	msgArray.push(masterGr.duplicate_of.getDisplayValue());
	gs.addInfoMessage(gs.getMessage("The main CI {0} that you entered is a duplicate CI by itself, therefore its main CI {1} is set as the main CI for this CI.", msgArray));
}
