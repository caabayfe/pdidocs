new DiscoverySensor({
	process: function(result) {
		this.ci       = this.getCmdbCi();
		// process SNMP results
		var snmp     = new SNMPResponse(result);
		var arpTable = this.analyze(snmp);
		// update cmdb
		if (JSUtil.notNil(arpTable)) {
			this.addToRelatedList('discovery_net_arp_table', arpTable, 'cmdb_ci', 'mac_address, ip_address');
		}
	},

	analyze: function(snmp) {
		// if we didn't get any results, bail out...
		var test = snmp.getOIDObj('iso');
		if (test == null)
			return;
		// process results
		this.MACAddress   = SncMACAddress;
		var arpList       = [];
		var oid_ip        = 'iso.org.dod.internet.mgmt.mib-2.ip';
		var mediaTable    = snmp.getOIDTable(oid_ip, 'ipNetToMediaEntry');
		var physicalTable = snmp.getOIDTable(oid_ip, 'ipNetToPhysicalEntry');
		var macAddress;
		var ipAddress;
		var inst;
		// use ipNetToMediaTable first
		if (mediaTable) {
			for (inst in mediaTable) {
				macAddress = this.MACAddress.getMACAddressInstance(mediaTable[inst].ipNetToMediaPhysAddress);
				ipAddress  = mediaTable[inst].ipNetToMediaNetAddress;
				if ((JSUtil.notNil(macAddress)) && (JSUtil.notNil(ipAddress))) {
					arpList.push({'cmdb_ci':this.ci, 'mac_address':macAddress, 'ip_address':ipAddress});
				}
			}
			return arpList;
		}
		// if ipNetToMediaTable is empty use ipNetToPhysicalTable
		else {
			for (inst in physicalTable) {
				macAddress = this.MACAddress.getMACAddressInstance(physicalTable[inst].ipNetToPhysicalPhysAddress);
				ipAddress  = physicalTable[inst].ipNetToPhysicalNetAddress;
				if ((JSUtil.notNil(macAddress)) && (JSUtil.notNil(ipAddress))) {
					arpList.push({'cmdb_ci':this.ci, 'mac_address':macAddress, 'ip_address':ipAddress});
				}
			}
			return arpList;
		}
	},
	
	type: 'DiscoverySensor'
});
