function transform(input) {
    function getContentBlocksLegacy(appConfigGr) {
        var appConfig = appConfigGr.getValue('app_config');
        return new ACEAppBuilderUtilV2().getContentBlocks(input.page_route, input.page_params, appConfig, false, false, false);
    }

    /**
     * Fetch content blocks from bundle only if ace version is v2 and the sys_property to disable
     * bundle fetch is false.
     */
    function shouldFetchContentBlocksFromBundle(pageGr) {
        return gs.getProperty('ace.disable_page_bundle_fetch.' + input.page_route, false + "") == "false" &&
            pageGr.ace_app.version == 'v2';
    }

    function isApplicationACEV1(appConfigGr, pageGr) {
		var appVersion = appConfigGr.getValue('version');
        var pageVersion = pageGr.getValue('version');
        
        if (pageVersion && pageVersion.toLowerCase() === 'v2')
            return false;
        if (appVersion && appVersion.toLowerCase() === 'v2')
            return false;

        return true;
    }

    if (!input || !input.application_id || !input.page_route) return [];
    var contentBlocks = [];
    var appConfigGr = new GlideRecord('sn_ace_app_config');
    if (!appConfigGr.get(input.application_id))
        return [];

    var pageGr = new GlideRecord('sn_ace_page');
    if (!pageGr.get(input.page_route))
        return [];

    //interceptor for legacy v1 application
    if (isApplicationACEV1(appConfigGr, pageGr)) {
        var blocks = new ACEAppBuilderUtil().getContentBlocks(input.page_route, input.page_params);
        blocks.forEach(function(cb) {
            cb.isRoot = true;
        });
        return blocks;
    }

    var aceAppBuilderUtil = new ACEAppBuilderUtilV2();
    var aceGlobalUtil = new global.ACEAppBuilderGlobalScopedUtil();

    try {
        var cbPageParams = {
            'pageParams': input.page_params,
			'blockcontext':input.block_context
        };

        if (shouldFetchContentBlocksFromBundle(pageGr)) {
            contentBlocks = aceGlobalUtil.getDecompressedPageBundle(pageGr.getValue('bundle'));
            aceAppBuilderUtil.processReusableBlocks(contentBlocks, cbPageParams);
            aceAppBuilderUtil.mergeContentBlockContext(contentBlocks);
            if (contentBlocks && contentBlocks.length) {
                contentBlocks = aceAppBuilderUtil.eagerlyEvaluateDataBlocks(contentBlocks, cbPageParams);
                cbPageParams = aceAppBuilderUtil.addDataBlockParamsToScriptVariables(contentBlocks, cbPageParams);
                contentBlocks = aceAppBuilderUtil.processCachedContentBlocks(contentBlocks, cbPageParams);
            } else {
                contentBlocks = getContentBlocksLegacy(appConfigGr);
            }
        } else {
            contentBlocks = getContentBlocksLegacy(appConfigGr);
        }
    } catch (e) {
        gs.error("ACE Fetch Content Blocks: Error in parsing page composition: " + e.toString());
        contentBlocks = getContentBlocksLegacy(appConfigGr);
    }

    contentBlocks.forEach(function(cb) {
        cb.isRoot = true;
    });
    return contentBlocks;
}
