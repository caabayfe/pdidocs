(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	data.aria_label = gs.getMessage("Running Audits. These are the domain audits that has not completed. Click on the link below to see the list of running audits.");
	var widget_parameters = {"report_id": {"displayValue": data.aria_label}, "show_title": "true"};
	data.reportwidget = $sp.getWidget("report", {"report_id": "4805e913b34033002c992ab716a8dc25", widget_parameters:JSON.stringify(widget_parameters)});
})();
