function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    var type_value = g_form.getValue('type');
    var compare_value = g_form.getValue('is_compare_chart');
    var showDataLabels =
        (type_value == 'time' ||
            (type_value == 'breakdown' && newValue != 'scorecard' && newValue != 'pivot_scorecard') ||
            type_value == 'pivot');

    var showDisplayOnType = (type_value == 'time' ||
        type_value == 'breakdown' ||
        type_value == 'pivot' ||
        type_value == 'text');

    g_form.setDisplay('show_data_labels', showDataLabels);

    var chartSettingFields = [
        'include_forecast',
        'yaxis_to',
        'include_confidence',
        'include_target',
        'include_trend',
        'include_comments',
        'compare_main_label',
        'yaxis2_to',
        'yaxis2_from',
        'include_thresholds',
        'chart_color',
        'yaxis_from'
    ];

    var displayChartSettings = (newValue != 'relative' && type_value == 'time');

    for (var i = 0; i < chartSettingFields.length; i++) {
        var chartSettingField = chartSettingFields[i];
		// Hide target and trend for previous period chart
        if (compare_value == 'true' && (chartSettingField === 'include_target' || chartSettingField === 'include_trend'))
            g_form.setDisplay(chartSettingField, false);
	else
            g_form.setDisplay(chartSettingFields[i], displayChartSettings);
    }

    g_form.setSectionDisplay('pivot_settings', type_value == 'pivot');
    g_form.setSectionDisplay('axis_settings', type_value == 'time');
    g_form.setSectionDisplay('display_settings', displayChartSettings || showDisplayOnType);


    showOrHideTextWidgetFields(type_value == 'text');


    function showOrHideTextWidgetFields(isDisplay) {
        var textWidgetFields = ['limit', 'cutoff', 'field', 'cutoff_type', 'cutoff_condition'];
        for (var i = 0; i < textWidgetFields.length; i++)
            g_form.setDisplay(textWidgetFields[i], isDisplay);

        if (isDisplay) {

            var otherFieldsInWidgetSettings = [
                'include_forecast',
                'include_confidence',
                'include_target',
                'include_trend',
                'include_comments',
                'include_thresholds'
            ];

            for (var j = 0; j < otherFieldsInWidgetSettings; j++)
                g_form.setDisplay(otherFieldsInWidgetSettings[j], !isDisplay);
        }
    }
}
