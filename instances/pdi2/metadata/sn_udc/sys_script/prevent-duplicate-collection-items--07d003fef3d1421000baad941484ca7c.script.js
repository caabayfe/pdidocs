(function executeRule(current, previous /*null when async*/) {
	// New m2m inserts set collection=null; dedup is handled inside insertCollectionItemForCollection
	// via #findCollectionItemForUser + #doesM2mRecordExist. Checking here would incorrectly block
	// a user from adding the same file to a second collection. Guard the legacy path only.
	if (gs.nil(current.collection)) return;

	const collectionItem = {
		file: current.file,
		fileTable: current.file_table,
		url: current.url,
		label: current.label,
	};

	var excludeSysId = null;
	if (current.operation() === 'update') excludeSysId = current.getUniqueValue();

	if (CollectionItem.doesCurrentUserHaveCollectionItem(collectionItem, excludeSysId)) {
		gs.addErrorMessage(gs.getMessage('Collection item already exists.'));
		current.setAbortAction(true);
	}
})(current, previous);
