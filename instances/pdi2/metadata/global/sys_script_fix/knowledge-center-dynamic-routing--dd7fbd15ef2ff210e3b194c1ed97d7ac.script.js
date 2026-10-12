function addRouteMappings() {
	var mappings = new GlideRecord('sys_ux_dynamic_route_mapping');
	mappings.addEncodedQuery('tableLIKEkb_template');
	mappings.query();
	var existingMappings = [];
	while( mappings.next() ){
		var tableName = mappings.getValue('table');
		if(existingMappings.indexOf(tableName) == -1)
			existingMappings.push(tableName);
	}
	var templates = new GlideRecord('kb_article_template');
	templates.addQuery('child_table','NOT IN',existingMappings);
	templates.query();
	var articleUtil = new global.ArticleTemplateUtil();

	//NOTE: If making this change for your workspace, change the routeConfig
	//variable to match that of your workspace
	var routeConfig = '6f332dea4712221019f80fdc416d4368';
	while(templates.next()){
		articleUtil.createRouteMappingForTemplate(templates.child_table,routeConfig);
	}
}

addRouteMappings();
