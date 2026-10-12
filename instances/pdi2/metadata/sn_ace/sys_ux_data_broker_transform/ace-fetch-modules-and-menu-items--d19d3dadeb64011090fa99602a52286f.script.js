function transform(input) {
    var CONSTANTS = new sn_ace.ACEAppBuilderMetaData();

    function appendPageParams(contentTree) {
        var children = contentTree;
        while (children && children.length > 0) {
            var nextChildren = [];
            children.forEach(function(childItem) {
                if (childItem.type.id == CONSTANTS.CONTENT_BLOCK_TYPES.NAV) {
                    // Along with page parameters, replace title and 
                    // add icon to honour the existing contract.
                    childItem.pageParams = input.current_route;
                    childItem.label = childItem.title;
                    childItem.icon = childItem.props_details.icon;
                }
                nextChildren = nextChildren.concat(childItem.children);
                if (childItem.menu && childItem.menu.length > 0) {
                    nextChildren = nextChildren.concat(childItem.menu);
                }
            });
            children = nextChildren;
        }
    }

    function getSideNavAndModuleItemCount(aceConfigAppId) {
        var gr = new GlideRecord('sn_ace_content_block');
        gr.addEncodedQuery('ace_config=' + aceConfigAppId + '^type=' + CONSTANTS.SIDE_NAV_TYPE + '^ORtype=' + CONSTANTS.MODULE_ITEM_TYPE);
        gr.query();
        return gr.getRowCount();
    }


    var onLoadData = {
        ace_app_data: {},
        modules: []
    };
    if (!input || !input.application_id)
        return onLoadData;

    var aceAppConfig = new GlideRecord('sn_ace_app_config');
    if (!aceAppConfig.get(input.application_id))
        return onLoadData;

    var aceAppBuilderV2 = new ACEAppBuilderUtilV2();
    var aceAppBuilder = new ACEAppBuilderUtil();

    if (aceAppBuilderV2.shouldFetchContentBlocksFromAppBundle(aceAppConfig)) {

        var aceGlobalUtil = new global.ACEAppBuilderGlobalScopedUtil();
        var cachedModuleItemAndSideNavCount = aceGlobalUtil.getFromCache('',input.application_id + '_side_nav_module_item') || 0;
        var actualSideNavAndModuleItemCount = getSideNavAndModuleItemCount(input.application_id);
        if (cachedModuleItemAndSideNavCount != actualSideNavAndModuleItemCount) {
             aceAppBuilder.updateAppConfigBundle(input.application_id);
             aceGlobalUtil.putInCache('',input.application_id + '_side_nav_module_item', actualSideNavAndModuleItemCount);
        }
       var bundle = aceAppConfig.getValue('bundle');
        onLoadData = aceGlobalUtil.getDecompressedPageBundle(bundle);
        var contentTree = onLoadData.modules;
        var cbScriptVariables = {
            pageParams: input.current_route || {},
            blockcontext: input.block_context || {},
            dataParams: input.data_params || {}
        };
        // To Execute visibility script / Post script on the entire content tree
        var contentBlocks = aceAppBuilderV2.processCachedContentBlocks(contentTree, cbScriptVariables);
        // Append page params to Nav items, to maintain the existing contract intact.
        appendPageParams(contentBlocks);
        onLoadData.modules = contentBlocks;
        return onLoadData;
    }

    // If bundle is not available, then fallback to default way of fetching the modules and menu items.
    onLoadData = aceAppBuilder.getAceAppData(input.application_id, input.current_route);
    return onLoadData;
}
