// TODO - Figure out why onLoad scripts don't run
function onLoad() {
    var referenceValue = g_form.getValue('reference');
	var listValue = g_form.getValue('list_table');
	if (!referenceValue && !listValue)
		return;

    var ga = new GlideAjax('global.QuestionCreationWizardUtils');
    ga.addParam('sysparm_name', 'getDisplayColumn');
    ga.addParam('sysparm_table_name', referenceValue ? referenceValue : listValue);
    ga.getXML(handleResponse);

    function handleResponse(serverResponse) {
		var fieldToSet = referenceValue ? 'reference_display_field' : 'list_table_display_field';
        var answer = serverResponse.responseXML.documentElement.getAttribute("answer");
        g_form.setValue(fieldToSet, answer);
    }

}
