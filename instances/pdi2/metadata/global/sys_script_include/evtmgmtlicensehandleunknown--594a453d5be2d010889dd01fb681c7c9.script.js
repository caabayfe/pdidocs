var EvtMgmtLicenseHandleUnknown = Class.create();
EvtMgmtLicenseHandleUnknown.prototype = {
    initialize: function() {
    },
	
	removeUnknownNodes: function() {
		
		var AreNodesRemoved = gs.getProperty("evt_mgmt.unknown_nodes_removed", false);
		if (AreNodesRemoved == "true")
			return;
		
		var gr = new GlideRecord("em_unique_nodes");
		gr.addQuery("type", "unknown");
		gr.query();

		gs.info("EvtMgmtLicenseHandleUnknown - deleting {0} rows from License Usage table.", gr.getRowCount());
		gr.deleteMultiple();
		
		gs.setProperty("evt_mgmt.unknown_nodes_removed", true);
	},

    type: 'EvtMgmtLicenseHandleUnknown'
};
