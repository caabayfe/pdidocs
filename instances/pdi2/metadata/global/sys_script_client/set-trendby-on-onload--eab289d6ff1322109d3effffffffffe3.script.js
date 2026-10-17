function onLoad() {

    var currentView = g_form.getViewName();
    if (currentView.toLowerCase() === "formula") return;

    var currentSourceSelected = g_form.getValue("data_snapshot_source");
    var selectedTrendBy = g_form.getValue("trend_by");
    g_form.clearOptions('pa_datasnapshot_indicator.trend_by');

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
            for (var i = 0, j = 0; i < trendbyFields.length; i++) {
                var index = selectedTrendBy.indexOf(trendbyFields[i].key);
                if (index > -1) {
                    g_form.setValue('pa_datasnapshot_indicator.trend_by', trendbyFields[i].key, trendbyFields[i].value);
                    j++;
                } else {
                    g_form.addOption('pa_datasnapshot_indicator.trend_by', trendbyFields[i].key, trendbyFields[i].value);
                }
            }
        }
    }

}
