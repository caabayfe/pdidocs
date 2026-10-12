function assetSetDomainParameters(gDialog) {
	var ga = new GlideAjax('global.AssetUtilsAJAX');
	ga.addParam('sysparm_name', 'isDomainDataSeparationEnabled');
	ga.getXMLWait();
	if (ga.getAnswer() === 'true') {
		gDialog.setPreference('sysparm_domain', g_form.getValue('sysparm_domain'));
		gDialog.setPreference('sysparm_domain_scope', g_form.getValue('sysparm_domain_scope'));
	}
}
