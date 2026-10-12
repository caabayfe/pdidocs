var selectionString = '';

function convertToITService(){
	selectionString = g_form.getUniqueValue();
	if(selectionString) {
		window.location.assign("/cmdb_convert_bulk_services.do?sysparm_target_list=" + selectionString);
	} else {
		gs.log('Unable to complete UI action "Convert to Service Instance".');
	}
}
