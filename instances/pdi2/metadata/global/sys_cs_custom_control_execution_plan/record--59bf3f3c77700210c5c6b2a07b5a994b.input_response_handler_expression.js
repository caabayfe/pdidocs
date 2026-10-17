function execute(controlData, responseValue) {
    if (responseValue && responseValue.status == "SUCCESS" && responseValue.requestTable == "sc_request" && responseValue.requestId != "") {
        var gr = new GlideRecord("sc_req_item");
        gr.addEncodedQuery("request=" + responseValue.requestId);
        gr.query();
        if (gr.next()) {
            responseValue.requestTable = "sc_req_item";
            responseValue.requestId = gr.getUniqueValue();
        }
    }
    vaVars.responseFromComponent = JSON.stringify(responseValue);
}
