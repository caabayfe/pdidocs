new DiscoverySensor({
	process: function(result) {
		this.ci = g_probe.getParameter("cmdb_ci");
		// process SNMP results
		var snmp = new SNMPResponse(result);
		var bpt  = this.analyze(snmp);
		if (JSUtil.nil(bpt))
			return;
		
		// update cmdb
		var args = {
			table: 'discovery_switch_bridge_port_table',
			filters: { cmdb_ci:this.ci },
			columns: ['interface_index', 'port'],
			data: bpt,
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
		var bpTableList   = [];
		var oid_dot1dBase = 'iso.org.dod.internet.mgmt.mib-2.dot1dBridge.dot1dBase';
		var bpTable       = snmp.getOIDTable(oid_dot1dBase, 'dot1dBasePortEntry');
		// get port and interface index values
		for (var inst in bpTable) {
			var port    = JSUtil.notNil(bpTable[inst].dot1dBasePort) ? bpTable[inst].dot1dBasePort.toString() : "";
			var ifIndex = JSUtil.notNil(bpTable[inst].dot1dBasePortIfIndex) ? bpTable[inst].dot1dBasePortIfIndex.toString() : "";
			if (ifIndex)
				bpTableList.push({'cmdb_ci':this.ci, 'port':port, 'interface_index':ifIndex});
		}
		return bpTableList;
	},
	
	type: 'DiscoverySensor'
});
