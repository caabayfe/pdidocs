var SearchFacets = Class.create();
SearchFacets.prototype = Object.extendsObject(BuilderToolkitAPIBase, {
    TABLE: 'sys_uib_search_facet',
    FIELDS: ['api_name', 'label', 'sys_id', 'order'],
    FIELD_TYPE: {
        api_name: 'string',
        label: 'translated_field',
        sys_id: 'string',
        order: 'integer'
    },
    initialize: function(fields, noDomain, includeDisplayValue) {
        BuilderToolkitAPIBase.prototype.initialize.call(this, this.TABLE, fields || this.FIELDS, noDomain, includeDisplayValue, this.FIELD_TYPE);
    },
    getSearchFacets: function() {
        const searchFacetInfo = this.getRecordsByQuery('', 'order', false);

        if (!searchFacetInfo) return {};

        return searchFacetInfo;

    },
    getSearchFacetsByIds: function(searchFacetIds) {
        const searchFacetItems = new SearchFacetItems();
        const searchFacetQuery = `sys_idIN${searchFacetIds}`;
        const searchFacets = this.getRecordsByQuery(searchFacetQuery, 'order', false).map((searchFacet) => {
            return {
                ...searchFacet,
                searchFacetItems: searchFacetItems.getRecordsByQuery(`search_facet=${searchFacet.sysId}`, 'order', false)
            };
        });
		return searchFacets;
    },
    type: 'SearchFacets'
});
