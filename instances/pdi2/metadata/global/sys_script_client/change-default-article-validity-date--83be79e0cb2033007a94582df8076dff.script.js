function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if(newValue === '' || (isLoading && !g_form.isNewRecord()) || typeof g_scratchpad == "undefined" || !g_scratchpad.default_valid_to_set) {
        return;
    }

    var ajax = new GlideAjax('KBAjax');
    ajax.addParam('sysparm_type', 'getDefaultValidToDate');
    ajax.addParam('sysparm_base_sys_id', newValue);
	ajax.addParam('sysparm_is_new_record', g_form.isNewRecord());

    ajax.getXML(ChangeDefaultValidTo);

    function ChangeDefaultValidTo(response) {
		var answer = response.responseXML.documentElement.getAttribute('answer');
		if(answer)
			g_form.setValue('valid_to', answer);
		else
			return;
    }
}
