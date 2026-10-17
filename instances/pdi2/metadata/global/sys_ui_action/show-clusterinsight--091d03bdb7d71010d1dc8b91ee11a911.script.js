function openclusterinsight(){
	var ga = new GlideAjax('MLAjax');
	ga.addParam('sysparm_name','getclusterinsighttable');
	ga.addParam('sysparm_solutionid',g_form.getValue('solution'));
	ga.getXMLAnswer(function(response){
		var resultObj = JSON.parse(response);
		if (resultObj.result == 'success' && resultObj.table != '') {
			var table_name = resultObj.table;
			var url = new GlideURL(table_name+"_list.do");
			var cluster_id = g_form.getUniqueValue();
			var solution_id = g_form.getValue('solution');
			url.addParam('sysparm_query', 'solution='+solution_id+'^cluster_id='+cluster_id);
			g_navigation.open(url.getURL(),'_blank');
		}
	});
}
