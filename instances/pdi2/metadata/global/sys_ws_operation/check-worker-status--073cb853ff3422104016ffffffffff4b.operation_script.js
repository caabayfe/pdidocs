(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var progressID = request.queryParams.progressID ? request.queryParams.progressID[0] : 0;
    var worker = GlideRecord("sys_progress_worker");
    if (worker.get(progressID)) {
        response.setBody({
            "WorkerStatus": worker.getValue("state"),
            "message": worker.getValue("message"),
            "stateCode": worker.getValue("state_code") == "success" ? "Ready" : (worker.getValue("state_code") == "error" ?"Connection failed" : "In-progress")
        });
    } else {
        response.setBody({
            "WorkerStatus": "complete",
            "message": "invalid progressID",
            "stateCode": "Not available"
        });
    }

})(request, response);
