const SearchFacetItemMappings = Class.create();
SearchFacetItemMappings.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_uib_search_facet_item_m2m_element',
    FIELDS: ['element_table', 'search_facet_item', 'sys_id', 'target_id'],
    FIELD_TYPES: {
        element_table: 'string',
        search_facet_item: 'string',
        sys_id: 'string',
        target_id: 'string'
    },
    /**
     * @param fields {string[]}
     */
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPES);
    },

    getSearchFacetByTable: function(table, skipItems = false) {
        if (!table) {
            gs.error(BuilderToolkitConstants.ERRORS.NO_TABLE_GIVEN);
            return;
        }
        const query = `element_table=${table}`;

        const searchFacetM2MGR = this.getRecordsByQuery(query, 'search_facet_item.search_facet.order', true);
        return this.getSearchFacetInfo(searchFacetM2MGR, 'order,api_name,sys_id,label'.split(','), skipItems);
    },

    getSearchFacetsByTargetId: function(targetId) {
        const searchFacetM2MGR = this.getRecordsByQuery(`target_id=${targetId}`, 'search_facet_item.search_facet.order', true);
        return this.getSearchFacetInfo(searchFacetM2MGR, 'api_name,sys_id'.split(','));
    },

    getSearchFacetInfo: function(searchFacetM2MGR, fields, skipItems = false) {
        const searchFacets = [];

        if (searchFacetM2MGR) {
            while (searchFacetM2MGR.next()) {
                const searchFacetItemGR = searchFacetM2MGR.search_facet_item.getRefRecord();
                const searchFacetGR = searchFacetItemGR.search_facet.getRefRecord();
                const searchFacetId = searchFacetGR.getUniqueValue();

                let searchFacetIndex = searchFacets.findIndex((searchFacet) => {
                    return searchFacet.sysId === searchFacetId;
                });

                if (searchFacetIndex === -1) {
                    searchFacets.push({
                        ...this.getFacetData(searchFacetGR, fields),
                        searchFacetItems: []
                    });
                    searchFacetIndex = searchFacets.length - 1;
                }
                if (!skipItems) {
                    searchFacets[searchFacetIndex].searchFacetItems.push(this.getFacetData(searchFacetItemGR, fields));
                }
            }
        }
        return searchFacets;
    },

    getFacetData: function(facetGR, fields) {
        const that = this;
        return fields.reduce((acc, field) => {
            const fieldName = that._toCamelCase(field);
            const value = facetGR[field].toString();
            acc[fieldName] = field === 'order' ? parseInt(value) : value;
            return acc;
        }, {});
    },

    /**
     * Creates a set of M2M search facet relationships
     *
     * @param {string} targetId
	 * @param {string} tableName
     * @param {string} searchFacets - comma separated list of search facet item sys_ids
     */
    createSearchFacetM2Ms(targetId, tableName, searchFacets) {
        const searchFacetIds =
            typeof searchFacets === 'string' ? searchFacets.split(',') : searchFacets;
        for (const searchFacetId of searchFacetIds) {
            const searchFacetFields = {
                elementTable: tableName,
                targetId,
                searchFacetItem: searchFacetId,
            };

            this.createRecord(searchFacetFields);
        }
    },

	/**
	 * Deletes all sys_uib_search_facet_item_m2m_element records
	 *
	 * @param {string} sysId the sys_id of the target record
	 * @param {string | null} searchFacetIds
	 */
	deleteSearchFacetM2MRecords(sysId, searchFacetIds = null) {
		const records = this.getRecordsByQuery(`target_id=${sysId}^search_facet_item.sys_idIN${searchFacetIds}`);
		this.deleteRecords(records);
	},

	/**
	 * Updates the associated search facets for a target item
	 *
	 * @param {string} targetId
	 * @param {string} tableName
	 * @param {{id: string, label: string}[]} searchFacets
	 */
	updateSearchFacetM2Ms(targetId, tableName, searchFacets = []) {
		const searchFacetIds = searchFacets.map((searchFacet) => searchFacet.id);
		const existingSearchFacetM2Ms = this.getRecordsByQuery(`target_id=${targetId}`);
		const existingSearchFacetIds = existingSearchFacetM2Ms.map(
			(existingSearchFacetM2Ms) => existingSearchFacetM2Ms.searchFacetItem
		);

		const searchFacetsToAdd = searchFacetIds.filter(
			(id) => !existingSearchFacetIds.includes(id)
		);
		const searchFacetsToRemove = existingSearchFacetIds.filter(
			(id) => !searchFacetIds.includes(id)
		);

		if (searchFacetsToAdd.length > 0) {
			this.createSearchFacetM2Ms(targetId, tableName, searchFacetsToAdd);
		}

		if (searchFacetsToRemove.length > 0) {
			this.deleteSearchFacetM2MRecords(
				targetId,
				searchFacetsToRemove.join(',')
			);
		}
	},

    type: 'SearchFacetItemMappings'
});
