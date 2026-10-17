function onDisplay(current, g_scratchpad) {
   //This function will be automatically called when this rule is processed.
	g_scratchpad.create_now_studio = g_scratchpad.create_now_studio ? g_scratchpad.create_now_studio : {};
	g_scratchpad.create_now_studio.display_name = current.getDisplayName() + '';
}
