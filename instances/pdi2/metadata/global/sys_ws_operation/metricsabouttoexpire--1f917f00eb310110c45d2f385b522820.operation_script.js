(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var bodyRequest = request.body.nextEntry();
    var sysIds = bodyRequest["expired_metrics_list"];
    var responseMsg;
    if (GlideStringUtil.notNil(sysIds)) {
        var err = MetricsExpirationAPI.updateMetricsExpirationDate(sysIds);
        if (!gs.nil(err)) {
            var wsErr = new sn_ws_err.ServiceError();
            wsErr.setStatus(500);
            wsErr.setMessage("Error Updating Metrics Expiration Date");
            wsErr.setDetail(err);
            return wsErr;
        }
        responseMsg = "Metrics Expiration Date Updated Successfully";
    } else
        responseMsg = "No Metrics to Update";
    response.setContentType("application/json");
    response.setStatus(200);
    response.getStreamWriter().writeString(JSON.stringify({
        message: responseMsg
    }));
})(request, response);
