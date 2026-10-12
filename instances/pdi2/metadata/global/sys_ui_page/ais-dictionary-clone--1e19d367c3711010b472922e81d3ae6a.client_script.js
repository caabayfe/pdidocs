function actionOK(){
    var new_label = gel('sysparm_clone_label').value;
    var m = GlideModal.prototype.get('ais_dictionary_clone');
    var old_id = m.getPreference('old_id');

    if (new_label == '') {
        alert(getMessage('Label cannot be empty'));
        return false;
    }

    if (old_id == 'null') {
        alert(getMessage('Invalid ID'));
        return false;
    }

    var ga = new GlideAjax('AisConfigurationAjax');
    ga.addParam('sysparm_name', 'cloneDictionary');
    ga.addParam('sysparm_old_id', old_id);
    ga.addParam('sysparm_label', new_label);
	ga.getXMLWait();
	var answer = JSON.parse(ga.getAnswer());
	if (answer.exist)
        alert(getMessage('Dictionary with given label already exists'));

	m.destroy();
	g_navigation.openRecord("ais_dictionary", answer.id);
    return true;
}
