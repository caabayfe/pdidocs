(function executeRule(current, previous /*null when async*/ ) {

    // This table lists properties for UX Pages (e.g. workspaces)
    var propertiesGR = new GlideRecord('sys_ux_page_property');
    // One of these properties, globalSearchDataConfigId, specifies which SAC should be used by that page/workspace
    propertiesGR.addQuery('name', 'globalSearchDataConfigId');
    // To find workspaces using a particular SAC, look for globalSearchDataConfigId properties with a VALUE of that SAC's sys_id
    propertiesGR.addQuery('value', current.getUniqueValue());
    propertiesGR.query();

    g_scratchpad.isUsedByWorkspace = propertiesGR.hasNext();

    //add max search results property value to scratchpad
    g_scratchpad.max_search_results = parseInt(gs.getProperty('glide.search.max_search_results'));

})(current, previous);
