function onLoad() {
   var sourceId = g_form.getValue("analytics_source");
   if (sourceId === '')
	return;
	
	var ga = new GlideAjax('PAAnalyticsSourceUtil');
	ga.addParam("sysparm_name", "hasNextDate");
	ga.addParam('sysparm_source_id', sourceId);
	ga.getXML(handleCalendarAggregateSelection);
}

function handleCalendarAggregateSelection(response) {
	var result = response.responseXML.getElementsByTagName("result");
	var hasNextDate = result[0].getAttribute("next_date");
	if (hasNextDate == 'false') {
		g_form.setValue('calendar_aggregate' , "END_SPAN");
		g_form.setReadOnly('calendar_aggregate', true);
	}
	else{
		g_form.setReadOnly('calendar_aggregate', false);
	}
 }
