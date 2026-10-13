new DiscoveryJSONMultiSensor({

	convertMac: function(macToConvert) {
		var macHexRepresentation,
			index,
			macCharHexRepresentation;

		for (index = 0; index < macToConvert.length; index++) {
			macCharHexRepresentation = (+macToConvert[index]).toString(16);

			if (index == 0)
				macHexRepresentation = (macCharHexRepresentation.length < 2 ? '0' : '') + macCharHexRepresentation + ':';
			else if (index == macToConvert.length - 1)
				macHexRepresentation += (macCharHexRepresentation.length < 2 ? '0' : '') + macCharHexRepresentation;
			else
				macHexRepresentation += (macCharHexRepresentation.length < 2 ? '0' : '') + macCharHexRepresentation + ':';
		}

		return macHexRepresentation;
	},

	finish: function(){
		
		this.MACAddress = SncMACAddress;

		var forwardingTable = this.forwardingTable,
			vlanId = g_probe.getParameter('vlanId'),
			ci = g_probe.getParameter('cmdb_ci');

		if (JSUtil.nil(forwardingTable))
			return;

		// build object
		for (var entryIndex in forwardingTable) {
			var mac = this.MACAddress.getMACAddressInstance(forwardingTable[entryIndex].mac_address);

			if (mac == null) {
				var macDec = (forwardingTable[entryIndex].mac_address).split('.').slice(-6);
				mac = this.convertMac(macDec);
			}
			forwardingTable[entryIndex].mac_address = mac + '';
			forwardingTable[entryIndex].cmdb_ci = ci + '';
		}

		// update cmdb
		var args = {
			table: 'discovery_switch_fwd_table',
			filters: { cmdb_ci:ci + '', vlan_id:vlanId },
			columns: ['mac_address'],
			data: forwardingTable,
			markAbsent: true
		};
		
		NetBaseReconciler.reconcile(args);
	},

	type: "Switch - MAC Table"
});
