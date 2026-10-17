(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var linkId = request.pathParams.linkId;
    if (!linkId)
        return new sn_ws_err.BadRequestError("Permalink id not provided");
    var docPermalinkAPI = new sn_doc_services.DocumentPermalinkAPI();
    var resp = docPermalinkAPI.getPermalinkInputStream(linkId);
    if (resp.success == true) {
        response.setContentType(resp.content_type);
        var encodedFileName = encodeURIComponent(resp.file_name);
        response.setHeader('Content-Disposition', 'attachment; filename="' + resp.file_name + '"; filename*=UTF-8\'\'' + encodedFileName);
        var writer = response.getStreamWriter();
        writer.writeStream(resp.stream);
        response.setStatus(200);
    } else {
        response.setStatus(404);
        return new sn_ws_err.NotFoundError(resp.error_message);
    }
})(request, response);
