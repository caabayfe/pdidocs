(function executeRule(current, previous /*null when async*/) {
	var collectionSysId = current.getValue('collection');

	if (gs.nil(collectionSysId)) return;

	// Check if collection is the default Bookmarks collection
	if (Collection.isDefaultCollection(collectionSysId)) return;

	// Defense-in-depth: Platform-level ownership check on M2M insert.
	// Script include pre-validates via getUserCollectionsMap(). This BR adds an additional guard.
	// Trade-off: +1 DB query per M2M insert. Acceptable for security-critical operations.
	var collectionGr = new GlideRecordSecure('sn_udc_collection');
	if (collectionGr.get(collectionSysId)) {
		var collectionOwner = collectionGr.getValue('creator');
		var currentUser = gs.getUserID();

		if (collectionOwner === currentUser) return;
	}

	// Collection doesn't exist or user doesn't own it - abort
	current.setAbortAction(true);
	gs.addErrorMessage('You cannot add items to a collection you do not own.');
})(current, previous);
