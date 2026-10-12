// This script gets called whenever the overview panel macro component is ready
async function script({ api, event, helpers, imports }) {
	const nodeName = await helpers.translate("N/A");
	const nodeType = nodeName;
	const defaultMarkerFilterTimestamp = nodeName;

	const homeNodeLabel = await helpers.translate("Home node");
	const homeNodeTypeLabel = await helpers.translate("Home node type");
	const numCisLabel = await helpers.translate("CIs");
	const numCiTypesLabel = await helpers.translate("CI types");
	const numConnectionsLabel = await helpers.translate("Connections");
	const numConnectionsTypeLabel = await helpers.translate("Connection types");
	const numDeliverSourcesLabel = await helpers.translate("Discovery sources");

	const defaultOverviewPanelData = [
		[
			{ label: homeNodeLabel, value: nodeName },
			{ label: homeNodeTypeLabel, value: nodeType }
		],
		[
			{ label: numCisLabel, value: "0" },
			{ label: numCiTypesLabel, value: "0" }
		],
		[
			{ label: numConnectionsLabel, value: "0" },
			{ label: numConnectionsTypeLabel, value: "0" }
		],
		[
			{ label: numDeliverSourcesLabel, value: "0" }
		]
	]
	api.setState("overviewPanelData", defaultOverviewPanelData);
	api.setState("markerFilterTimestamp", defaultMarkerFilterTimestamp);
	let ciData = api.context.props.ciData;
	let rootNode = api.context.props.rootNode;
	if (rootNode && ciData && Object.keys(ciData).length) {
		api.emit("SN_UNIFIED_MAP_CTRL#UPDATE_OVERVIEW_PANEL");
	}
}
