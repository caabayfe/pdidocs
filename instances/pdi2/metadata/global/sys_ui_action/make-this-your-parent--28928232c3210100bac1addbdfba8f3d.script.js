function makeThisYourParent() {
	var sysId = typeof g_sysId == 'undefined' || g_sysId == null ? g_form.getUniqueValue() : g_sysId;
	
	// This ajax call will also update the database with the instance ID if it is not already set
	var ajax = new GlideAjax("com.glide.update.UpdateSetAjaxProcessor");
	ajax.addParam("sysparm_function", "makeParent");
	ajax.addParam("sysparm_sys_id", sysId);
	ajax.getXML(onMakeParent);
}

function onMakeParent(response) {
	var data;
	var p;
	var url;
	var jsonElem = response.responseXML.getElementsByTagName('json');
	if (jsonElem && jsonElem.length > 0) {
		data = getTextValue(jsonElem[0]).evalJSON();
	}
	else // if there's no json, there should be an error ui notification
		return;

	// If a progress worker has been started for the reconcile, go watch it
	p = data.progress;
	if (p) {
		url = 'sync_preview_status.do?sysparm_pworker_sysid=' + p.progress_id +
			'&sysparm_sync_sysid=' + p.sync_id;
		window.location.replace(url);
	} 
}
