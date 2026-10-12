function actionOK() {
    var new_label = gel('sysparm_clone_label').value;
    var gm = GlideModal.prototype.get('ais_genius_result_configuration_clone');
    var old_id = gm.getPreference('old_id');

    if (new_label == '') {
        gs.getMessage("Label cannot be empty");
        return false;
    }

    if (old_id == 'null') {
        gs.getMessage("Invalid ID");
        return false;
    }

    var ga = new GlideAjax('AisConfigurationAjax');
    ga.addParam('sysparm_name', 'cloneGeniusResultConfiguration');
    ga.addParam('sysparm_old_id', old_id);
    ga.addParam('sysparm_label', new_label);
	ga.getXMLWait();
	var answer = JSON.parse(ga.getAnswer());
	if (answer.exist)
        alert('Genius result configuration with given name already exists');

	gm.destroy();
	g_navigation.openRecord("ais_genius_result_configuration", answer.id);
    return true;
}
