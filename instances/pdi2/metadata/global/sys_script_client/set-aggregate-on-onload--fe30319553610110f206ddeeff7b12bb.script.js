function onLoad() {

	var currentType = g_form.getValue("type");
	if(currentType == 2)return;
    var currentTableSelected = g_form.getValue("analytics_source");
	var currentAggregateSelected = g_form.getValue("aggregate");

    var selectedAggregate = document.getElementById("pa_dm_kpi_configuration.aggregate_on").value;
    g_form.clearOptions('pa_dm_kpi_configuration.aggregate_on');

    var ga = new GlideAjax('PAKPIFormUtils');
    ga.addParam("sysparm_name", "analytics_source_aggregates");
    ga.addParam('sysparm_source_id', currentTableSelected);
	ga.addParam('sysparm_aggregate', currentAggregateSelected);
    ga.getXML(handleTableSelection);

    function handleTableSelection(response) {
        var answer = response;
        var result = response.responseXML.getElementsByTagName("result");
        if (result && result.length) {
            var k = 0;
            var aggregateString = result[0].getAttribute("aggregate");
            var aggregates = JSON.parse(aggregateString);
            for (var i = 0, j = 0; i < aggregates.length; i++) {
                var index = selectedAggregate.indexOf(aggregates[i].key);
                if (index > -1) {
                    g_form.setValue('pa_dm_kpi_configuration.aggregate_on', aggregates[i].key, aggregates[i].value);
                    j++;
                } else {
                    g_form.addOption('pa_dm_kpi_configuration.aggregate_on', aggregates[i].key, aggregates[i].value);
                    k++;
                }
            }
        }
    }
}
