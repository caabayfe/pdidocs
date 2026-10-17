function onCondition() {
	setDisplayForCBComponent();
}

function setDisplayForCBComponent() {
	var ajax = new GlideAjax("AJAXUxFrameworkScriptables");
	ajax.addParam("sysparm_name", "isCBComponent");
	ajax.addParam("sysparm_id", g_form.getUniqueValue());
	ajax.getXMLAnswer(readSalvageValue);
}

function readSalvageValue(response) {
	if (response.toString() == "true") {
		g_form.setDisplay('ext_controller_dep', true);
	} else {
		g_form.setDisplay('ext_controller_dep', false);
	}
}
