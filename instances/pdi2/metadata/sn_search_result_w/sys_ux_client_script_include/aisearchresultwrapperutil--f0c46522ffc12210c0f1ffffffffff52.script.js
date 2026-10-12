function include() {
  return {
    /** Ensures filter prop values are passed as strings to the state and returns true if the state was updated */
    formatFilterProps: function (api) {
      if (
        !api.data.check_if_global_search_is_aisearch ||
        !api.data.check_if_global_search_is_aisearch.properties.booleanValue
      ) {
        // If the global search is not aisearch, we don't need to format the filter props
        return false;
      }

      var additionalContext = JSON.parse(JSON.stringify(api.state.additionalContext));
      additionalContext.routeConfigId = api.context.props.routeConfigId;
      additionalContext.workspaceSiteName = api.context.props.searchContext;
      if (JSON.stringify(additionalContext) != api.state.additionalContext) {
        stateUpdated = true;
        api.setState("additionalContext", additionalContext);
      }

      var facetProp = api.context.props.facetFilters;
      if (facetProp && typeof facetProp != "string")
        facetProp = JSON.stringify(facetProp);

      var filterProp = api.context.props.searchFilters;
      if (filterProp && typeof filterProp != "string")
        filterProp = JSON.stringify(filterProp);

      var stateUpdated = false;
      if (facetProp != api.state.facetProp) {
        stateUpdated = true;
        api.setState("searchFacet", facetProp);
      }

      if (filterProp != api.state.searchFilter) {
        stateUpdated = true;
        api.setState("searchFilter", filterProp);
      }

      return stateUpdated;
    },
  };
}
