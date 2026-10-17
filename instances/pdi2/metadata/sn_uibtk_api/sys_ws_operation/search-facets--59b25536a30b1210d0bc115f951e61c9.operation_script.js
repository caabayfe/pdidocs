(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const searchTable = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.TABLE, 'sys_uib_toolbox_component');

        const searchFacetsM2M = new SearchFacetItemMappings();
        const searchFacets = new SearchFacets();
        const searchFacetsResults = searchFacetsM2M.getSearchFacetByTable(searchTable, true);
        const searchFacetIds = Array.isArray(searchFacetsResults) && searchFacetsResults.length === 0 ? [] : searchFacetsResults.map((sfr) => {
            return sfr.sysId;
        });

		if(!searchFacetIds.includes(BuilderToolkitConstants.SEARCH_FACET_CATEGORY_ID)){
			searchFacetIds.push(BuilderToolkitConstants.SEARCH_FACET_CATEGORY_ID);
		}

        const results = searchFacets.getSearchFacetsByIds(searchFacetIds.join(','));

        apiHelper.respondSuccesfully({
                searchFacets: results,
            },
            (results) === [] ? 204 : 200
        );
    });

})(request, response);
