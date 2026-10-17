function onLoad() {
	var parent = g_scratchpad.request_sys_id;
	if(parent) {
		var taskState = g_form.getValue('state');
		if (taskState != '3' && taskState != '4' && taskState != '7') {
			var ajax = new GlideAjax('AJAXRequestState');
			ajax.addParam('sysparm_id', parent);
			ajax.addParam('sysparm_name', 'getRequestState');
			ajax.getXML(ajaxCallback);
		}
	}
}

function ajaxCallback(response) {
	var items = response.responseXML.getElementsByTagName('values');
	if (items.length > 0) {
		var state = items[0].getAttribute('state');
		if (state.indexOf('closed') == 0) 
			g_form.showFieldMsg('request', 'Catalog request is closed', 'error');
	}
}
