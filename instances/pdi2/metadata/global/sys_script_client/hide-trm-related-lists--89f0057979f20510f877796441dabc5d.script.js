function onLoad() {
	var pluginstatus = new GlideAjax('SAMAjaxUtil');
	pluginstatus.addParam('sysparm_name', 'getPluginInfo');
	pluginstatus.addParam('sysparm_plugin_id', 'com.snc.apm_trm');

	pluginstatus.getXML(function(response) {
		var items = response.responseXML.getElementsByTagName('values');
		var isActive = items && items.length ? items[0].getAttribute('status') : false;

		if (isActive === 'false') {
			g_form.hideRelatedList('REL:5b555dc1286e4510f87772d04e554e10'); // TRM Product Lifecycles
		}
	});
}
