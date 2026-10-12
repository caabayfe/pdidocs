class SearchResultBuilder {
	static type = 'SearchResultBuilder';
	static SYS_METADATA_TABLE = 'sys_metadata';
	static SYS_SCOPE_TABLE = 'sys_scope';
	static SYS_DB_OBJECT = 'sys_db_object';
	static AIS_DATASOURCE = 'ais_datasource';
	static SYS_NAME = 'sys_name';
	static AIS_CHILD_TABLE = 'ais_child_table';
	static tableFieldsMapping = {
		sys_scope: {
			fields: ['sys_class_name', 'scope', 'logo'],
		},
		sys_db_object: {
			fields: ['sys_scope'],
		},
		sn_udc_file_taxonomy_builder: {
			fields: ['icon', 'home_path', 'documentation_url'],
		},
		sys_metadata: {
			fields: ['sys_class_name', 'sys_scope'],
		},
		default: {
			fields: ['sys_class_name', 'sys_scope'],
		},
	};
	static typeMap = FileTaxonomy.getTaxonomyTypeMap();

	static aisIndexedTables = {
		MetaData: [
			'sys_report',
			'catalog_ui_policy',
			'sys_ui_action',
			'sysevent_email_action',
			'sys_hub_flow',
			'sys_script',
			'sys_security_acl',
			'sys_script_client',
			'sys_user_role',
			'sys_properties',
			'sys_script_include',
			'catalog_script_client',
			'sys_dictionary',
			'sys_ui_policy',
			'sys_db_object',
		],
		Application: ['sys_store_app', 'sys_app'],
	};

	/**
	 * @praram {Object} options
	 */
	constructor(options) {
		this.options = options || {};
		this.search_term = this.options?.search_term || '';
		this.zing_search_app_config_sysid =
			this.options?.zing_search_app_config_id || 'b55e71ef772b3110398eb3c64b5a9935'; // Default zing search app config sys_id until Sns team configures it
		this.ai_search_app_config_sysid = this.options?.ai_search_app_config_id;
		this.limit = this.options?.limit || 12;
		this.offset = this.options?.offset || 0;
		this.endWith = this.offset + this.limit;
		this.is_ais_enabled = this.#isAISEnabled();
		this.search_app_config_sysid = this.is_ais_enabled
			? this.ai_search_app_config_sysid
			: this.zing_search_app_config_sysid;
		this.searchFilterId = this.options?.search_filter_id || '';

		// Instantiate the appropriate search results builder
		this.search_results_builder = this.is_ais_enabled
			? new AISSearchResultsBuilder({
					searchAppConfigId: this.search_app_config_sysid,
					searchTerm: this.search_term,
					searchFilterId: this.searchFilterId,
			  })
			: new ZingSearchResultsBuilder({
					searchAppConfigId: this.search_app_config_sysid,
					searchTerm: this.search_term,
					limit: this.limit,
					endWith: this.endWith,
			  });
	}

	/**
	 * Return search sources and suggestions
	 * @returns {Object} object of search sources and suggestions
	 */
	build() {
		try {
			this.#validateQueryParams();
			const searchSources = this.#getSearchSourcesDetails();
			const { sources = [], suggestions = {} } =
				this.#getSearchSourcesAndSuggestions(searchSources);

			return {
				sources,
				suggestions,
				isAisEnabled: this.is_ais_enabled,
			};
		} catch (e) {
			let message;
			let code;

			switch (e) {
				case UDCConstants.errors.INVALID_SEARCH_CONFIG_ID:
					message = gs.getMessage('Search config id is invalid.');
					code = 404;
					break;

				default:
					message = gs.getMessage('Unhandled exception: {0}', [e]);
					code = 500;
					break;
			}

			return {
				name: 'search results',
				error: {
					message,
					code,
				},
			};
		}
	}

	/**
	 * Validate query params
	 */
	#validateQueryParams() {
		if (gs.nil(this.search_app_config_sysid))
			throw UDCConstants.errors.INVALID_SEARCH_CONFIG_ID;
	}

	/**
	 * Get search sources details based on search context config id
	 * @returns {Object} object of search sources details
	 */
	#getSearchSourcesDetails() {
		const { cacheName, cacheEntryKeyName } = this.search_results_builder.getCacheDetails();
		const result = UDCCache.get(cacheName, cacheEntryKeyName);

		if (result && result[this.search_app_config_sysid])
			return result[this.search_app_config_sysid];

		let sources = {};
		sources = this.search_results_builder.getSearchSourcesDetails();

		// Update the cache
		const updatedCache = result || {};
		updatedCache[this.search_app_config_sysid] = sources;
		UDCCache.put(cacheName, cacheEntryKeyName, updatedCache);

		return sources;
	}

	/**
	 * Get search sources and suggestions
	 * @param {Object} searchSources
	 * @returns {Obect} object of search sources and suggestions
	 */
	#getSearchSourcesAndSuggestions(searchSources) {
		return this.search_results_builder.getSearchSourcesAndSuggestions(searchSources);
	}

	/**
	 * Get search source sysid
	 * @param {String} sourceName
	 * @returns {String} sysId of search source, works for AIS
	 */
	getSearchFilterSysId(sourceName) {
		if (!this.is_ais_enabled) return '';

		const searchSources = this.#getSearchSourcesDetails();
		return this.search_results_builder.getSearchFilterSysId(searchSources, sourceName);
	}

	/**
	 * Fetch icon based on table and sysId
	 * @param {String} table
	 * @param {String} sysId
	 * @param {String} classVal
	 * @returns {String} icon
	 */
	static getIconByType(table, sysId, classVal) {
		let icon;
		switch (table) {
			case SearchResultBuilder.SYS_DB_OBJECT:
				icon = UDCConstants.fallbackIcons.TABLE;
				break;
			case FileTaxonomyBuilder.TABLE:
				icon = UDCConstants.fallbackIcons.TOOL;
				break;
			case SearchResultBuilder.SYS_SCOPE_TABLE:
				icon = UDCConstants.fallbackIcons.OTHER_APP;
				break;
			default:
				icon =
					FileTaxonomy.getIconByType(
						sysId,
						classVal,
						SearchResultBuilder.typeMap[classVal]
					) || UDCConstants.fallbackIcons.FILE;
		}
		return icon;
	}

	/**
	 * Determines whether AIS search is enabled and properly configured.
	 *
	 * Checks the system property `glide.ais.enabled` and ensures that the
	 * application config and all required AIS tables are available.
	 *
	 * @private
	 * @returns {boolean} True if AIS search is enabled and all validations pass; otherwise false.
	 */
	#isAISEnabled() {
		const propEnabled = gs.getProperty('glide.ais.enabled', 'false') === 'true';
		if (!this.ai_search_app_config_sysid || !propEnabled) return false;

		return this.#validateAllAISIndexedTables();
	}

	/**
	 * Checks whether all specified tables are indexed for a given AIS datasource.
	 *
	 * Queries the AIS datasource by sys_name, retrieves its active child tables,
	 * and verifies that all required tables are present.
	 *
	 * @private
	 * @param {string} sysName - The AIS datasource sys_name to validate.
	 * @param {string[]} tables - List of required table names to check.
	 * @returns {boolean} True if all tables exist in the AIS datasource; otherwise false.
	 */
	#hasAisIndex(sysName, tables) {
		const childTables = new Set();

		const gr = new GlideRecord(SearchResultBuilder.AIS_DATASOURCE);
		gr.addQuery(SearchResultBuilder.SYS_NAME, sysName);
		gr.query();
		if (!gr.next()) return false;

		const ch = new GlideRecord(SearchResultBuilder.AIS_CHILD_TABLE);
		ch.addQuery('datasource', gr.sys_id);
		ch.addQuery('active', true);
		ch.query();
		while (ch.next()) childTables.add(ch.getValue('table'));

		for (let i = 0; i < tables.length; i++) {
			if (!childTables.has(tables[i])) return false;
		}
		return true;
	}

	/**
	 * Validates that all AIS datasources defined in `aisIndexedTables`
	 * have their required child tables indexed.
	 *
	 * Iterates over each sys_name in `SearchResultBuilder.aisIndexedTables`
	 * and calls `#hasAisIndex` to ensure all expected tables exist.
	 *
	 * @private
	 * @returns {boolean} True if all datasources have required tables indexed; otherwise false.
	 */
	#validateAllAISIndexedTables() {
		let areAisTablesIndexed = true;
		for (var sysName in SearchResultBuilder.aisIndexedTables) {
			if (!this.#hasAisIndex(sysName, SearchResultBuilder.aisIndexedTables[sysName])) {
				areAisTablesIndexed = false;
				return areAisTablesIndexed;
			}
		}
		return areAisTablesIndexed;
	}
}
