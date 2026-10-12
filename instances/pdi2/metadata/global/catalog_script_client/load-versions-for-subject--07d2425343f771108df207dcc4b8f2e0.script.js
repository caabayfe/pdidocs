function onChange(control, oldValue, newValue, isLoading) {
    if (isLoading || newValue == '') {
        return;
    }
    // clear the version choices
    g_form.clearOptions('schema_version');

    if (g_form.getValue('schema_subject').trim() != "") {
        var ga = new GlideAjax('ConfluentUtil');   
        ga.addParam('sysparm_name', 'getVersions');
        ga.addParam('sysparm_subject', g_form.getOption('schema_subject', g_form.getValue('schema_subject')).text);
        ga.getXML(versionsParse);
    }

}
// callback function for returning the result from the script include
function versionsParse(response) {
    var subVersions = response.responseXML.documentElement.getAttribute('answer');

    var parsedVersions = JSON.parse(subVersions);
	
    if (parsedVersions.errorMessage) {
        var errMessage = parsedVersions.errorMessage;
        g_form.addErrorMessage(errMessage);
    } else {
        //sort the results to have the max version selected by default
        // parsedVersions.sort((a, b) => b - a);
		parsedVersions.reverse();
        for (var i = 0; i < parsedVersions.size(); i++) {
            g_form.addOption('variables.schema_version', parsedVersions[i], parsedVersions[i]);
        }
    }
}
