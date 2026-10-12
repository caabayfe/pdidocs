// This script gets called whenever the rootNode (from context params) or ciData (from get map data controller) is changed or when rootNode is empty
function script({api, event, helpers, imports}) {
	const { cloneDeep } = imports['sn_cmdb_ws.unifiedMapUtils']();
	var ciData = api.context.props.ciData;
	var rootNode = api.context.props.rootNode;
	const {PANEL_DISPLAY_PROPS, CONNECTIONS, UNDERSCORE_LABEL, PROPERTIES, VALUE } = imports["sn_cmdb_ws.unifiedMapOverviewPanelUtils"]();
	var bind = {

		homeNodeName,
		homeNodeType,
		numCis: 0,
		numCiTypes: 0,
		numConnections: 0,
		numConnectionTypes: 0,
		numDeliverySources: 0,

		init: function() {
			this.calculatePanelData();
			this.setPanelData();
		},

		calculatePanelData: function() {
			this.homeNodeName = ciData[rootNode][PANEL_DISPLAY_PROPS.NAME];
			this.homeNodeType = ciData[rootNode][PANEL_DISPLAY_PROPS.CLASS];

			var typeSet = new Set();
			var sourceSet = new Set();
			var connectionSet = new Set();

			var keys = Object.keys(ciData);
			keys.filter((sysid) => !!ciData[sysid].Class).map((sysid) => {
				var ci = ciData[sysid];

				let type = ci[PANEL_DISPLAY_PROPS.CLASS];
				let source = ci[PROPERTIES][PANEL_DISPLAY_PROPS.DISCOVERY_SOURCE][VALUE];
				let connections = ci[CONNECTIONS];

				if (type) {
					typeSet.add(type);
				}

				if (connections) {
					this.numConnections += connections.length;
					connections.forEach(connection => {
						let label = connection[UNDERSCORE_LABEL];
						if (label) {
							connectionSet.add(label);
						}
					});
				}

				if (source) {
					sourceSet.add(source);
				}
			});

			this.numCis = keys.length;
			this.numCiTypes = typeSet.size;
			this.numConnectionTypes = connectionSet.size;
			this.numDeliverySources = sourceSet.size;
		},

		setPanelData: function() {
			var changedOverviewPanelData = cloneDeep(api.state.overviewPanelData);

			const dataMappings = [
				[this.homeNodeName, this.homeNodeType],
				[this.numCis.toString(), this.numCiTypes.toString()],
				[this.numConnections.toString(), this.numConnectionTypes.toString()],
				[this.numDeliverySources.toString()],
			];

			dataMappings.forEach((values, index) => {
				values.forEach((value, subIndex) => {
					changedOverviewPanelData[index][subIndex].value = value;
				});
			});
			api.setState("overviewPanelData", changedOverviewPanelData);
		}
	}

	if (ciData && rootNode) {
		bind.init();
	}
}
