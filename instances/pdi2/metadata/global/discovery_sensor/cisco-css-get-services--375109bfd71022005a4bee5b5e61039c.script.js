new DiscoverySensor ({
	process: function(result, ciData) {
		var snmp = new SNMPResponse(result);
		var contextTable = 'iso.org.dod.internet.private.enterprises.cisco.ciscoMgmt.arrowPoint.apMgmt.cntExt';
		var subTable = snmp.getOIDTable(contextTable, 'apCntEntry');
   
		var contextList = [];
		for (var lbServiceInfo in subTable) {
			var service = {};
			if (subTable[lbServiceInfo]['apCntEnable'] == '1')	{
				service.name = subTable[lbServiceInfo]['apCntName'];
				service.ip_address = subTable[lbServiceInfo]['apCntIPAddress'];
				service.port = subTable[lbServiceInfo]['apCntPort'];
				contextList.push(service);
   
			}
		}
   
		this.addToRelatedList('cmdb_ci_lb_service', contextList, 'load_balancer', 'name');
   
   },
   type: 'DiscoverySensor'
});
