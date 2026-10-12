(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var res = new sn_wn.WhatsNewAPIHandler().handleTotalContentCountRequest(request.body.data);
        response.setStatus(res.status);
        response.setBody(res);
    } catch (e) {
        var exp = new sn_ws_err.BadRequestError(e + "");
        response.setError(exp);
    }
})(request, response);
