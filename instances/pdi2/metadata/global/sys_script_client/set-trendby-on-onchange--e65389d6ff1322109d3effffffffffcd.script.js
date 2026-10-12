function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var currentView = g_form.getViewName();
    if (currentView.toLowerCase() === "formula") return;

    g_form.clearOptions('pa_datasnapshot_indicator.trend_by');

    // Get the selected analytics source
    var currentSourceSelected = g_form.getValue("data_snapshot_source");

    // Calling the Script Include to get datetime fields from dimensions and aggregate_fields
    var ga = new GlideAjax('PAKPIFormUtils');

    ga.addParam("sysparm_name", "analytics_source_trendby_fields");

    ga.addParam("sysparm_source_id", currentSourceSelected);

    ga.getXML(handleTrendByFields);

    function handleTrendByFields(response) {
        var result = response.responseXML.getElementsByTagName("result");
        if (result && result.length > 0) {
            var trendbyString = result[0].getAttribute("trendby_fields");
            var trendbyFields = JSON.parse(trendbyString);
            g_form.addOption('pa_datasnapshot_indicator.trend_by', '', getMessage('None'));
            // Adding each datetime field as an option in the trend_by field
            for (var i = 0; i < trendbyFields.length; i++) {
                g_form.addOption('pa_datasnapshot_indicator.trend_by', trendbyFields[i].key, trendbyFields[i].value);
            }
        }
    }

}
