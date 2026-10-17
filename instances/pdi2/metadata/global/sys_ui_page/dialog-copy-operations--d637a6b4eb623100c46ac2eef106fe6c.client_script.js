function validateAndSubmit() {
    var set_default = gel('ni.default_version').checked;
	var service_definition = gel('service_definition').value;
	var version = document.getElementById('selected_version');  
	var versionValue = version.options[version.selectedIndex].value;
	var table = gel('table').value;
	
	var ga = new GlideAjax('AddScriptedRESTVersionAjax');
	ga.addParam('sysparm_name','addNewVersion');
	ga.addParam('sysparm_service_definition',service_definition);
	ga.addParam('sysparm_version_id',versionValue);
	ga.addParam('sysparm_set_default',set_default);
	
	ga.getXML(function (response) {
			GlideDialogWindow.get().destroy();
			location.reload();
	});

    return true;
}
