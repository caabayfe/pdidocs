function onLoad() {
    var hybridSearchEnabled = g_scratchpad.enable_hybrid_search;
    if (hybridSearchEnabled === 'true') {
        g_form.addInfoMessage(getMessage("Source facet counts are not displayed when hybrid search is enabled, regardless of the 'Show counts for facets' configuration."));
    }
}
