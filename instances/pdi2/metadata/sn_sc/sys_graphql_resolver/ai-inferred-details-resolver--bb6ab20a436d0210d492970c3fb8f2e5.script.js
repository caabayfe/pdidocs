(function process( /*ResolverEnvironment*/ env) {

    // implement data resolver here
    var documentId = env.getArguments().documentId;
    var catItemId = env.getArguments().catItemRef;
    var actionType = env.getArguments().actionType;
    var additionalQuestionDetails = {};
    additionalQuestionDetails.hasAiInferredValue = isAIInferredValue();

    return additionalQuestionDetails;

    function isAIInferredValue() {
        if (!GlideStringUtil.isEligibleSysID(documentId) || !GlideStringUtil.isEligibleSysID(catItemId) || !actionType) return false;
        var cbAnalyticRecord = new GlideRecord("catalog_builder_analytics");
        cbAnalyticRecord.addQuery("action_type", actionType);
        cbAnalyticRecord.addQuery("document_id", documentId);
        cbAnalyticRecord.addQuery('cat_item', catItemId);
        cbAnalyticRecord.query();
        if (cbAnalyticRecord.next()) {
            return true;
        }
        return false;
    };
})(env);
