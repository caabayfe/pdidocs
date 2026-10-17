(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var payload = request.body.data;
    var result = {};

    // If there's no payload and no query parameter we can return an error.
    if (global.JSUtil.isEmpty(payload))
        return new sn_ws_err.BadRequestError("No Query String provided");

    if (payload.blockId || payload.pageId) {
        var aceUtil = new sn_ace.ACEAppBuilderUtilV2();
        if (payload.runtime) {
            if (payload.pageId) {
                result = aceUtil.getContentBlocksByPageId(payload.pageId, payload.params, false);
            } else {
                result = aceUtil.getContentBlocksByBlockId(payload.blockId, payload.params, payload.instanceBlockId, false);
            }
        } else {
            var hideModal = payload.blockId ? false : true;
            if (payload.pageId) {
                var pageGR = new GlideRecord('sn_ace_page');
                if (pageGR.get(payload.pageId)) {
                    var bundle = pageGR.getValue('bundle');
                    if (bundle && bundle.length) {
                        var contentBlocks = new global.ACEAppBuilderGlobalScopedUtil().getDecompressedPageBundle(bundle);
                        aceUtil.processReusableBlocks(contentBlocks, {}, hideModal);
                        result.contentBlocks = contentBlocks;

                        var screenType = pageGR.route.screen_type.toString();
                        var screenGr = new GlideRecord("sys_ux_screen");
                        screenGr.addQuery("screen_type", screenType);
                        screenGr.query();
                        if (screenGr.next()) {
                            pageMacroponentId = screenGr.macroponent.toString();
                            result.pageMacroponentId = pageMacroponentId;
                        }
                        result.blockParameters = [];
                    } else {
                        result = aceUtil._getContentBlockMetaData(payload.pageId, payload.blockId, null, null, null, hideModal);
                    }

                    result.clientContext = getClientContext(pageGR);
                } else {
                    result = aceUtil._getContentBlockMetaData(payload.pageId, payload.blockId, null, null, null, hideModal);
                }
            } else {
                result = aceUtil._getContentBlockMetaData(payload.pageId, payload.blockId, null, null, null, hideModal);
            }

            var inputParam = {};
            inputParam.pageId = payload.pageId;
            inputParam.blockId = payload.blockId;
            inputParam.aceConfig = payload.aceConfig;
            result.component_content_type_properties = aceUtil.getCachedMetadataProperties(inputParam);
        }
        response.setBody(result);
    } else {
        response.setBody([]);
    }

    function getClientContext(pageGR) {
        try {
            var clientContext = pageGR.getValue('client_context');
            if (typeof clientContext == 'string') {
                clientContext = JSON.parse(clientContext);
            }
            return clientContext;
        } catch (e) {
            gs.error("ACEDesignTimeError: Failed to parse client context: " + e.toString());
        }
    }

})(request, response);
