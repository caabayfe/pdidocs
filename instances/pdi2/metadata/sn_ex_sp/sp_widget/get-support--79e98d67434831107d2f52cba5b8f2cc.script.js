(function() {
    data.loading = true;
    data.renderedFromMenuItem = input && input.renderedFromMenuItem ? true : false;
    data.load_config = data.renderedFromMenuItem === true ? "sync" : (options && options.load_config ? options.load_config : "");
    data.show_title = data.renderedFromMenuItem === true ? false : true;
    data.getSupportHeader = options && options.title ? gs.getMessage(options.title) : gs.getMessage("Get support");
    if (data.load_config === "async" && !input)
        return;
    data.getSupportItems = [];
    var empty_state = options && (options.show_empty_state === "true" || options.show_empty_state === true);
    data.portal = $sp.getPortalRecord();
    var getSupportUtil = new sn_ex_sp.GetSupportUtil(data.portal.getUniqueValue());
    data.getSupportItems = getSupportUtil.fetchSupportRecords();
    data.showEmptyState = showEmptyState();
    data.loading = false;

    if (input && input.action == 'openGuidedhelp' && input.guidedHelpId) {
        data.pageId = $sp.getParameter('id') ? $sp.getParameter('id') : data.portal.homepage.getDisplayValue();
        data.guidedHelpResponse = new sn_ex_sp.QuickLinkUtil().handleGuidedHelpClick(input.guidedHelpId, data.pageId, "quick_link_from_getsupport");
    }

    function showEmptyState() {
        if (data.getSupportItems.length === 0 && (data.renderedFromMenuItem || empty_state))
            return true;
        return false;
    }

})();
