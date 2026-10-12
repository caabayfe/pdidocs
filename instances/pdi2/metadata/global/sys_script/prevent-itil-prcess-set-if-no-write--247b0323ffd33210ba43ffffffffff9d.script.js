(function executeRule(current, previous /*null when async*/) {

	const ITIL_CHANGE_PROCESS = "itil_change_process";
	const TABLE_NAME = "table_name";
	const SYS_ID = "sys_id";

	// Cater for overloads
	const defaultModels = ChangeModelChgReqAPI.DEFAULT_ITIL_MODELS || ChangeModelChgReqAPISNC.DEFAULT_ITIL_MODELS;

	const defaultModel = defaultModels[current.getValue(ITIL_CHANGE_PROCESS)];

	// We need to check if the user has write access to all of the models, hence GlideRecord
	const modelGr = new GlideRecord(current.getTableName());
	modelGr.addActiveQuery();
	modelGr.addQuery(SYS_ID,"!=", current.getUniqueValue());
	modelGr.addQuery(TABLE_NAME, current.getValue(TABLE_NAME));

	// Check for anything with the same process set or the default model for this process
	const itilCPProcessQuery = modelGr.addQuery(ITIL_CHANGE_PROCESS, current.getValue(ITIL_CHANGE_PROCESS));
	if (current.getUniqueValue() != defaultModel) {
		itilCPProcessQuery.addOrCondition("sys_id", defaultModel);
	}

	// This makes sure that any models with the field set are checked first, default model last
	modelGr.orderByDesc(ITIL_CHANGE_PROCESS);

	modelGr.query();

	// At this point we only ever need to check the first record.  If two records are returned the first will be the
	// record with the field set and the second will be the default record (due to above ordering).
	// If only one record is returned it'll be the default as there was no flagged model for this itil process.
	if (modelGr.next()) {
		if (!modelGr.canWrite()) {
			current.setAbortAction(true);

			gs.addInfoMessage(gs.getMessage("You cannot set the ITIL process field as you do not have write access to the existing model defined as the {0} ITIL Change Process", current.getDisplayValue(ITIL_CHANGE_PROCESS)));
		}
	}

})(current, previous);
