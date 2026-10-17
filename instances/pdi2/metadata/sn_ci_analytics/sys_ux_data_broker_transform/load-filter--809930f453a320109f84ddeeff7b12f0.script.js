function transform(input) {

    function _getFullScaleComparisonModel(comparisonModel, bucketName) {
        var vaConditionBuilderTransformationUtils = new VAConditionBuilderTransformationUtils();
        return vaConditionBuilderTransformationUtils.getFullScaleComparisonModel(comparisonModel, bucketName);
    }

    var comparisonModel = [{
        'comparisonType': 'NEW_QUERY',
        'field': '',
        'operator': '',
        'conditionValue': '',
        'tableName': bucketName,
        'hideAndButton': false,
        'hideOrButton': false,
        'children': []
    }];
    var filterId = input.filterId;
    var listType = input.listType;
    var bucketName = listType === 'conversation' ? 'va_conversations' : 'va_users';
    if (!filterId) {
        return _getFullScaleComparisonModel(comparisonModel, bucketName);
    }
    try {
        var conditionGR = new GlideRecord('sn_ci_analytics_va_condition');
        conditionGR.addQuery('sys_id', filterId);
        conditionGR.query();
        if (conditionGR.next()) {
            comparisonModel = JSON.parse(conditionGR.getValue('condition'));
        }
        return _getFullScaleComparisonModel(comparisonModel, bucketName);
    } catch (e) {
        return _getFullScaleComparisonModel(comparisonModel, bucketName);
    }
}
