function onLoad() {

    var currentView = g_form.getViewName();
    if (currentView.toLowerCase() === "formula") return;

    var currentTableSelected = g_form.getValue("data_snapshot_source");
    var currentAggregateSelected = g_form.getValue("aggregate");

    var selectedAggregate = g_form.getValue('pa_datasnapshot_indicator.field');
    g_form.clearOptions('pa_datasnapshot_indicator.field');

    var ga = new GlideAjax('PAKPIFormUtils');
    ga.addParam("sysparm_name", "analytics_source_aggregates");
    ga.addParam('sysparm_source_id', currentTableSelected);
    ga.addParam('sysparm_aggregate', currentAggregateSelected);
    ga.getXML(handleTableSelection);

    function handleTableSelection(response) {
        var answer = response;
        var result = response.responseXML.getElementsByTagName("result");
        if (result && result.length) {
            var aggregateString = result[0].getAttribute("aggregate");
            var aggregates = JSON.parse(aggregateString);
            for (var i = 0, j = 0; i < aggregates.length; i++) {
                var index = selectedAggregate.indexOf(aggregates[i].key);
                if (index > -1) {
                    g_form.setValue('pa_datasnapshot_indicator.field', aggregates[i].key, aggregates[i].value);
                } else {
                    g_form.addOption('pa_datasnapshot_indicator.field', aggregates[i].key, aggregates[i].value);
                }
            }
        }
    }
}
