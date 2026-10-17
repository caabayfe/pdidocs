function onLoad() {

    var ga = new GlideAjax('ConfluentUtil');
    ga.addParam('sysparm_name', 'getSubjects');
    ga.getXML(subjectsParse);
}

// callback function for returning the result from the script include
function subjectsParse(response) {

    var allSubjects = response.responseXML.documentElement.getAttribute('answer');
	var parsedSubs = JSON.parse(allSubjects);
    if (parsedSubs.errorMessage) {
        var errMessage = parsedSubs.errorMessage;
        g_form.addErrorMessage(errMessage);

    } else if (parsedSubs.size() <= 0) {
        g_form.addInfoMessage("There are no Schemas/Subjects in the Confluent Registry");
    } else {
        for (var i = 0; i < parsedSubs.size(); i++) {
            g_form.addOption('variables.schema_subject', parsedSubs[i], parsedSubs[i]);
        }

    }
}
