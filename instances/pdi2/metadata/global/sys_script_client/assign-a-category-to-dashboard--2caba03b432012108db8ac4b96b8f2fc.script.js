function onSubmit() {
	var gUrl = new GlideURL();
	gUrl.setFromCurrent();
	var artifactSysID = gUrl.getParam("sysparm_artifact_sys_id");

	// this prevents running this client script
	// whenever a category is created from outside the dashboard designer
	if (!artifactSysID)
		return;

	var artifactType = gUrl.getParam("sysparm_artifact_type");
	var categorySysId = g_form.getUniqueValue();
	var categoryName = g_form.getValue("category_name");
	var order;

	var grCount = new GlideRecord('analytics_category_m2m');
	grCount.addQuery('artifact_id', artifactSysID);
	grCount.orderByDesc('display_order');
	grCount.query();

	if(grCount.next()) {
		order = parseInt(grCount.display_order) + 1;
	} else {
		order = 1;
	}
	
	var gr = new GlideRecord('analytics_category_m2m');
	gr.initialize();
	gr.category = categorySysId;
	gr.type = artifactType;
	gr.artifact_id = artifactSysID;
	gr.display_order = order;
	if(gr.insert()) {
		window.localStorage.setItem("DASHBOARD_CATEGORY_ASSIGNED_SUCCESSFULLY", categoryName);
	}
}
