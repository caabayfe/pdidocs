function onLoad() {
	var url = new GlideURL();
	url.setFromCurrent();

	var makeTableReadOnly = false;

	
	// coming from Context menu?
	if (url.getParam("sysparm_query") && url.getParam("sysparm_query").indexOf("table") == 0)
		makeTableReadOnly = true;

	// if this is to populate a reference field...
	var target = url.getParam("sysparm_target");
	var table = '';
	if (target || g_target_parents) {

		// if we already queried the table heirarchy server side, use that
		// else, just lift the value from the url
		var tables = g_target_parents.length ? g_target_parents : [target.split('.')[0]];

		if (tables.indexOf("sc_cat_item") !== -1)
				table = "sc_req_item";

		if (tables.indexOf("contract_sla") !== -1)
				table = "task_sla";
		
		if(table != '')
			 g_form.setValue("table", table);
		
		// set read-only 'after' UI policies run (so they won't reverse it)
		setTableReadOnly();
		
		// coming from reference to wf_workflow column (ie: Catalog, SLA) ?
		var ga = new GlideAjax('WorkflowVersionUtils');
		ga.addParam('sysparm_name', 'isColumnWorkflowReference');
    	ga.addParam('sysparm_target', target);
		ga.getXML(processResponse);
	
		function processResponse(response) {
			var answer = response.responseXML.documentElement.getAttribute('answer');
			if (answer == 'true') {
				makeTableReadOnly = true;
				
				// and hide conditions.
				g_form.setSectionDisplay("conditions", false);
				if (makeTableReadOnly)
					g_form.setReadOnly("table", true);
			}
		}
		
		return;
	}

	if (url.getParam("sysparm_query") && url.getParam("sysparm_query").indexOf("table") == 0) 
		setTableReadOnly();
	
	function setTableReadOnly() {
		setTimeout( function() {
			g_form.setReadOnly("table", true);
		}, 300);
	}
}
