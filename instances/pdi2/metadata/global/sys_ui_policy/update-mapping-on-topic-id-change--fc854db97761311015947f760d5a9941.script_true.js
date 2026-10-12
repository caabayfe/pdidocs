function onCondition() {
    var topicIdVar = 'inputs.var__m_atf_input_variable_06ebf46229220110fa9b4ca2fb4c9dc1.topic_id';
    var w = getMainWindow() || getTopWindow();
    var el = w.document.getElementById('sys_mapping.sys_atf_step.' + topicIdVar);
    if (el) {
        el.value = g_form.getValue(topicIdVar);
    }

    el = w.document.getElementById('sys_mapping_display.sys_atf_step.' + topicIdVar);
	if (el) {
        el.value = g_form.getValue(topicIdVar);
    }
}
