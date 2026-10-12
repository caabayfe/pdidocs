(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // Everything about ingestion -- validation, this instance's log filters, the database health
    // gate, the batched insert and the response body -- lives in GlideOffGlideLogIngestion
    // (com.glide.sys.OffGlideLogIngestion), next to SysLog itself.
    //
    // What is left here is the REST layer, which is the part the platform expects to find in the
    // resource script: read the body, map the outcome onto a status, and build the error envelope.
    var result;
    try {
        result = JSON.parse(new GlideOffGlideLogIngestion().ingest(request.body.dataString));
    } catch (e) {
        // Reaching here means the Java call itself failed rather than the batch being rejected --
        // nothing was written and the sender should retry, so this is a 500 and not a 400. The
        // detail stays server-side: it is Java exception text, which is nothing an off-instance
        // sender should be shown, and gs.error puts it where an admin investigating the 500 can
        // still find it.
        gs.error('[Off-Glide Log Ingestion] ingest() failed unexpectedly: ' + (e.message ? e.message : e));
        var unexpected = new sn_ws_err.ServiceError();
        unexpected.setStatus(500);
        unexpected.setMessage('Log ingestion failed unexpectedly');
        return unexpected;
    }

    // One error shape for every rejected batch: the platform envelope,
    // {error: {message, detail}, status: "failure"}. ServiceError rather than BadRequestError
    // because not every rejection is a bad request -- 423 is the kill switch and 503 is the
    // database health gate, both of which mean "come back later" rather than "fix your payload".
    if (result.error) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(result.status);
        error.setMessage(result.error);
        return error;
    }

    response.setStatus(result.status);
    response.setBody(result.body);
})(request, response);
