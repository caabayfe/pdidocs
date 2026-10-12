function include({ imports }) {
	//unifiedMapOverviewPanelUtils shared client script include in Overview panel macroponent
	const _CONNECTIONS = "connections";
	const _UNDERSCORE_LABEL = "_label";
	const _PROPERTIES = "properties";
	const _VALUE = "value"
	const _PANEL_DISPLAY_PROPS = {
		CLASS: "Class",
		DISCOVERY_SOURCE: "discovery_source",
		NAME: "Name"
	};

	return {
		PANEL_DISPLAY_PROPS: _PANEL_DISPLAY_PROPS,
		CONNECTIONS: _CONNECTIONS,
		UNDERSCORE_LABEL: _UNDERSCORE_LABEL,
		PROPERTIES: _PROPERTIES,
		VALUE: _VALUE
	};
}
