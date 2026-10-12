function onLoad() {
    var ajax = new GlideAjax('MultiSourceAjax');
	ajax.addParam('sysparm_name', 'isEnabled');
	ajax.getXML(checkEnabled);
	
	function checkEnabled(response) {
		var enabled = response.responseXML.documentElement.getAttribute('answer');
		if (enabled == 'false') {
			// g_form.hideRelatedList() without timeout does not work
			// I checked with Jesus and he suggested this workaround
			setTimeout( function hide() {
				g_form.hideRelatedList('cmdb_multisource_data');
			}, 0);
		}
	}
}
