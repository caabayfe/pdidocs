// Discovery class
// Created By		John Delinocci john.delinocci@servicenow.com
// Name				DiscoveryVlanSwitchProcessor
// Accessible from	All application scopes
// Description		Processes the results from the SNMP - Switch - Vlan discovery probe/sensor and runs the horizontal discovery process
// Script

var DiscoveryVlanSwitchProcessor = Class.create();
DiscoveryVlanSwitchProcessor.prototype = {
	initialize: function() {
		this.oid_mib2 = 'iso.org.dod.internet.mgmt.mib-2.';
	},
	
	process: function(ci, result) {
		this.cisco = false;
		this.nexus = false;
		// process SNMP results
		var snmp     = new SNMPResponse(result);
		var sysDescr = snmp.getOIDText(this.oid_mib2 + 'system.sysDescr');
		// determine if it's a cisco
		if (JSUtil.notNil(sysDescr) && sysDescr.toLowerCase().indexOf('cisco') != -1) {
			this.cisco = true;
		}
		// determine if it's a cisco nexus
		if (JSUtil.notNil(sysDescr) && sysDescr.toLowerCase().indexOf('nx-os') != -1) {
			this.nexus = true;
		}
		// get VLAN Ids
		var vlanList = this.analyze(snmp);
		// launch forwarding table probe
		for (var x=0; x<vlanList.length; x++) {
			this.triggerProbeForwardTable(ci, vlanList[x]);
		}
		// launch bridge port table probe
		// if cisco iterate through vlans
		if (this.cisco) {
			for (var y=0; y<vlanList.length; y++) {
				this.triggerProbeBridgePortTable(ci, vlanList[y]);
			}
		}
		// if non-cisco run once
		else {
			this.triggerProbeBridgePortTable(ci);
		}
		// spanning tree table
		// if cisco iterate through vlans
		if (this.cisco) {
			for (var z=0; z<vlanList.length; z++) {
				this.triggerProbeSpanningTreeTable(ci, vlanList[z]);
			}
		}
		// if non-cisco run once
		else {
			this.triggerProbeSpanningTreeTable(ci);
		}
	},
	
	analyze: function(snmp) {
		// if we didn't get any results, bail out...
		var test = snmp.getOIDObj('iso');
		if (test == null)
			return;
		// process results
		var oid_ciscoMgmt     = 'iso.org.dod.internet.private.enterprises.cisco.ciscoMgmt.';
		var oid_ciscoVtpVlan  = oid_ciscoMgmt + 'ciscoVtpMIB.vtpMIBObjects.vlanInfo';
		var oid_ciscoVmVlan   = oid_ciscoMgmt + 'ciscoVlanMembershipMIB.ciscoVlanMembershipMIBObjects.vmMembership';
		var oid_juniperVlan   = 'iso.org.dod.internet.private.enterprises.juniperMIB.jnxMibs.jnxExMibRoot.jnxExSwitching.jnxExVlan.jnxVlanMIBObjects';
		var oid_dot1q_vlans   = this.oid_mib2 + 'dot1dBridge.qBridgeMIB.qBridgeMIBObjects.dot1qVlan';
		var ciscoVtpVlanTable = snmp.getOIDTable(oid_ciscoVtpVlan, 'vtpVlanEntry');
		var ciscoVmVlanTable  = snmp.getOIDTable(oid_ciscoVmVlan, 'vmMembershipSummaryEntry');
		var juniperVlanTable  = snmp.getOIDTable(oid_juniperVlan, 'jnxExVlanEntry');
		var genericVlanTable  = snmp.getOIDTable(oid_dot1q_vlans, 'dot1qVlanCurrentEntry');
		var rex   = /.*\.([0-9]+)$/;
		var vlanIdList        = [];
		var inst, match;
		// check the cisco vtpVlan table first
		if (ciscoVtpVlanTable) {
			for (inst in ciscoVtpVlanTable) {
				match = rex.exec(inst);
				if (match && match[1]) {
					vlanIdList.push({'vlanId':match[1]});
				}
			}
		}
		// check the cisco VLAN management table
		else if (ciscoVmVlanTable) {
			for (inst in ciscoVmVlanTable) {
				vlanIdList.push({'vlanId':inst.replace(/\./,'')});
			}
		}
		// check the juniper VLAN table
		else if (juniperVlanTable) {
			for (inst in juniperVlanTable) {
				vlanIdList.push({'vlanId':juniperVlanTable[inst].jnxExVlanTag, 'vlanIndex':inst});
			}
		}
		// check the generic VLAN table
		else if (genericVlanTable) {
			for (inst in genericVlanTable) {
				match = rex.exec(inst);

				if(match && match[1])
					vlanIdList.push({'vlanId':genericVlanTable[inst].dot1qVlanFdbId, 'vlanIndex':match[1]});
			}
		}
		return vlanIdList;
	},
	
	triggerProbeForwardTable: function(ci, vlanIdObject) {
		var oid_spec_list;
		if (!this.cisco) {
			var vlanIndex = vlanIdObject.vlanIndex;
			// use QBridge MIB
			oid_spec_list = 'table iso.org.dod.internet.mgmt.mib-2.dot1dBridge.qBridgeMIB.qBridgeMIBObjects.dot1qTp.dot1qTpFdbTable dot1qTpFdbAddress.' + vlanIndex + ',dot1qTpFdbPort.' + vlanIndex + ',dot1qTpFdbStatus.' + vlanIndex;
			// use Bridge MIB
			oid_spec_list += '\ntable iso.org.dod.internet.mgmt.mib-2.dot1dBridge.dot1dTp.dot1dTpFdbTable dot1dTpFdbAddress.' + vlanIndex + ',dot1dTpFdbPort.' + vlanIndex + ',dot1dTpFdbStatus.' + vlanIndex;
		}
		else {
			// use Bridge MIB table for cisco
			oid_spec_list = 'table iso.org.dod.internet.mgmt.mib-2.dot1dBridge.dot1dTp.dot1dTpFdbTable dot1dTpFdbAddress,dot1dTpFdbPort,dot1dTpFdbStatus';
		}
		var probe = new Probe.get("SNMP - Switch - ForwardingTable");
		if (probe) {
			probe.setSource(g_probe.getSource());
			probe.addParameter("cmdb_ci", ci);
			if (this.cisco) 
				probe.addParameter("index", vlanIdObject.vlanId);
			probe.addParameter("oid_spec_list", oid_spec_list);
			probe.addParameter("vlanId", vlanIdObject.vlanId);
			probe.addParameter("cisco", this.cisco);
			probe.addParameter("nexus", this.nexus);
			probe.setEccPriority(g_probe.getParameter("priority"));
			probe.setMidSelectDetails(g_probe.getParameter("mid_selector_details"));
			probe.create(g_probe.getAgent(), g_probe.getEccQueueId());
		}
	},
	
	triggerProbeBridgePortTable: function(ci, vlanList) {
		var probe = new Probe.get("SNMP - Switch - BridgePortTable");
		if (probe) {
			probe.setSource(g_probe.getSource());
			probe.addParameter("cmdb_ci", ci);
			if (this.cisco) 
				probe.addParameter("index", vlanList.vlanId);
			probe.setEccPriority(g_probe.getParameter("priority"));
			probe.setMidSelectDetails(g_probe.getParameter("mid_selector_details"));
			probe.create(g_probe.getAgent(), g_probe.getEccQueueId());
		}
	},
	
	triggerProbeSpanningTreeTable: function(ci, vlanList) {
		var probe = new Probe.get("SNMP - Switch - SpanningTreeTable");
		if (probe) {
			probe.setSource(g_probe.getSource());
			probe.addParameter("cmdb_ci", ci);
			if (this.cisco)
				probe.addParameter("index", vlanList.vlanId);
			probe.setEccPriority(g_probe.getParameter("priority"));
			probe.setMidSelectDetails(g_probe.getParameter("mid_selector_details"));
			probe.create(g_probe.getAgent(), g_probe.getEccQueueId());
		}
	},
	
	type: 'DiscoveryVlanSwitchProcessor'
};
