function onLoad() {
	var ga = new GlideAjax('MLAjax');
	ga.addParam('sysparm_name','checkEntitlements');
	ga.addParam('sysparm_capability',g_scratchpad.capability);
	ga.getXMLAnswer(function(response){
		if (!response) return;
		var validationObj = JSON.parse(response);
		if(!validationObj.validation){
			g_form.addErrorMessage(validationObj.errorMsg);
		}
	});
}
