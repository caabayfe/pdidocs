function onLoad() {
	var ASSERT_TEXT_ID = "475e0de3d732130089fca2285e610361";

	if (g_scratchpad.sys_atf_step_config !== ASSERT_TEXT_ID)
		return;

	var element = gel("element.sys_atf_step.inputs.var__m_atf_input_variable_" + ASSERT_TEXT_ID + ".mugshot_version");
	if (!element)
		return;

	element.setAttribute("style", "display:none");
}
