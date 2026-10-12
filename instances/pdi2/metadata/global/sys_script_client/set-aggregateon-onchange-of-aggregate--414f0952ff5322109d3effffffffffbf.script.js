function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var currentView = g_form.getViewName();
    if (currentView.toLowerCase() === "formula") return;

    g_form.clearOptions('pa_datasnapshot_indicator.field');
    var currentTableSelected = g_form.getValue("data_snapshot_source");
    var currentAggregateSelected = g_form.getValue("aggregate");

    var ga = new GlideAjax('PAKPIFormUtils');
    ga.addParam("sysparm_name", "analytics_source_aggregates");
    ga.addParam('sysparm_source_id', currentTableSelected);
    ga.addParam('sysparm_aggregate', currentAggregateSelected);
    ga.getXML(handleTableSelection);

    function handleTableSelection(response) {
        var answer = response;
        var result = response.responseXML.getElementsByTagName("result");
        if (result && result.length > 0) {
            var aggregateString = result[0].getAttribute("aggregate");
            var aggregates = JSON.parse(aggregateString);
            for (var x = 0; x < aggregates.length; x++) {
                g_form.addOption('pa_datasnapshot_indicator.field', aggregates[x].key, aggregates[x].value);
            }
        }
    }
}
