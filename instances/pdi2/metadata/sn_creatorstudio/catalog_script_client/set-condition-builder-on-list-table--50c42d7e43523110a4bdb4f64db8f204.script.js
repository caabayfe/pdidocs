function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }

    var conditionBuilderValue = g_form.getValue("condition_builder");
    try {
        conditionBuilderValue = JSON.parse(conditionBuilderValue);
        conditionBuilderValue = {
            tableName: newValue,
            encodedQuery: '',
        };
    } catch (error) {
        conditionBuilderValue = {
            tableName: '',
            encodedQuery: ''
        };
    }
    g_form.setValue("condition_builder", JSON.stringify(conditionBuilderValue));
}
