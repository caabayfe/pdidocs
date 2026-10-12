/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers,
    event
}) {
    /* 
    * If node is current, return the filtered list
    * If the node is not current:
    *   1. Lookup in the cache, if found return the results
    *   2. Otherwise, return the default dataset which was provided on page load
    */
    const mostRecentyInteractedNode = api?.data?.get_next_set_of_typeahead_list_items?.output?.currentElementId;
    const currentNodeUserIsUpon = api?.item?.value?.currentElementId;

    // If either of the nodes come out empty, return the default set, to avoid null failures
    if (mostRecentyInteractedNode == null || currentNodeUserIsUpon == null) {
      return api?.item?.value?.listData || [];
    }
    
    if (mostRecentyInteractedNode !== currentNodeUserIsUpon) {
      const recentSearchesCache = api?.state?.typeAheadRecentSearchesCache;
      if (recentSearchesCache.hasOwnProperty(currentNodeUserIsUpon)) {
        return recentSearchesCache[currentNodeUserIsUpon] || [];
      } else {
        return api?.item?.value?.listData || [];
      }
    } else {
      return api?.data?.get_next_set_of_typeahead_list_items?.output?.items || [];
    }
}
