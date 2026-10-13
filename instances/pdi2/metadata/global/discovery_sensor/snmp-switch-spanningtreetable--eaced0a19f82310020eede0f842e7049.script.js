new DiscoverySensor({
	process: function(result) {
		this.ci = g_probe.getParameter("cmdb_ci");
		// process SNMP results
		var snmp = new SNMPResponse(result);
		var stp  = this.analyze(snmp);
		if (JSUtil.nil(stp))
			return;
		
		// update cmdb
		var args = {
			table: 'discovery_switch_spanning_tree_table',
			filters: { cmdb_ci:this.ci },
			columns: ['port'],
			data: stp,
			markAbsent: false,
			forceUpdate: true
		};
		
		NetBaseReconciler.reconcile(args);
	},
	
	analyze: function(snmp) {
		// if we didn't get any results, bail out...
		var test = snmp.getOIDObj('iso');
		if (test == null)
			return;
		// process results
		this.MACAddress      = SncMACAddress;
		var stpList          = [];
		var oid_stpPortTable = 'iso.org.dod.internet.mgmt.mib-2.dot1dBridge.dot1dStp';
		var stpPortTable     = snmp.getOIDTable(oid_stpPortTable, 'dot1dStpPortEntry');
		// translate port state integer to text value
		var statusMap = {
			1:'disabled',
			2:'blocking',
			3:'listening',
			4:'learning',
			5:'forwarding',
			6:'broken'
		};
		// translate port enable integer to text value
		var enableMap = {
			1:'enabled',
			2:'disabled'
		};
		for (var inst in stpPortTable) {
			var port                = JSUtil.notNil(stpPortTable[inst].dot1dStpPort) ? stpPortTable[inst].dot1dStpPort + "" : "";
			var portState           = JSUtil.notNil(stpPortTable[inst].dot1dStpPortState) ?  statusMap[stpPortTable[inst].dot1dStpPortState] : stpPortTable[inst].dot1dStpPortState + "";
			var portEnable          = JSUtil.notNil(stpPortTable[inst].dot1dStpPortEnable) ? enableMap[stpPortTable[inst].dot1dStpPortEnable] : stpPortTable[inst].dot1dStpPortEnable + "";
			var designatedRoot      = JSUtil.notNil(stpPortTable[inst].dot1dStpPortDesignatedRoot) ? this.MACAddress.getMACAddressInstance(stpPortTable[inst].dot1dStpPortDesignatedRoot.split(' ').slice(-6)) : "";
			var designatedBridgeMac = JSUtil.notNil(stpPortTable[inst].dot1dStpPortDesignatedBridge) ? this.MACAddress.getMACAddressInstance(stpPortTable[inst].dot1dStpPortDesignatedBridge.split(' ').slice(-6)) : "";
			stpList.push({'cmdb_ci':this.ci, 'port':port, 'port_state':portState, 'port_enable':portEnable, 'designated_root':designatedRoot, 'designated_bridge_mac':designatedBridgeMac});
		}
		return stpList;
	},
	
	type: 'DiscoverySensor'
});
