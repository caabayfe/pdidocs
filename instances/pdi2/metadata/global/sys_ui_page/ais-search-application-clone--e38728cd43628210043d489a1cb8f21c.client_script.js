function actionOK() {
    var new_label = gel('sysparm_clone_label').value;
    var gm = GlideModal.prototype.get('ais_search_application_clone');
    var old_id = gm.getPreference('old_id');
	var gwt = new GwtMessage();


    if (new_label == '') {
		message = gwt.getMessage('Name cannot be empty');
		alert(message);
        return false;
    }

    if (old_id == 'null') {
		message = gwt.getMessage('Invalid ID');
        alert(message);
        return false;
    }

    var ga = new GlideAjax('AisConfigurationAjax');
    ga.addParam('sysparm_name', 'cloneSearchApplication');
    ga.addParam('sysparm_old_id', old_id);
    ga.addParam('sysparm_label', new_label);
	ga.getXMLWait();
	var answer = JSON.parse(ga.getAnswer());
	if (answer.exist) {
		message = gwt.getMessage('Search Application with given name already exists');
		alert(message);
	}
	gm.destroy();
	g_navigation.openRecord("sys_search_context_config", answer.id);
    return true;
}
