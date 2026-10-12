function onLoad() {	
	if (g_scratchpad.need_warning) {
		g_form.addInfoMessage(getMessage("This Business Calendar has been referenced in Scheduled Jobs. Modifying this Business Calendar may affect scheduled jobs."));
	}
   
}
