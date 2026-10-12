 function showFlows(tableName) {	
	 var query = 'sys_id=javascript:sn_flow.AssociatedFlows.getFlows("'+tableName+'")^active=true';
	 var url = new GlideURL('sys_hub_flow_list.do');
	 url.addParam('sysparm_referring_url', g_list.getReferringURL());
	 url.addParam('sysparm_query', query );
	 url.addParam('sysparm_domain_restore', 'false');

	 g_navigation.open(url.getURL());
 }
