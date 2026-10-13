(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	data.aria_label = gs.getMessage("Errors. These are the domain audits that have completed with error. Click on the link below to see the list of errors.");
	var widget_parameters = {"report_id": {"displayValue": data.aria_label}, "show_title": "true"};
	data.reportwidget = $sp.getWidget("report", {"report_id": "44aec567b34033002c992ab716a8dc74", widget_parameters:JSON.stringify(widget_parameters)});
})();
