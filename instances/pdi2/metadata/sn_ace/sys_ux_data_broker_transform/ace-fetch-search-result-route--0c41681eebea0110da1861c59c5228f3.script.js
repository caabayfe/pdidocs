function transform(input) {
    if (!input || !input.application_id || !input.search_result_block_id) return '';
    var route = new ACEAppBuilderUtil().fetchRouteSearchResult(input.application_id, input.search_result_block_id);
    return route;
}
