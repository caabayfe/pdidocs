(function() {
  
	data.table = $sp.getParameter("table");
	data.sys_id = $sp.getParameter("sys_id");
	
	var record = sn_std_tkt_api.TicketConfig.getTicketRecord(data.table, data.sys_id);
	
	data.table = record.getTableName();
	
	var config = sn_std_tkt_api.TicketConfig.getConfig(data.table, record.sys_domain);
	if (config) {
		var widgetId = config.action_widget;
		var widgetParam = config.action_widget_param;
		if (widgetParam)
			widgetParam = JSON.parse(widgetParam);
		else
			widgetParam = {};
		
		widgetParam.table = data.table;
		widgetParam.sys_id = data.sys_id;
		
		if (widgetId)
			data.widget = $sp.getWidget(widgetId, widgetParam);
	}

})();
