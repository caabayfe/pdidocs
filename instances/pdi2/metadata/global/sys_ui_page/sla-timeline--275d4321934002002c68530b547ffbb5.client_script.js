getUrl();

function getUrl() {
	if(gel('sla_list').value && gel('task_list').value){
		var url = new GlideURL('show_schedule_page.do');
		url.addParam('sysparm_nostack',true);
		url.addParam('sysparm_page_schedule_type', 'sla_timeline');
		url.addParam('sysparm_timeline_sla', gel('sla_list').value);
		url.addParam('sysparm_timeline_task',  gel('task_list').value);
		gel('show_schedule').src = url.getURL();
	}
}
function setTaskTable(){
	// Get the elements , update the reference field
	var slaGR = gel('sla_list').value;
	var gr = new GlideRecord("contract_sla");
	if(gr.get(slaGR)) {
		gel('task_listTABLE').value = gr.collection;
		gel('task').innerHTML = '<span class="required-marker"></span>' + g_engines[gr.collection]+"";
	}
	else{
		gel('task_listTABLE').value = 'task';
		var i18nTaskMsg = "${gs.getMessage('Task')}";
		gel('task').innerHTML = '<span class="required-marker"></span>' + i18nTaskMsg;
	}
	getUrl();
}
