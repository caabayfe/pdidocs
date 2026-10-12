(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var payload = request.body.data;
    var inputParam = {};
    inputParam.pageId = payload.pageId;
    inputParam.blockId = payload.blockId;
    inputParam.aceConfig = payload.aceConfig;
    var reloadCachedData = payload.clearCache ? true : false;

    var appBuilderUtil = new ACEAppBuilderUtilV2();
    response.setBody({
        'component_content_type_properties': appBuilderUtil.getCachedMetadataProperties(inputParam, reloadCachedData)
    });

})(request, response);
