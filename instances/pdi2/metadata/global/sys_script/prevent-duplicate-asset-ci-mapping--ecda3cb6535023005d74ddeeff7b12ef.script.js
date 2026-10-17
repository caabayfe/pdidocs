(function executeRule(current, previous /*null when async*/) {

	/*
	The basic idea is to check if there is a record already existing with the same start point:
	if we are adding a record with direction A1 -> C1
	    then we need to check if there is already A1 -> Cx or A1 <-> Cx
	if we are adding a record with direction C1 -> A1
	    then we need to check if there is already C1 -> Ax or C1 <-> Ax
	if we are adding a record with direction both A1 <-> C1
	    then we need to check if there is already A1 -> Cx or A1 <-> Cx or C1 -> Ax or C1 <-> Ax
	 */
	var abort = false;
	var message;
	var rec;
	if (current.getValue("synch_direction") === "asset_to_ci") {
		rec = new GlideRecord(current.getTableName());
		rec.addQuery("asset_state", current.asset_state);
		rec.addQuery("asset_substate", current.asset_substate);
		rec.addQuery('synch_direction', "IN", "both,asset_to_ci");
		rec.addQuery('sys_id', "!=", current.sys_id);
		rec.query();
		abort = rec.hasNext();
		message = gs.getMessage("Either this mapping already exists or another mapping exists with a conflicting value for Asset state and substate.");
	} else if (current.getValue("synch_direction") === "ci_to_asset") {
		rec = new GlideRecord(current.getTableName());
		rec.addQuery("configuration_item_status", current.configuration_item_status);
		rec.addQuery('synch_direction', "IN", "both,ci_to_asset");
		rec.addQuery('sys_id', "!=", current.sys_id);
		rec.query();
		abort = rec.hasNext();
		message = gs.getMessage("Either this mapping already exists or another mapping exists with a conflicting value for Configuration Item status.");
	} else  {
		rec = new GlideRecord(current.getTableName());
		rec.addQuery("asset_state", current.asset_state);
		rec.addQuery("asset_substate", current.asset_substate);
		rec.addQuery('synch_direction', "IN", "both,asset_to_ci");
		rec.addQuery('sys_id', "!=", current.sys_id);
		rec.query();
		abort = rec.hasNext();
		message = gs.getMessage("Either this mapping already exists or another mapping exists with a conflicting value for Asset state and substate.");
		
		if (!abort) {
			rec = new GlideRecord(current.getTableName());
			rec.addQuery("configuration_item_status", current.configuration_item_status);
			rec.addQuery('synch_direction', "IN", "both,ci_to_asset");
			rec.addQuery('sys_id', "!=", current.sys_id);
			rec.query();
			abort = rec.hasNext();
			message = gs.getMessage("Either this mapping already exists or another mapping exists with a conflicting value for Configuration Item status.");
		}
	}
	if (abort) {
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}

})(current, previous);
