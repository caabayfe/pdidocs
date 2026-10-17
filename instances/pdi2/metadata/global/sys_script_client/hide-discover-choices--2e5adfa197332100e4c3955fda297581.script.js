function onLoad() {
	if (g_scratchpad.discoverChoicesToHide){
		for (var i = 0; i < g_scratchpad.discoverChoicesToHide.length; i++){
			g_form.removeOption('discover', g_scratchpad.discoverChoicesToHide[i]);
		}
	}
}
