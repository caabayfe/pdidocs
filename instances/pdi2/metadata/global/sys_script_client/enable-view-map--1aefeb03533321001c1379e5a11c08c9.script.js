function onLoad() {
	// register a callback on Entry point list changes
	CustomEvent.observe('list.loaded', runDiscoveryCheckForview);
	CustomEvent.observe('partial.page.reload', runDiscoveryCheckForview);
}

function runDiscoveryCheckForview() {
	var list = GlideList2.getByName('cmdb_ci_service_discovered.sa_m2m_service_entry_point.cmdb_ci_service');
	if (!list)
		return;
	
	var disabled = (list.totalRows == 0) ? true : false;
	var buttons = $$("button[gsft_id='5c38c522533321001c1379e5a11c088b']");
	for (var i = 0; i < buttons.length; i++) {
		if (disabled)
			Form.Element.disable(buttons[i]);
		else
			Form.Element.enable(buttons[i]);
	}
}
