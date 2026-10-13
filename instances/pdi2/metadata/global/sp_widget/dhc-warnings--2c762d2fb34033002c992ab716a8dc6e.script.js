(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	data.aria_label = gs.getMessage("Warnings. These are the domain audits that have completed with warning. Click on the link below to see the list of warnings.");
	var widget_parameters = {"report_id": {"displayValue": data.aria_label}, "show_title": "true"};
	data.reportwidget = $sp.getWidget("report", {"report_id": "a00bc167b34033002c992ab716a8dcdb", widget_parameters:JSON.stringify(widget_parameters)});
})();
