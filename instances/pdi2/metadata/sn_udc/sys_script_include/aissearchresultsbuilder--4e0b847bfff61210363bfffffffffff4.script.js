class AISSearchResultsBuilder {
	static type = 'AISSearchResultsBuilder';
	static SEARCH_FILTER_TABLE = 'sys_search_filter';
	static SEARCH_SOURCES_TABLE = 'ais_search_source';
	static scopedCacheKeyMapping = {
		cacheName: 'Ais Search Sources',
		cacheEntryKeyName: 'ais_search_sources',
	};
	static ALL = 'All';

	constructor({ searchAppConfigId, searchTerm, searchFilterId }) {
		this.searchAppConfigId = searchAppConfigId;
		this.searchTerm = searchTerm;
		this.searchFilterId = searchFilterId || '';
	}

	/**
	 * Get scoped cache name and key
	 * @returns {Object} cache details
	 */
	getCacheDetails() {
		return AISSearchResultsBuilder.scopedCacheKeyMapping;
	}

	/**
	 * Get search sources details based on search context config id
	 * @returns {Object} of search sources
	 */
	getSearchSourcesDetails() {
		const sources = {};
		const gr = new GlideRecord(AISSearchResultsBuilder.SEARCH_FILTER_TABLE);
		gr.addQuery('active', true);
		gr.addQuery('search_context_config', this.searchAppConfigId);
		gr.orderBy('order');
		gr.query();
		while (gr.next()) {
			const sourceGr = gr.ais_search_source.getRefRecord();
			if (!UDCUtil.isValidGlideRecord(sourceGr)) continue;
			const sourceKey = sourceGr.getValue('datasource');
			if (!sources[sourceKey]) sources[sourceKey] = [];

			sources[sourceKey].push({
				name: gr.getValue('label'),
				sysId: gr.getUniqueValue(),
			});
		}
		return sources;
	}

	/**
	 * Get search sources and suggestions based on search term
	 * @param {Object} searchSources
	 * @returns {Object} search results and suggestions
	 */
	getSearchSourcesAndSuggestions(searchSources) {
		const sources = this.#getSearchSourceLabels(searchSources);
		const suggestions = this.#getSearchSuggestions(searchSources);

		return {
			sources,
			suggestions,
		};
	}

	/**
	 * Extracts and returns labels for the search sources
	 * @param {Object} searchSources
	 * @returns {Array} array of source labels
	 */
	#getSearchSourceLabels(searchSources) {
		return Object.values(searchSources)
			.flat()
			.map(({ name }) => name);
	}

	/**
	 * Extracts sysid from source object
	 * @param {Object} searchSources
	 * @returns {String} source sysid
	 */
	getSearchFilterSysId(searchSources, sourceName) {
		let sourceSysId = '';
		Object.values(searchSources)
			.flat()
			.map(({ name, sysId }) => {
				if (name === sourceName) sourceSysId = sysId;
			});
		return sourceSysId;
	}

	/**
	 * Retrieves requested fields for each search source
	 * @param {Object} searchSources
	 * @returns {Object} mapping of search sources to requested fields
	 */
	#getRequestedFields(searchSources) {
		const requestedFields = {};

		for (const searchSource in searchSources) {
			requestedFields[searchSource] = SearchResultBuilder.tableFieldsMapping[searchSource]
				? SearchResultBuilder.tableFieldsMapping[searchSource].fields
				: SearchResultBuilder.tableFieldsMapping.default.fields;
		}

		return requestedFields;
	}

	/**
	 * Retrieves search suggestions for the provided search sources and term
	 * @param {Object} searchSources
	 * @returns {Object} mapping of search sources to search suggestions
	 */
	#getSearchSuggestions(searchSources) {
		let key;
		const suggestions = {};
		const requestedFields = this.#getRequestedFields(searchSources);
		const searchFilters = [];
		if (this.searchFilterId)
			searchFilters.push(this.getSearchFilterSysId(searchSources, this.searchFilterId));

		if (searchFilters.length === 0) key = AISSearchResultsBuilder.ALL;
		else key = this.searchFilterId; //Assign searchFilter as key if searchFilter is provided

		suggestions[key] = [];

		const api = new sn_search.ScriptableSearchAPI();
		const response = api.search(
			this.searchAppConfigId,
			this.searchTerm,
			'', // paginationToken
			false, // disableSpellCheck
			[], // facetFilters
			searchFilters, // searchFilters
			requestedFields
		);

		const searchResults = response.getSearchResults();
		searchResults.forEach(searchResult => {
			const table = searchResult.getTable();
			const columns = searchResult.getColumns();
			const columnMap = Object.fromEntries(
				columns.map(column => [column.getFieldName(), column])
			);

			const sysId = searchResult.getSysId();
			const classVal = searchResult.getRecordClassName();
			const icon =
				(columnMap.logo || columnMap.icon)?.getDisplayValue() ||
				SearchResultBuilder.getIconByType(table, sysId, classVal);

			const scope = columnMap.sys_scope?.getValue() || columnMap.scope?.getValue();
			const scopeDisplayValue = columnMap.sys_scope?.getDisplayValue();
			const classDisplayValue =
				classVal === 'sys_db_object'
					? gs.getMessage('Table')
					: columnMap.sys_class_name?.getDisplayValue();
			const homePath = columnMap.home_path
				? UDCUtil.createCanonicalizedUri(columnMap.home_path.getValue())
				: null;
			const documentationUrl = columnMap.documentation_url?.getValue() || null;

			suggestions[key] = suggestions[key] || [];
			suggestions[key].push({
				sysId,
				label: searchResult.getTitle() || this.#getRecordDisplayValue(table, sysId),
				class: classVal,
				type: key,
				icon,
				scope,
				scopeDisplayValue,
				classDisplayValue,
				homePath,
				documentationUrl,
			});
		});

		return suggestions;
	}

	/**
	 * Get display value of a record
	 * @param {String} table
	 * @param {String} sysId
	 * @returns {String} display value
	 */
	#getRecordDisplayValue(table, sysId) {
		var tableGr = global.UDCGlobal.getGlideRecordForTable(table);
		tableGr.get(sysId);
		return tableGr.getDisplayValue();
	}
}
