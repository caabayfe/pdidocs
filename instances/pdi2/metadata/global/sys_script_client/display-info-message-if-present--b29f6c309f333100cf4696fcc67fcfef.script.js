function onLoad() {	
	//check if info message is present and display it
	if (g_scratchpad.info_msg) {
		g_form.addInfoMessage(getMessage(g_scratchpad.info_msg));
		g_scratchpad.info_msg = '';
	}
}
