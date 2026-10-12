function onCondition() {
    if (g_form.isNewRecord())
      return;
      
    // first set to read only so if the script fails it remains read only
    g_form.setReadOnly("table", true);
	g_form.setReadOnly("trigger_type", true);
	var glideAjax = new GlideAjax('PADClientUtil');
	glideAjax.addParam('sysparm_name', 'triggerDefinitionHasInstances');
	glideAjax.addParam('sysparm_trigger_def_sys_id', g_form.getUniqueValue());
	glideAjax.getXMLAnswer(setReadOnly);
}

function setReadOnly(answer) {
	if ('false' == answer) {
		g_form.setReadOnly("table", false);
		g_form.setReadOnly("trigger_type", false);
	}
}
