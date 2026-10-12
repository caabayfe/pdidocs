function _ifSimilarRecordExist(prop) {
	var assetPropGr = new GlideRecord('asset_property');
	assetPropGr.addQuery('key', prop.key);
	assetPropGr.addQuery('sys_domain', prop.sys_domain);
	assetPropGr.setLimit(1);
	assetPropGr.query();

	return assetPropGr.hasNext();
}

function _processInsert(currentProp) {
	if (_ifSimilarRecordExist(currentProp)) {
		gs.addErrorMessage(gs.getMessage('There is already an asset property with the same key'));
		currentProp.setAbortAction(true);
	}
}

function _processUpdate(currentProp) {
	if (currentProp.key.changes() || currentProp.sys_domain.changes()) {
		if (_ifSimilarRecordExist(currentProp)) {
			gs.addErrorMessage(gs.getMessage('There is already an asset property with the same key'));
			currentProp.setAbortAction(true);
		}
	}
}

(function executeRule(current) {
	if (current.operation() === 'insert') {
		_processInsert(current);
	} else if (current.operation() === 'update') {
		_processUpdate(current);
	}
})(current);
