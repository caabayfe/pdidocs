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
	if (current.getValue('synch_direction') === 'asset_to_ci') {
		if (_doesAssetExistAsStartPoint(current.asset_state, current.asset_substate)) {
			current.setAbortAction(true);
		}
	} else if (current.getValue('synch_direction') === 'ci_to_asset') {
		if (_doesCiExistAsStartPoint(current.hardware_ci_status, current.hardware_ci_substatus)) {
			current.setAbortAction(true);
		}
	} else if (current.getValue('synch_direction') === 'both') {
		if (_doesAssetExistAsStartPoint(current.asset_state, current.asset_substate) ||
			_doesCiExistAsStartPoint(current.hardware_ci_status, current.hardware_ci_substatus)) {
			current.setAbortAction(true);
		}
	} else {
		gs.addErrorMessage(gs.getMessage('Unsupported Synch direction value'));
		current.setAbortAction(true);
	}

	function _doesAssetExistAsStartPoint(state, substate) {
		var doesExist = _doesStartPointExistInField('asset_state', state, 'asset_substate', substate, 'asset_to_ci,both');
		if (doesExist) {
			gs.addErrorMessage(gs.getMessage("Either this mapping already exists or another mapping exists with a conflicting value for Asset state and substate."));
		}
		return doesExist;
	}

	function _doesCiExistAsStartPoint(status, substatus) {
		var doesExist = _doesStartPointExistInField('hardware_ci_status', status, 'hardware_ci_substatus', substatus, 'ci_to_asset,both');
		if (doesExist) {
			gs.addErrorMessage(gs.getMessage("Either this mapping already exists or another mapping exists with a conflicting value for Configuration Item status and substatus."));
		}
		return doesExist;
	}

	function _doesStartPointExistInField(stateField, state, substateField, substate, directions) {
		var gr = new GlideRecord(current.getTableName());
		gr.addQuery('sys_id', '!=', current.getUniqueValue());
		gr.addQuery('synch_direction', 'IN', directions);
		gr.addQuery(stateField, state);
		gr.addQuery(substateField, substate);
		gr.query();
		return gr.hasNext();
	}

})(current, previous);
