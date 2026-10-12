function onCondition() {
	if (g_form.isNewRecord())
		return;
	var ga = new GlideAjax('AssetUtilsAJAX');
	ga.addParam('sysparm_name', 'shouldMakeStatusSubstatusReadonly');
	ga.addParam('sysparm_asset', g_form.getUniqueValue());
	ga.getXML(process); // async ajax call

	function process (response) {
		var result = JSON.parse(response.responseXML.documentElement.getAttribute('answer'));
		if (result) {
			if(result.install_status === true){
			g_form.setReadOnly('install_status', result.install_status);
			}
			if(result.substatus === true){
			g_form.setReadOnly('substatus', result.substatus);
			}
		} else {
			g_form.setReadOnly('install_status', false);
			g_form.setReadOnly('substatus', false);
		}
	}
}
