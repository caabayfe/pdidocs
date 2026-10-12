(function executeRule(current, previous /*null when async*/) {
	var instance_db = SNC.CollationUtil.getDBType();
	if (instance_db.toLowerCase() != current.db) {
		gs.addErrorMessage(sn_i18n.Message.getMessage("global", "Record with incorrect db is being processed. Please try again with db = {0} record", {0: instance_db}));
		current.setAbortAction(true);
		return;
	}

	var user_collation_name = current.collation_name;
	if (!SNC.CollationUtil.isCollationInDB(user_collation_name)) {
		gs.addErrorMessage(sn_i18n.Message.getMessage("global", "Collation {0} is not supported in the db. Please try again with another collation.", {0: user_collation_name}));
		current.setAbortAction(true);
		return;
	}
	
})(current, previous);
