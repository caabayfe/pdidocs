(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var requestBody = request.body.data;
    gs.info("Request body is: " + JSON.stringify(requestBody));

    // Validate the request body
    if (requestBody && Object.keys(requestBody).length === 0) {
        response.setStatus(400);
        response.setBody({
            "error": "Request body is missing"
        });
        return;
    }

    //Preparing the seed data
    var seedData = {};
    if (requestBody.tableName) {
        seedData = {
            "tableName": requestBody.tableName,
            "fieldNames": requestBody.fieldNames,
            "maxRowLimit": requestBody.maxRowLimit,
            "encodedQuery": requestBody.encodedQuery
        };
    }

    //Preparing the pipeline input
    var pipelineDetails = {
        "label": requestBody.label,
        "description": requestBody.description,
        "sygraConfig": requestBody.sygraConfig
    };

    //Submitting Sygra Workflow Job
    var output = new global.SygraWorkflow().submitJob(seedData, pipelineDetails);
    if (!output.isError) {
        var successResponse = {
            "message": output.responseMessage,
            "solutionName": output.solutionName
        };

        gs.info("Response Data: " + JSON.stringify(successResponse));

        // Send success response
        response.setStatus(200);
        response.setBody(successResponse);
    } else {
        response.setStatus(500);
        response.setBody({
            "error": output.responseMessage
        });
    }

})(request, response);
