function RegisterAISPlugin() {
	var ga = new GlideAjax('AisConfigurationAjax');
    ga.addParam('sysparm_name', 'enableAndInitAis');
    ga.getXML();
	refreshNav();
}
