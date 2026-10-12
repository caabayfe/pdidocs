function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
	var currentType = g_form.getValue("type");
	if(currentType == 2)return;
    g_form.clearOptions('pa_dm_kpi_configuration.aggregate_on');
    var currentTableSelected = g_form.getValue("analytics_source");
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
                g_form.addOption('pa_dm_kpi_configuration.aggregate_on', aggregates[x].key, aggregates[x].value);
            }
        }
    }
}
