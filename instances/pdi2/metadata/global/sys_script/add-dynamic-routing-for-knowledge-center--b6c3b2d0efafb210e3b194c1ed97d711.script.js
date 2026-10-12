(function executeRule(current, previous /*null when async*/) {

	//This is the route config for Knowledge Center.  If doing this for other workspaces
	//please update the routeConfig to match that of the workspace
	var routeConfig = '6f332dea4712221019f80fdc416d4368';

	var atUtil = new global.ArticleTemplateUtil();
	var tableName = current.child_table;

	//verify table was created
	var tableGr = new GlideRecord(tableName);
	if (!tableGr.isValid())
		return;

	//check that dynamic routes do not exist for this table
	var mappings = new GlideRecord('sys_ux_dynamic_route_mapping');
	mappings.addQuery('table', tableName);
	mappings.addQuery('route_config', routeConfig);
	mappings.query();
	if (mappings.hasNext())
		return;

	//create dynamic routes for new template
	atUtil.createRouteMappingForTemplate(tableName, routeConfig);

})(current, previous);
