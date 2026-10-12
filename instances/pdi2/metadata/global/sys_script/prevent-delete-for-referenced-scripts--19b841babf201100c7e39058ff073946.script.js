// if the script is used by an active process, abort deletion.

preventDeletion();

function preventDeletion() {
	// Check for password-reset extension-script category pattern:
	if (current.script.indexOf("category: 'password_reset.extension") > 0) {
		if (checkReferences('pwd_verification_type', ['verification_processor', 'enrollment_processor', 'is_enrolled']))
			return;

		if (checkReferences('pwd_cred_store', ['auto_gen_password_script', 'account_lookup']))
			return;

		if (checkReferences('pwd_identification_type', ['identification_processor']))
			return;

		if (checkReferences('pwd_process', ['post_processor']))
			return;
	}
}

function checkReferences(table, fields) {
	// check that 'fields' is a valid array:
	if (!(fields instanceof Array) || fields.length <= 0)
		return false;

	// Check if the current script is referenced from one of the <fields> in the <table>:
	var gr = new GlideRecord(table);
	var gc = gr.addQuery(fields[0], current.sys_id);
	for (i = 1; i < fields.length; i++) {
		gc.addOrCondition(fields[i],  current.sys_id);
	}
	gr.query();
	
	if (!gr.hasNext()) {
		return false;
	}
	
	while (gr.next()) {
		gs.addErrorMessage(gs.getMessage("The script cannot be deleted because it is referenced by '{0}', in table {1}", [gr.getDisplayValue(), table]));
	}
	current.setAbortAction(true);
	return true;
}
