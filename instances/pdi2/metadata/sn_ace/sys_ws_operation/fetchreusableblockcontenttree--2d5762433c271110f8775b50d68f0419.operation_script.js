(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var blockId = request.body.data.blockId;
	var aceUtil = new sn_ace.ACEAppBuilderUtilV2();

    var result = {};
    if (blockId) {
        try {
            result = aceUtil._getContentBlockMetaData(null, blockId , null, null, null, true);
        } catch (e) {
			gs.error('Unable to fetch reusable block content tree: ' + e);
		}
    }

	response.setBody(result);

})(request, response);
