// Discovery

var SnmpGssNetworkInfoParser = Class.create();



SnmpGssNetworkInfoParser.prototype = {
    /**
	 * @param CIData ciData The CIData object to append data to.
	 */
    initialize: function(ciData) {
		this.ciData = ciData;
		this.nics = ciData.addRelatedList('cmdb_ci_network_adapter', 'cmdb_ci');
    },

	/**
	 * @param string result The XML probe response.
	 */
	process: function(result) {
		
		// The list of interface types which are ignored and are not populated in the network adapter table.
		var IgnoredInterfaceTypes = { 131: "tunnel" };
		if (!JSUtil.toBoolean(gs.getProperty('glide.discovery.allow_loopback_adapters', false)))
			IgnoredInterfaceTypes[24] = "loopback";
		
		var snmp = new SNMPResponse(result);
		var oid_mib2    = 'iso.org.dod.internet.mgmt.mib-2.';
		var oid_interfaces  = oid_mib2 + 'interfaces';
		var oid_ip          = oid_mib2 + 'ip';
		var oid_ipv6        = oid_mib2 + 'ipv6MIB.ipv6MIBObjects';
		
		// Get the network information...
		var ips   = snmp.getOIDTable(oid_ip, 'ipAddrEntry');
		var ipv6s = snmp.getOIDTable(oid_ipv6, 'ipv6AddrEntry');
		var ifs   = snmp.getOIDTable(oid_interfaces, 'ifEntry');
		for (var index in ifs) {
			var if_entry = ifs[index];
	
			// We do not wanna record loopback interface type (http://oid-info.com/get/1.3.6.1.2.1.2.2.1.3) or tunnels 
			if (if_entry['ifType'] in IgnoredInterfaceTypes)
				continue;
			
			/* According to the this article
			*  http://tools.cisco.com/Support/SNMP/do/BrowseOID.do?local=en&translate=Translate&objectInput=1.3.6.1.2.1.2.2.1.8#oidContent
			*  The "ifOperStatus" should follow the "ifAdminStatus". However, it's apparent that there are cases where the ifOperStatus is 2 while 
			*  the ifAdminStatus is 1. Moreoever, there's actually an IP address associated with it. It's only reasonable to assume that ifOperStatus
			*  is not a reliable way to determine whether a NIC should be recorded.
			*/		
			if (if_entry['ifAdminStatus'] != 1)
				continue;
				
			var mac = SncMACAddress.getMACAddressInstance(if_entry['ifPhysAddress']);
			if (mac)
				mac = '' + mac.toString();
					
			var interfaceIndex = if_entry['ifIndex'];
			var interfaceName = if_entry['ifDescr'];
					
			var ipAddresses = []; // If there are no IPv4 addresses, then skip the interface...
			if (!this._findIPv4Addresses(ips, interfaceIndex, ipAddresses))			
				continue;
	
			this._findIPv6Addresses(ipv6s, interfaceIndex, ipAddresses);        
			
			this.addNIC(ipAddresses, mac, interfaceName);
		}
		
	},
	
    _findIPv4Addresses: function(ips, interfaceIndex, ipAddresses) {
        var result = false;

        for (var i in ips) {
            var ip_entry = ips[i];
            if (ip_entry['ipAdEntIfIndex'] && ip_entry['ipAdEntIfIndex'] != interfaceIndex)
                continue;
                
            var ip = ip_entry['ipAdEntAddr'];

            if (ip)
                ip = '' + ip.toString();
			
            if (!GlideIPAddressUtil.isValidNicIP(ip))
                continue;
            
            var mask = ip_entry['ipAdEntNetMask'];       
            if (mask)
                mask = '' + mask.toString();
                
            var ipObj = {};
            ipObj.ip_address = ip;
            ipObj.netmask = mask;
            ipObj.ip_version = '4';
            ipAddresses.push(ipObj);
            result = true;            
        }
     
        return result;
    },
    
    _findIPv6Addresses: function(ipv6s, interfaceIndex, ipAddresses) {
        for (var i in ipv6s) {
            var ip_entry = ipv6s[i];
            
            var parts = new RegExp("^\.(.+?)\.(.*)$").exec(ip_entry['@instance']);
            if (JSUtil.nil(parts))
                continue;
                
            var nicIndex = parts[1];
            var decimalDottedIPv6 = parts[2];

            if (nicIndex != interfaceIndex)
                continue;
              
            var ip = SncIPAddressV6.getDottedDecimal(decimalDottedIPv6);
            if (!ip)
                continue;
            
            var mask = ip_entry['ipv6AddrPfxLength'];       
            if (mask)
                mask = '' + mask.toString();
                
            var ipObj = {};
            ipObj.ip_address = ip;
            ipObj.netmask = mask;
            ipObj.ip_version = '6';
            ipAddresses.push(ipObj);  
        }
    },
    
    addNIC: function(ipAddresses, mac, name) {        
        var nic = {};
        nic[ 'name'        ] = name;
        nic[ 'ip_address'  ] = (ipAddresses.length > 0) ? ipAddresses[0].ip_address : null;
        nic[ 'netmask'     ] = (ipAddresses.length > 0) ? ipAddresses[0].netmask : null;
        nic[ 'mac_address' ] = mac ? mac: null;
        nic[ 'ip_addresses'] = ipAddresses;
        this.nics.addRec(nic);
    },

    type: 'SnmpGssNetworkInfoParser'
}
