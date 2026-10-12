function transform(input) {
    if (!input || !input.application_id || !input.search_config_block_id) return [];
    var searchContexts = new ACEAppBuilderUtil().getSearchContexts(input.application_id, input.search_config_block_id);

    return searchContexts;
}
