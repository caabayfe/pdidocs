(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

	var payload = request.body.data;

    // If there's no payload and no query parameter we can return an error.
    if (global.JSUtil.isEmpty(payload))
        return new sn_ws_err.BadRequestError("No Query String provided");

	var aceUtil = new ACEAppBuilderUtilV2();
	var documentId = payload.pageid || payload.blockid;
	var documentTable = payload.pageid? "sn_ace_page": "sn_ace_content_block";
	var resultantTree = aceUtil._updateACEContentBlocks(payload.aceContentTree, documentTable, documentId, payload.canGenerateUniqueTranslationRecord);
	if (payload.pageid && resultantTree && resultantTree.contentBlocks) {
		var pageGR = new GlideRecord('sn_ace_page');
		if (pageGR.get(payload.pageid)) {
			pageGR.setValue('bundle', new global.ACEAppBuilderGlobalScopedUtil().getCompressedPageBundle(resultantTree.contentBlocks));
			pageGR.update();
		}
	}
	else if (payload.blockid) {
		var blockGR = new GlideRecord('sn_ace_content_block');
		if (blockGR.get(payload.blockid)) {
			blockGR.setValue('bundle', new global.ACEAppBuilderGlobalScopedUtil().getCompressedPageBundle(resultantTree.contentBlocks));
			blockGR.update();
		}
	}

	response.setBody({aceContentTree: resultantTree.contentBlocks});

})(request, response);
