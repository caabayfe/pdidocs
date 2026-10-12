function onLoad() {
	var isDTEnabled = g_scratchpad.dynamic_translation_enabled == true || g_scratchpad.dynamic_translation_enabled == "true";
   if (!isDTEnabled) {
		g_form.setDisplay('enable_dynamic_translation', false);
   }
}
