(function executeRule(current, previous /*null when async*/) {
	// Runs before the platform cascade fires on sn_udc_collection_item_m2m.collection,
	// so m2m rows still exist here and the survivor query is accurate.
	// GlideRecord (not GlideRecordSecure) is intentional — system-level cleanup in an
	// elevated context. ACL enforcement would leave orphans the owner can't clean up.
	var LOG = new Logger('sn_udc.CleanupStrandedItems');
	var CHUNK_SIZE = 500;
	const deletingCollectionSysId = current.getUniqueValue();

	try {
		// Phase 1: collect all collection_item sys_ids linked to this collection
		var m2mGr = new GlideRecord(CollectionItem.M2M_TABLE);
		m2mGr.addQuery(CollectionItem.M2MColumn.Collection, deletingCollectionSysId);
		m2mGr.query();

		var itemSysIds = [];
		while (m2mGr.next())
			itemSysIds.push(m2mGr.getValue(CollectionItem.M2MColumn.CollectionItem));

		if (itemSysIds.length === 0) return;

		// Phase 2: batch IN queries (CHUNK_SIZE at a time) to avoid SQL IN-clause limits
		// on large collections, then build a survivor map of items still in other collections.
		var survivorMap = {};
		for (var i = 0; i < itemSysIds.length; i += CHUNK_SIZE) {
			var chunk = itemSysIds.slice(i, i + CHUNK_SIZE);
			var otherM2mGr = new GlideRecord(CollectionItem.M2M_TABLE);
			otherM2mGr.addQuery(CollectionItem.M2MColumn.CollectionItem, 'IN', chunk.join(','));
			otherM2mGr.addQuery(CollectionItem.M2MColumn.Collection, '!=', deletingCollectionSysId);
			otherM2mGr.query();
			while (otherM2mGr.next())
				survivorMap[otherM2mGr.getValue(CollectionItem.M2MColumn.CollectionItem)] = true;
		}

		// Phase 3: delete orphans — items with no remaining collection memberships
		var orphanIds = itemSysIds.filter(id => {
			return !survivorMap[id];
		});

		if (orphanIds.length === 0) return;

		for (var j = 0; j < orphanIds.length; j += CHUNK_SIZE) {
			var orphanChunk = orphanIds.slice(j, j + CHUNK_SIZE);
			var orphanGr = new GlideRecord(CollectionItem.TABLE);
			orphanGr.addQuery(CollectionItem.Column.SysId, 'IN', orphanChunk.join(','));
			orphanGr.deleteMultiple();
		}
	} catch (e) {
		// Never abort the user's collection delete due to cleanup failure.
		// Orphaned items will remain but are invisible (m2m-only GET) and can be swept later.
		LOG.error(`Orphan cleanup failed for collection ${deletingCollectionSysId}: ${e}`);
	}
})(current, previous);
