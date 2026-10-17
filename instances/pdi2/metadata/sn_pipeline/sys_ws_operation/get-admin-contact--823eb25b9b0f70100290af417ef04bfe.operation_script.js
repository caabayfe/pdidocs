(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var adminEmailUtil = new PipelineAdminEmailUtil();
    var adminEmail = adminEmailUtil.getAdminEmail();

    response.setBody({
        adminEmail: adminEmail,
    });
    response.setStatus(200);

})(request, response);
