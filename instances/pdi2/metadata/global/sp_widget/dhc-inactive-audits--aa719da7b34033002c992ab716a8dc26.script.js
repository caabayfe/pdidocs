(function() {
        /* populate the 'data' object */
        /* e.g., data.table = $sp.getValue('table'); */
	data.aria_label = gs.getMessage("Inactive Audits. These are the inactive domain audit definitions. Click on the link below to see the list of inactive audit definitions.");
	var widget_parameters = {"report_id": {"displayValue": data.aria_label}, "show_title": "true"};
	data.reportwidget = $sp.getWidget("report", {"report_id": "06b5ed13b34033002c992ab716a8dcca", widget_parameters:JSON.stringify(widget_parameters)});
})();
