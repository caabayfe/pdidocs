function onCondition() {
	var ga = new GlideAjax('CategoryUtil');
	ga.addParam('sysparm_name','getCatalog');
	ga.addParam('sysparm_category_sysid',g_form.getValue('parent'));
	ga.getXML(UpdateCatalog);
}

function UpdateCatalog(response) {
	var catalogSysId = response.responseXML.documentElement.getAttribute("answer");
	g_form.setValue('sc_catalog', catalogSysId);
}
