function onLoad() {
	var portfolioId = g_form.getValue("spm_service_portfolio");
	var layerId = g_form.getValue("spm_taxonomy_layer");
	
	var ga = new GlideAjax("global.SPMClientUtilAjax");
	ga.addParam("sysparm_name", "getLeafOrder");
	ga.addParam("sysparm_portfolio", portfolioId);
	ga.addParam("sysparm_layer", layerId);
	ga.getXML(renderRelatedList);
	
	function renderRelatedList(response) {
		  var answer = response.responseXML.documentElement.getAttribute("answer");
		  if(answer && answer == 'leaf') {
			  g_form.showRelatedList('cmdb_ci_service.spm_taxonomy_node');
		  } else {
			  g_form.hideRelatedList('cmdb_ci_service.spm_taxonomy_node');
		  }
	}
   
}
