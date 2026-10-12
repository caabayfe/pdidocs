function onLoad() {
	var isActive = g_scratchpad.isDomainSeparationEnabled;
	var sectionName = "domain_separationattributes";
	
	if (!isActive) {
		g_form.setSectionDisplay(sectionName, false);
	}
}
