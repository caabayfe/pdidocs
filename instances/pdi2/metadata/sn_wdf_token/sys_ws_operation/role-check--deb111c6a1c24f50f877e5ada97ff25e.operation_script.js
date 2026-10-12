(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    response.setStatus(200);
    response.setBody({
        hasRole: gs.hasRole("sn_wdf_token.wdf_admin")
    });

})(request, response);
