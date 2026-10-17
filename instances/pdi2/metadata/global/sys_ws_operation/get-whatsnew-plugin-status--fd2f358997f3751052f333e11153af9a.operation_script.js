(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        if (gs.getUser().getAllRoles().contains('snc_external')) {
            result = {
                status: 200,
                data: {
                    active: false
                }
            };
        } else {
            snhelpUtil = new SNHelpUtil();
            result = snhelpUtil.getWhatsNewPluginStatus();
        }
        response.setStatus(result.status);
        response.setBody(result.data);
    } catch (e) {
        response.setStatus(500);
        gs.error("SNHelpUtil: " + e.message);
        response.setBody({
            error: "Internal server error"
        });
    }

})(request, response);
