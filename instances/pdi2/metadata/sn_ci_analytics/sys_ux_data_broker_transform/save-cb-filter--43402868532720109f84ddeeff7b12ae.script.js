function transform(input) {

    function checkIfConditionExists(filterName, listType) {
        var condition = new GlideRecord('sn_ci_analytics_va_condition');
        condition.addQuery('name', filterName);
        condition.addQuery('list_type', listType);
        condition.query();
        if (condition.next()) {
            return true;
        }
        return false;
    }

    var response = {};
    var filterName = input.filterName;
    var comparisonModel = input.comparisonModel;
    var listType = input.listType;
    var conditionGR = new GlideRecord('sn_ci_analytics_va_condition');

    if (conditionGR.canRead() && conditionGR.canCreate()) {
        if (checkIfConditionExists(filterName, listType)) {
            response.errorMessage = gs.getMessage('A filter with this name already exists');
        } else {
            var vaConditionBuilderTransformationUtils = new VAConditionBuilderTransformationUtils();
            conditionGR.initialize();
            conditionGR.setValue('name', filterName);
            conditionGR.setValue('condition_type', 'custom');
            conditionGR.setValue('list_type', listType);
            conditionGR.setValue('condition', JSON.stringify(vaConditionBuilderTransformationUtils.getMinifiedComparisonModel(comparisonModel)));
            var conditionId = conditionGR.insert();
            response.conditionSysId = conditionId;
            response.success = gs.getMessage('Filter Saved');
        }
    } else {
        response.errorMessage = gs.getMessage('Insufficient permissions');
    }

    return response;
}
