(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var linkId = request.pathParams['linkId'];
    var docPermalinkAPI = new sn_doc_services.DocumentPermalinkAPI();
    var res = docPermalinkAPI.getPermalinkInfo(linkId);
    return res;
})(request, response);
