var AISearchConversationalCatalogHelpers = Class.create();
AISearchConversationalCatalogHelpers.prototype = {

	conversationalCatalogCache: 'is_catalog_conversational_cache',

	initialize: function () {

	},

	/**
	 * Checks if required plugins installed
	 */
	areRequiredPluginsInstalled: function () {
		var areRequiredPluginsInstalled = GlidePluginManager().isActive("sn_now_assist_cr") && GlidePluginManager().isActive("sn_ais_assist") && GlidePluginManager().isActive("sn_nowassist_va");

		return areRequiredPluginsInstalled;
	},

	/**
	 * Checks if input is type array as the batch api errors out if not
	 */
	_ensureValidInput: function (catalogIds) {
		if (Array.isArray(catalogIds) || typeof catalogIds === 'string') {
			return Array.isArray(catalogIds) ? catalogIds : [catalogIds];
		} else {
			gs.error("Invalid input type for catalog ids found");
			return [];
		}
	},
	/**
	 * Returns the conversational render type for the given catalog id
	 */
	getCatalogType: function (catalogIds) {
		var catalogResultTypeData = new sn_now_assist_cr.CatalogConversationLLMUtil().getConversationalRenderTypeForLLMBatch(catalogIds);
		if (!gs.nil(catalogResultTypeData)) {
			return catalogResultTypeData;
		} else {
			gs.error("Error in batch API call in AISearchConversationalCatalogHelpers.getCatalogType. Switching to try non-batched API now");
			var catalogTypeMap = {};
			for (var catalogId of catalogIds) {
				var catalogType = new sn_now_assist_cr.CatalogConversationLLMUtil().getConversationalRenderTypeForLLM(catalogId);
				catalogTypeMap[catalogId] = catalogType;
			}
			return catalogTypeMap;
		}
	},

	/**
	 * Returns true if catalog is conversational for one sys_id as input (legacy function)
	 */
	isConversationalCatalog: function (catalogId) {
		var catalogConversationalDataMap = this.isConversationalCatalogMap(catalogId);
		return catalogConversationalDataMap[catalogId];
	},

	/**
	 * Returns Map of entries if catalog is conversational for list of sys_ids
	 */
	isConversationalCatalogMap: function (catalogIds) {
		var catalogConversationalDataMap = {};
		if (!this.areRequiredPluginsInstalled() || gs.nil(catalogIds)) {
			return catalogConversationalDataMap;
		}
		var queryCatalogIds = this._ensureValidInput(catalogIds);
		var catalogConversationalTypeMap = this.getCatalogType(queryCatalogIds);
		if (!gs.nil(catalogConversationalTypeMap)) {
			for (var catalogId of queryCatalogIds) {
				let answer = false;
				if (catalogConversationalTypeMap[catalogId]) {
					answer = catalogConversationalTypeMap[catalogId] === sn_now_assist_cr.CatalogConversationConstants.RENDER_TYPES.CONVERSATION;
					catalogConversationalDataMap[catalogId] = answer;
					GlideCacheManager.put(this.conversationalCatalogCache, catalogId, answer);
				}

			}
		}
		return catalogConversationalDataMap;

	},

	/**
	 * Returns map of catalogSysIds and conversational true/false
	 */
	generateCatalogConversationalMap: function (catalogIds) {
		var catalogIdsNotCached = [];
		var catalogConversationalDataMap = {};
		// Processing the list of catalogIds recieved to check if a cache entry is already present
		for (var catalogId of catalogIds) {
			var cachedValue = GlideCacheManager.get(this.conversationalCatalogCache, catalogId);
			if (cachedValue != null && ('' + cachedValue).trim() != '') {
				catalogConversationalDataMap[catalogId] = cachedValue;
			} else {
				catalogIdsNotCached.push(catalogId);
			}
		}

		// Batch LLM api is currently limited to 10 only
		var sizeLimit = 10;
		var catalogIdsNotCachedMap = {};
		for (let i = 0; i < catalogIdsNotCached.length; i += Math.min(sizeLimit, catalogIdsNotCached.length - i)) {
			const currentCatalogIDBatch = catalogIdsNotCached.slice(i, i + sizeLimit);
			catalogIdsNotCachedMap = this.isConversationalCatalogMap(currentCatalogIDBatch);
			catalogConversationalDataMap = {
				...catalogConversationalDataMap,
				...catalogIdsNotCachedMap
			};
		}

		return catalogConversationalDataMap;
	},

	type: 'AISearchConversationalCatalogHelpers'
};
