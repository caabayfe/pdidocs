var selectionString = '';

function redirect (){
	selectionString = g_list.getChecked();
	if(selectionString) {
		window.location.assign("/cmdb_convert_bulk_services.do?sysparm_target_list=" + selectionString);
	} else {
		gs.log('Unable to complete UI action, no services selected for conversion');
	}
}
