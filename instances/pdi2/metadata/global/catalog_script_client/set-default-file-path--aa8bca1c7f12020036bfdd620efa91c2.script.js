function onChange(control, oldValue, newValue, isLoading) {
   if (isLoading || newValue == '') {
      return;
   }

	var filePath = g_form.getControl('file_path');
	
	if (newValue != '')
		setDefaultFilePath(newValue);
}

function setDefaultFilePath(midServerId) {
	var filePath = g_form.getControl('file_path');
	var esajax = new GlideAjax('ExportTargetHelper');
	esajax.addParam('sysparm_name', 'getOSForMIDServer');
	esajax.addParam('sysparm_mid_server_id', midServerId);
	esajax.getXML(function(resp) {
		var rootNode = resp.responseXML.getElementsByTagName('xml');
		var osValue = rootNode[0].getAttribute('answer');
		if (osValue != null && osValue.toLowerCase().indexOf('windows') > -1)
			filePath.value = "\\";
		else
			filePath.value = "/";
	});
}
