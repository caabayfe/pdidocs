function onChange(control, oldValue, newValue, isLoading) {
    var filterConditionValue = g_form.getValue("condition_builder");
    try {
        filterConditionValue = JSON.parse(filterConditionValue);
    } catch (error) {
        filterConditionValue = {
            tableName: '',
            encodedQuery: '',
        };
    }
    var encodedQuery = filterConditionValue.encodedQuery;
    g_form.setValue('reference_qual', encodedQuery);
}
