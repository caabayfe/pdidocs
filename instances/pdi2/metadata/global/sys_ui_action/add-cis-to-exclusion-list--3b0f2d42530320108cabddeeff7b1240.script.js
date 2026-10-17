function addToExclusionList() {
	var selected_cis = g_list.getChecked();
	var confirmMessage = getMessage('Do you want to add the selected CI(s) to the exclusion list?');
    var answer = confirm(confirmMessage);
    if (answer == true) {
		var ga = new GlideAjax('ExcludeCIsFromCMDBTask');
		ga.addParam('sysparm_name', 'addCIstoExclusionList');
		ga.addParam('sysparm_selected_cis', selected_cis);
		ga.addParam('sysparm_task_sys_id',g_form.getUniqueValue());
		ga.getXML(doAfterServerResponse);
    }
}

function doAfterServerResponse(response){
	location.reload();
}
