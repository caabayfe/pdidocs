function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '' || !g_form.isLiveUpdating()) {
        return;
    }
	
	var ga = new GlideAjax('WrapUpInteractionAjaxUtil');
    ga.addParam('sysparm_name', 'isWrapUpEnabled');
    ga.addParam('sysparm_recSysId', g_form.getUniqueValue());
    ga.getXML(getAnswer);

    function getAnswer(response) {
        var isWrapUpEnabled = response.responseXML.documentElement.getAttribute("answer");
        if (isWrapUpEnabled == "true" && (newValue == 'wrap_up' || newValue == 'closed_complete'))
			g_form.save();
	}
}
