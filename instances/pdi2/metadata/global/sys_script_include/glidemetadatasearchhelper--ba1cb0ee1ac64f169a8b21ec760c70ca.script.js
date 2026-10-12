class GlideMetadataSearchHelper {
	/**
	 * Execute a passage-based search using GlideMetadataSearch.
	 * @param {string} query - Search terms
	 * @param {string[]|null} tables - Table filter (null = all)
	 * @param {string|null} scopeId - Scope sys_id filter (null = all)
	 * @param {number} limit - Max results
	 * @param {Object} config - { fragmentSize: number, maxFragments: number }
	 * @returns {{ results: Object[], total: number }}
	 */
	search(query, tables, scopeId, limit, config) {
		var search = new SNC.GlideMetadataSearch(query);
		if (tables) {
			for (var i = 0; i < tables.length; i++) {
				search.addTable(tables[i]);
			}
		}
		if (scopeId) search.setScopeFilter(scopeId);
		search.setLimit(limit);
		var fs = parseInt(config.fragmentSize);
		search.setFragmentSize(isNaN(fs) ? 200 : fs);
		var mf = parseInt(config.maxFragments);
		search.setMaxFragments(isNaN(mf) ? 2 : mf);
		search.query();

		var results = [];
		while (search.next()) {
			results.push({
				table: search.getTable(),
				sys_id: search.getSysId(),
				name: search.getName(),
				scope_sys_id: search.getScopeSysId(),
				scope_name: search.getScopeName(),
				scope_display_name: search.getScopeDisplayName(),
				score: search.getScore(),
				content: search.getContent()
			});
		}
		return { results: results, total: search.getTotal() };
	}

	/**
	 * Check if a table extends sys_metadata (is an Application File).
	 * Uses TableUtils which is only available in global scope.
	 * @param {string} tableName
	 * @returns {boolean}
	 */
	isMetadataTable(tableName) {
		try {
			var tu = new TableUtils(tableName);
			var parents = tu.getTables();
			for (var i = 0; i < parents.size(); i++) {
				if (String(parents.get(i)) === 'sys_metadata') return true;
			}
			return false;
		} catch (e) {
			return false;
		}
	}

	/**
	 * Returns sys_metadata descendants that have their own Zing text index.
	 * These tables are NOT included in the sys_metadata Zing index, so they
	 * must be queried directly to avoid missing results (DEF0815867).
	 * Result is cached for the lifetime of this instance.
	 * @returns {string[]}
	 */
	getTablesWithOwnIndex() {
		if (this._separateIndexTables) return this._separateIndexTables;

		this._separateIndexTables = [];
		var seen = {};
		var gr = new GlideRecord('ts_index_name');
		gr.addQuery('table', '!=', 'sys_metadata');
		gr.query();
		while (gr.next()) {
			var tbl = gr.getValue('table');
			if (!seen[tbl] && this.isMetadataTable(tbl)) {
				this._separateIndexTables.push(tbl);
				seen[tbl] = true;
			}
		}
		return this._separateIndexTables;
	}

	/**
	 * Check if GlideMetadataSearch is available on this instance.
	 * @returns {boolean}
	 */
	isAvailable() {
		try {
			return typeof SNC !== 'undefined' && typeof SNC.GlideMetadataSearch === 'function';
		} catch (e) {
			return false;
		}
	}
}
