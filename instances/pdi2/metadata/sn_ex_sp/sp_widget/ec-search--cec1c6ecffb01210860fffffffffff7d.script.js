(function() {
    var isECBEPortal = false;
    var searchFromChat = $sp.getParameter('searchFromChat') == 'true';
    var showTypeaheadSearch = 'false';
    if (GlidePluginManager.isActive(sn_ex_sp.EmployeeCenterConstants.PLUGINS.ECBE))
        isECBEPortal = new sn_ex_brw_ext.ECBEUtil().isECBEPortal($sp);
    try {
        showTypeaheadSearch = ((searchFromChat && $sp.isNowAssistEnabled()) || isECBEPortal) ? 'true' : 'false';
    } catch (error) {
        showTypeaheadSearch = 'false';
    }
    data.facetedSearchWidget = $sp.getWidget("faceted_search", {
        show_typeahead_search: showTypeaheadSearch
    });
})();
