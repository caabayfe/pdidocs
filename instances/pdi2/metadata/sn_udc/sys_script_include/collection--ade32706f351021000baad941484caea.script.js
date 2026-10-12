class Collection {
	static type = 'Collection';
	static TABLE = 'sn_udc_collection';
	static FAVORITES = 'favorites';
	static DEFAULT_BOOKMARKS_COLLECTION_ID = 'a231477dff240f50c76affffffffff8d';
	static Column = {
		Creator: 'creator',
		Name: 'name',
	};

	static MAX_NAME_LENGTH = 255;

	static sanitizeCollectionName(name) {
		return Collection.#sanitizeCollectionName(name);
	}

	static insertCollection(collectionName) {
		const sanitizedCollectionName = Collection.sanitizeCollectionName(collectionName);

		if (!sanitizedCollectionName) throw 'Collection name cannot be empty.';

		if (Collection.doesCurrentUserHaveCollection(sanitizedCollectionName))
			throw `A collection with the name "${sanitizedCollectionName}" already exists.`;

		var gr = new GlideRecordSecure(Collection.TABLE);
		gr.initialize();
		gr.setValue(Collection.Column.Name, sanitizedCollectionName);
		gr.setValue(Collection.Column.Creator, gs.getUserID());
		var sysId = gr.insert();

		if (!sysId) throw 'Failed to create collection.';

		return {
			sysId,
			name: gr.getValue(Collection.Column.Name),
		};
	}

	static isValidCollection(collectionId) {
		return UDCUtil.isValidRecord(Collection.TABLE, collectionId);
	}

	static isFavoriteCollection(collectionId) {
		return collectionId === Collection.FAVORITES;
	}

	static isDefaultCollection(collectionId) {
		return collectionId === Collection.DEFAULT_BOOKMARKS_COLLECTION_ID;
	}

	static isCollectionExists(collectionEntry) {
		const { name, creator } = collectionEntry;
		const sanitizedCollectionName = Collection.sanitizeCollectionName(name);

		var gr = new GlideRecordSecure(Collection.TABLE);
		gr.addQuery(Collection.Column.Name, sanitizedCollectionName);
		gr.addQuery(Collection.Column.Creator, creator);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	}

	static doesCurrentUserHaveCollection(name, excludeSysId = '') {
		const sanitizedCollectionName = Collection.sanitizeCollectionName(name);

		var gr = new GlideRecordSecure(Collection.TABLE);
		gr.addQuery(Collection.Column.Name, sanitizedCollectionName);
		gr.addQuery(Collection.Column.Creator, gs.getUserID());
		if (excludeSysId) gr.addQuery('sys_id', '!=', excludeSysId);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	}

	static updateCollection(sysId, name) {
		if (gs.nil(sysId)) throw 'Collection not found';

		const sanitizedCollectionName = Collection.sanitizeCollectionName(name);

		if (!sanitizedCollectionName) throw 'Collection name cannot be empty.';

		var gr = new GlideRecordSecure(Collection.TABLE);

		if (!gr.get(sysId)) throw 'Collection not found';

		if (Collection.doesCurrentUserHaveCollection(sanitizedCollectionName, sysId))
			throw `A collection with the name "${sanitizedCollectionName}" already exists.`;

		gr.setValue(Collection.Column.Name, sanitizedCollectionName);

		if (!gr.update()) throw 'Failed to update collection.';

		return {
			sysId,
			name: gr.getValue(Collection.Column.Name),
		};
	}

	static deleteCollection(sysId) {
		if (gs.nil(sysId)) throw 'Collection not found';

		var gr = new GlideRecordSecure(Collection.TABLE);

		if (!gr.get(sysId)) throw 'Collection not found';

		if (!gr.deleteRecord()) throw 'Failed to delete collection.';

		return true;
	}

	static getUserCollectionsMap() {
		const collectionsMap = {};
		const currentUserId = gs.getUserID();

		const gr = new GlideRecordSecure(Collection.TABLE);
		gr.addQuery(Collection.Column.Creator, currentUserId);
		gr.query();

		while (gr.next()) collectionsMap[gr.getUniqueValue()] = true;

		return collectionsMap;
	}

	static isCollectionOwnedByCurrentUser(collectionId) {
		// Default collection is always accessible to all users
		if (Collection.isDefaultCollection(collectionId)) return true;

		const currentUserId = gs.getUserID();
		const gr = new GlideRecordSecure(Collection.TABLE);

		if (!gr.get(collectionId)) return false;

		return gr.getValue(Collection.Column.Creator) === currentUserId;
	}

	static #sanitizeCollectionName(name) {
		return String(name || '')
			.trim()
			.slice(0, Collection.MAX_NAME_LENGTH);
	}
}
