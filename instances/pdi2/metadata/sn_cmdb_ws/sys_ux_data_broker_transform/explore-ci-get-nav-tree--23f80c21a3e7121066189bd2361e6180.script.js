function transform(input) {
	const util = new sn_cmdb_ws.CMDBWorkspaceUtil();
	const CONST = new sn_cmdb_ws.CMDBWsConstants();
	let result = [{
		"id": "summary",
		"label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Summary"),
		"identifierProps": {
			"type": "icon",
			"icon": "briefcase-outline"
		}
	},
	{
		"id": "attributes",
		"label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Attributes"),
		"identifierProps": {
			"type": "icon",
			"icon": "document-outline"
		},
		"children":[]
	},
	{
		"id": "tags",
		"label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Tags"),
		"identifierProps": {
			"type": "icon",
			"icon": "tags-outline"
		}
	},
	{
		"id":"resources",
		"label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Resources"),
		"identifierProps": {
			"type": "icon",
			"icon": "table-outline"
		},
		"children":[]
	},
	{
		"id": "activity",
		"label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Activity"),
		"identifierProps": {
			"type": "icon",
			"icon": "activity-outline"
		}
	},
	{
		"id": "relationships",
		"label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Relationships"),
		"identifierProps": {
			"type": "icon",
			"icon": "tree-view-long-outline"
		}
	},
	{
		"id": "service_and_offering",
		"label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Services and Offerings"),
		"identifierProps": {
			"type": "icon",
			"icon": "hand-gear-outline"
		}
	},
	{
		"id": "health",
		"label": sn_i18n.Message.getMessage("sn_cmdb_ws", "Health"),
		"identifierProps": {
			"type": "icon",
			"icon": "health-status-outline"
		}
	}];

	let isCMDB360Enabled = false;
	let isDiscoveryInstalled = util.isPluginActive(CONST.PLUGINS.ITOM_DISCOVERY_LICENSE);
	let isMultiSrcPropEnabled = util.getSystemProperty(CONST.SYS_PROPERTIES_NAME.MULTISRC_ENABLED, CONST.DATATYPE.BOOLEAN);
	isCMDB360Enabled = isDiscoveryInstalled && isMultiSrcPropEnabled;
	if (isCMDB360Enabled) {
		result.push({
			"id": "cmdb_360",
			"label": sn_i18n.Message.getMessage("sn_cmdb_ws", "CMDB 360"),
			"identifierProps": {
				"type": "icon",
				"icon": "chart-donut-outline"
			}
		});
	}
	
	return result;
}
