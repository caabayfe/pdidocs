function refreshList(response) {
	var output = JSON.parse(response.responseXML.documentElement.getAttribute('answer').split(','));
	if (output && output.result=="success" && output.records) {
		var recfield = 'rec_sys_idIN'+output.records;
		if (g_list.getTableName() != "ml_cluster_detail") {
			var records = output.records.split(",");
			recfield = "";
			for(var i=0,j=records.length; i<j; i++ ){
				recfield = recfield+'record_reference='+records[i]+'^OR';
			}
			recfield = recfield.substring(0,recfield.length-3);
		}
		var query = 'cluster_id=' + output.cluster_id + '^'+recfield;
		if (g_list.isRelated) {
			query = recfield;
		}
        
		// Refresh list with new filters
		g_list.setFilterAndRefresh(query);
	}	
}

function generateClusterSample() {
	var queryString = g_list.getQuery();
	var tblName = g_list.getTableName();
	if (g_list.isRelated) {
		queryString = "cluster_id=" + g_form.getUniqueValue();
	}
	if(queryString.indexOf("cluster_id=") < 0) {
		alert("Sample can be generated for records from one cluster only");
	} else {
		var ga = new GlideAjax("MLAjax");
		ga.addParam('sysparm_name', 'getClusterSample');
		ga.addParam('sysparm_query', queryString);
		ga.addParam('sysparm_tblname', tblName);
		ga.getXML(refreshList);
	}
}
