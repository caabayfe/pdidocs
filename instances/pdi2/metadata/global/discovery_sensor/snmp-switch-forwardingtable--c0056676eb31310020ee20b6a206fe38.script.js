new DiscoverySensor({

	prepare: function() {
		this.ci = g_probe.getParameter('cmdb_ci') + '';
		this.vlanId = g_probe.getParameter('vlanId') + '';
		this.cisco = (g_probe.getParameter('cisco').toLowerCase() == 'true');
		this.nexus = (g_probe.getParameter('nexus').toLowerCase() == 'true');
	},

	/*
	 * In case we have 0 OIDs from SNMP probe, the generic sensor skips process() method,
	 * hence the SSH probe is not running, even if it was configured to run.
	 * For that reason, finish() implementation was added, since it always called by
	 * the generic sensor.
	 */
	finish: function() {
		var results = g_array_util.ensureArray(document.result),
			hasPayload = false;

		for (var i = 0; i < results.length; i++) {
            var result = results[i];

			if (!this.checkEmptyPayload(result)) {
				hasPayload = true;
				break;
			}
		}

		if (!hasPayload && this.cisco && this.nexus &&
				 (gs.getProperty('glide.discovery.sensors.forwardingtable.ssh', 'false') == 'true'))
			this.triggerProbeSwitchMacTable();		
	},

	process: function(result) {
		// process SNMP results
		var snmp     = new SNMPResponse(result);
		var fwdTable = this.analyze(snmp);
		if (JSUtil.nil(fwdTable))
			return;
		
		// update cmdb
		var args = {
			table: 'discovery_switch_fwd_table',
			filters: { cmdb_ci:this.ci, vlan_id:this.vlanId },
			columns: ['mac_address'],
			data: fwdTable,
			markAbsent: true
		};
		
		NetBaseReconciler.reconcile(args);
	},

	analyze: function(snmp) {
		// if we didn't get any results, bail out...
		var test = snmp.getOIDObj('iso');
		if (test == null)
			return;
		// process results
		this.MACAddress     = SncMACAddress;
		var macList         = [];
		var oid_mib2        = 'iso.org.dod.internet.mgmt.mib-2.';
		var oid_dot1dBridge = oid_mib2 + 'dot1dBridge.';
		var oid_dot1dTp     = oid_dot1dBridge + 'dot1dTp';
		var oid_dot1qTp     = oid_dot1dBridge + 'qBridgeMIB.qBridgeMIBObjects.dot1qTp';
		// translate status integer to text value
		var statusMap = {
			1:'other',
			2:'invalid',
			3:'learned',
			4:'self',
			5:'mgmt'
		};
		// default to Bridge MIB
		var bridgeTable  = snmp.getOIDTable(oid_dot1dTp, 'dot1dTpFdbEntry');
		var addressField = 'dot1dTpFdbAddress';
		var portField    = 'dot1dTpFdbPort';
		var statusField  = 'dot1dTpFdbStatus';
		// for non-Cisco vendors use QBridge table
		// if QBridge table is empty, fall back to Bridge MIB
		if (!this.cisco && (snmp.getOIDTable(oid_dot1qTp, 'dot1qTpFdbEntry'))) {
			bridgeTable  = snmp.getOIDTable(oid_dot1qTp, 'dot1qTpFdbEntry');
			addressField = 'dot1qTpFdbAddress';
			portField    = 'dot1qTpFdbPort';
			statusField  = 'dot1qTpFdbStatus';
		}
		// Some NX-OS version do not provide the forwarding table using SNMP
		// In that case we need to run SSH by running the command "show mac address-table"
		else if (this.cisco && this.nexus && (!bridgeTable) &&
				 gs.getProperty('glide.discovery.sensors.forwardingtable.ssh', 'false') == 'true') {
			this.triggerProbeSwitchMacTable();
		}
		// get mac address, port index and status values
		for (var inst in bridgeTable) {
			// get mac address from address field first
			var mac = this.MACAddress.getMACAddressInstance(bridgeTable[inst][addressField]);
			// if the address field is empty pull the mac from the instance string (in decimal format) and convert it
			if (mac == null) {
				var macDec = inst.split('.').slice(-6);
				mac        = this.convertMac(macDec);
			}
			var port   = bridgeTable[inst][portField].toString() || '';
			var status = statusMap[bridgeTable[inst][statusField]] || bridgeTable[inst][statusField].toString() || 'unknown';
			macList.push({'cmdb_ci':this.ci, 'mac_address':mac, 'port':port, 'status':status, 'vlan_id':this.vlanId});
		}
		return macList;
	},

	convertMac: function(mac) {
		var hex;
		var h;
		for (var x=0; x<mac.length; x++) {
			h = (+mac[x]).toString(16);
			if (x == 0) {
				hex = (h.length < 2? '0' : '') + h + ':';
			}
			else if (x == mac.length - 1) {
				hex += (h.length < 2? '0' : '') + h;
			}
			else {
				hex += (h.length < 2? '0' : '') + h + ':';
			}
		}
		return hex;
	},

	triggerProbeSwitchMacTable: function() {
		var probe = new Probe.get("Switch - MAC Table");
		if (probe) {
			probe.setSource(this.getSource());
			probe.addParameter("cmdb_ci", this.ci);
			probe.setEccPriority(this.getParameter("priority"));
			probe.addParameter("vlanId", this.vlanId);
			probe.setMidSelectDetails(this.getParameter("mid_selector_details"));
			probe.create(this.getAgent(), this.getEccQueueId());
		}
	},
	
	type: 'DiscoverySensor'
});
