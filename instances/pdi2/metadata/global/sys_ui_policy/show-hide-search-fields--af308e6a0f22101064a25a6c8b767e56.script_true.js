function onCondition() {
	if (!NOW.ais_enabled) return;
	
	if (NOW.ais_enabled == 'true' && g_scratchpad.spWidgetDataTable == 'sp_instance_ais')
		hideNonaisSections();
	else
		g_form.setSectionDisplay('ai_search', false);
	
	
	function hideNonaisSections() {
		var sections = g_form.getSectionNames();
		for (var x = 0; x < sections.length; x++) {
			if (sections[x] == "ai_search")
				continue;
			g_form.setSectionDisplay(sections[x], false);
		}
	}
	
}
