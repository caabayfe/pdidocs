function transform(input) {
    var encodedQuery = input.encodedVACondition;
    var table = input.table;
    if (!encodedQuery || !table)
        return {
            "success": false,
            "result": []
        };
    var result = null;
    try {
        var decodedModel = new sn_ci_analytics.VAComparisonModelEncodedQueryUtils().decodeVAURIQuery(encodedQuery);
        result = new sn_ci_analytics.VAConditionBuilderTransformationUtils().getFullScaleComparisonModel(decodedModel.va_comparison_model, table);
        if (!result) {
            return {
                "success": false,
                "result": []
            };
        }
        return {
            "success": true,
            "result": result
        };
    } catch (e) {
        return {
            "success": false,
            "result": []
        };
    }
}
