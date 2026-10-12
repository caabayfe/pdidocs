(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var sysId = request.queryParams.legacyPageSysId;
    var layoutLoader = new SNC.LayoutLoader();
    var isLegacyPage = layoutLoader.isLegacyPage(sysId[0]);
    if (!isLegacyPage) {
        return {
            success: false,
            message: "sys id is not legacy page"
        };
    }
    return {
        success: true,
        message: "converted legacy page",
        layout: layoutLoader.convertToCanvas(sysId[0])
    };

})(request, response);
