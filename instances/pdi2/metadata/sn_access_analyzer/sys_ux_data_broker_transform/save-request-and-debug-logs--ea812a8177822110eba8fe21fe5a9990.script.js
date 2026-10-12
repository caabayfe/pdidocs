function transform(input) {
    var aaUtil = new sn_access_analyzer.AccessAnalyzerUtil();
    var requestGR;
    if (input.requestId != null) {
        requestGR = new GlideRecord("sn_access_analyzer_request");
        requestGR.addQuery("sys_id", input.requestId);
        requestGR.query();
        if (requestGR.next()) {
            requestGR.setValue("last_run", new GlideDateTime());
            requestGR.update();
            aaUtil.saveResult(input.debugLogAPIResponse, requestGR);
            return {
                "requestId": input.requestId
            };
        }
    } else {
        input.request.last_run = new GlideDateTime();
        requestGR = aaUtil.saveRequest(input.request);
        var entityName = new sn_access_analyzer.AccessAnalyzeExecutor().getEntityName(requestGR);
        requestGR.setValue("analyzed_by", requestGR.analyze_by + ": " + entityName);
        requestGR.update();
        aaUtil.saveResult(input.debugLogAPIResponse, requestGR);
        return {
            "requestId": requestGR.getUniqueValue()
        };
    }
}
