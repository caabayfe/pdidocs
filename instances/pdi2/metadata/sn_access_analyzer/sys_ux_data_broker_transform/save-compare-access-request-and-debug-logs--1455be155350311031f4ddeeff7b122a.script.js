function transform(input) {
    populateLastRunInRequest(input);
    var baseUserRequestId = saveResult(input.baseUserResult);
    var modelUserRequestId = saveResult(input.modelUserResult);
    saveAccessComparisonRequest(baseUserRequestId, modelUserRequestId);
    return {
        "baseUserRequestId": baseUserRequestId,
        "modelUserRequestId": modelUserRequestId
    };

    function saveResult(result) {
        var aaUtil = new sn_access_analyzer.AccessAnalyzerUtil();
        var requestGR = aaUtil.saveRequest(result.request);
        var entityName = new sn_access_analyzer.AccessAnalyzeExecutor().getEntityName(requestGR);
        requestGR.setValue("analyzed_by", requestGR.analyze_by + ": " + entityName);
        requestGR.update();
        aaUtil.saveResult(result.debugLogAPIResponse, requestGR);
        return requestGR.getUniqueValue();
    }

    function saveAccessComparisonRequest(baseUserRequestId, modelUserRequestId) {
        var accessComparisonRequestGr = new GlideRecord("sn_access_analyzer_access_comparison_request");
        accessComparisonRequestGr.initialize();
        accessComparisonRequestGr.setValue("user_1_request", baseUserRequestId);
        accessComparisonRequestGr.setValue("user_2_request", modelUserRequestId);
        accessComparisonRequestGr.insert();
    }

    function populateLastRunInRequest(input) {
        var date = new GlideDateTime();
        input.baseUserResult.request.last_run = date;
        input.modelUserResult.request.last_run = date;
    }
}
