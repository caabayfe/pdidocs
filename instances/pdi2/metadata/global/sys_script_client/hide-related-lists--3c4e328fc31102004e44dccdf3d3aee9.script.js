function onLoad() {
	// if browser supports angular and is new UI, hide checklist related list
	if (g_scratchpad.browserSupported && g_scratchpad.isNewUI)
		g_form.hideRelatedList("REL:8f576281c3100200e280dccdf3d3aed8");

}
