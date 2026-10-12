function startBulkPopulation(){
	var ga = new GlideAjax('LifeCycleAjaxUtil');
	ga.addParam('sysparm_name', 'startBulkPopulationForPI');
	ga.getXML(handleResponse);
}

function handleResponse(response){
	GlideModal.get().destroy();
}

function refresh(){
	GlideModal.get().destroy();
	var modal = new GlideModal('CSDM_discrepancy_report');
	modal.setTitle('Discrepancy Report');
	modal.setWidth(550);
	modal.render();
}

function createStubsAndFilter(mappingTable){
	var ga = new GlideAjax('LifeCycleAjaxUtil');
	ga.addParam('sysparm_name', 'createStubRecordsAndFilter');
	ga.addParam('sysparm_targetTable', mappingTable);
	ga.getXMLAnswer(handleFilterResponse);
}

function handleFilterResponse(response){
	var answer = JSON.parse(response);
	var filteredRedirect = answer.filteredUrl;
	
	top.window.open(filteredRedirect);
}
