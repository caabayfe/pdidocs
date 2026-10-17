class ZingSearchResultsBuilder {
	static type = 'ZingSearchResultsBuilder';
	static SEARCH_SOURCES_TABLE = 'm2m_search_context_config_search_source';
	static SEARCH_SUGGESTIONS_LIMIT = 12;
	static scopedCacheKeyMapping = {
		cacheName: 'Zing Search Sources',
		cacheEntryKeyName: 'zing_search_sources',
	};
	static ALL = 'All';

	constructor({ searchAppConfigId, searchTerm, limit, endWith }) {
		this.searchAppConfigId = searchAppConfigId;
		this.searchTerm = searchTerm;
		this.limit = limit;
		this.endWith = endWith;
	}

	/**
	 * Get scoped cache name and key
	 * @returns {Object} cache details
	 */
	getCacheDetails() {
		return ZingSearchResultsBuilder.scopedCacheKeyMapping;
	}

	/**
	 * Get zing search source details based on search context config id
	 * @returns {Array} array of search sources
	 */
	getSearchSourcesDetails() {
		const sources = {};
		const gr = new GlideRecord(ZingSearchResultsBuilder.SEARCH_SOURCES_TABLE);
		gr.addQuery('search_context_config', this.searchAppConfigId);
		gr.orderBy('order');
		gr.query();

		while (gr.next()) {
			const sourceGr = gr.source.getRefRecord();
			if (!UDCUtil.isValidGlideRecord(sourceGr)) continue;

			const sourceTable = sourceGr.getValue('source_table');
			sources[sourceTable] = {
				name: sourceGr.getDisplayValue('name'),
				condition: sourceGr.getValue('condition'),
			};
		}

		return sources;
	}

	/**
	 * Get search results for a given table based on search term
	 * @param {Object} searchSources
	 * @returns {Array} array of search results
	 */
	getSearchSourcesAndSuggestions(searchSources) {
		const sources = [];
		const suggestions = {};
		for (const searchSource in searchSources) {
			const { name, condition } = searchSources[searchSource];
			suggestions[name] = this.getSearchSuggestions(searchSource, condition, name);
			sources.push(name);
		}

		const allItems = this.prepareSearchSuggestionsOfAllTab(suggestions, sources);
		suggestions[ZingSearchResultsBuilder.ALL] = allItems;

		return {
			sources,
			suggestions,
		};
	}

	/**
    * Prepares zing search suggestions for All Tab
    * For All - Sets 12 suggestions with 3 from each source - Files, Apps, Tables, Tools
    * If suggestions doesn't add upto 12, then its maximizes by pushing remaining from each type in order of files,apps,tools 
    * For Files, Tools, Apps - Pushes items from response
    	* Eg: API RESPONSE: {
            files: [10],
            apps: [3],
            tools: [1]
        } - > returns {
            all: [6 Files, 3 Apps, 1 Tool],
            files: [10],
            apps: [3],
            tools: [1]
        }
    * @param {object} - Suggestions from all search sources
	* @param {Array} - list of search sources 
	* @returns {Array} - The array of results with a maximum of 12 items.
    */
	prepareSearchSuggestionsOfAllTab(suggestions, sources) {
		const items = [];
		for (const source of sources) {
			let sourceItems = suggestions[source] || [];
			sourceItems = sourceItems.map(item => ({
				...item,
				showTypeBanner: true,
			}));
			items.push(...sourceItems.slice(0, 3));
		}

		const totalCount = items.length;
		if (totalCount >= ZingSearchResultsBuilder.SEARCH_SUGGESTIONS_LIMIT)
			return items.slice(0, ZingSearchResultsBuilder.SEARCH_SUGGESTIONS_LIMIT);

		let remainingCount = ZingSearchResultsBuilder.SEARCH_SUGGESTIONS_LIMIT - totalCount;
		const finalItems = [];

		for (const source of sources) {
			let sourceItems = suggestions[source] || [];
			sourceItems = sourceItems.map(item => ({
				...item,
				showTypeBanner: true,
			}));

			const alreadyAddedItems = sourceItems.slice(0, 3) || [];

			if (remainingCount <= 0) {
				finalItems.push(...alreadyAddedItems);
				continue;
			}

			const alreadyAddedCount = alreadyAddedItems.length;
			const itemsToAdd =
				sourceItems.slice(alreadyAddedCount, alreadyAddedCount + remainingCount) || [];

			finalItems.push(...alreadyAddedItems, ...itemsToAdd);
			remainingCount -= itemsToAdd.length;
		}

		return finalItems;
	}

	/**
	 * Get search results for a given table based on search term
	 * @param {String} table
	 * @param {String} condition
	 * @param {String} search source label
	 * @returns {Array} array of search results
	 */
	getSearchSuggestions(table, condition, sourceLabel) {
		const results = [];
		const gr = new GlideRecord(table);
		const displayColumn = gr.getDisplayName();

		gr.addQuery('123TEXTQUERY321', this.searchTerm);
		gr.addNotNullQuery(displayColumn);
		!gs.nil(condition) && gr.addQuery(condition);
		gr.chooseWindow(this.offset, this.endWith);
		gr.query();

		const tableInfo =
			SearchResultBuilder.tableFieldsMapping[table] ||
			SearchResultBuilder.tableFieldsMapping.default;
		const includeScope =
			tableInfo.fields.includes('sys_scope') || tableInfo.fields.includes('scope');
		const includeClass = tableInfo.fields.includes('sys_class_name');
		const includeBuilderUrl = table === FileTaxonomyBuilder.TABLE;

		while (gr._next()) {
			if (!gr.canRead()) continue;

			const sysId = gr.getUniqueValue();
			const label = gr.getDisplayValue();
			const classVal = gr.getValue('sys_class_name');
			const icon = gr.getDisplayValue('logo') || gr.getDisplayValue('icon');
			const iconVal = icon || SearchResultBuilder.getIconByType(table, sysId, classVal);

			const result = {
				sysId,
				label,
				icon: iconVal,
				class: classVal,
				type: sourceLabel,
			};

			if (includeScope) {
				result.scope = gr.getValue('sys_scope') || gr.getValue('scope');
				result.scopeDisplayValue = gr.getDisplayValue('sys_scope') || null;
			}

			if (includeClass)
				result.classDisplayValue = gr.getDisplayValue('sys_class_name') || null;

			if (includeBuilderUrl) {
				result.homePath = UDCUtil.createCanonicalizedUri(gr.getValue('home_path'));
				result.documentationUrl = gr.getValue('documentation_url') || '';
			}

			results.push(result);
		}

		return results;
	}
}
