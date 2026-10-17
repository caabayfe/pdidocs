// Discovery
/**
 * This class includes the functions to process the snmp identity probes results. 
 * Function 'process' parses the 'SNMP - Identity Info' MultiProbe result, adding generic NICs and serial numbers to the passed CIData object.
 * Function 'processNetscalerIdentityInfo' parses 'SNMP - Netsclar - Identity Info' Probe result and adds NICs 
 */
var SnmpIdentityInfoParser = Class.create();
SnmpIdentityInfoParser.prototype = {
	
	/**
	 * @param CIData ciData The CIData object to append data to.
	 */
	initialize: function(ciData) {
		this.ciData = ciData;
		// When cisco vlan indexing is turned on, chances are high that the snmp queries for the different
		// VLANS will return the same serial/NIC info so they need to be deduped before sending to the
		// Identification Engine or being reconciled by DiscoveryReconciler
		if (!ciData.serialDeduper)
			ciData.serialDeduper = {};
		if (!ciData.nicDeduper)
			ciData.nicDeduper = {};
		this.serials = ciData.addRelatedList('cmdb_serial_number', 'cmdb_ci');
		this.nics = ciData.addRelatedList('cmdb_ci_network_adapter', 'cmdb_ci');
	},
	
	/***********************************************************************************
	 * 
	 *  The following part is used to parse 'SNMP - Identity Info' MultiProbe result
	 *
	 ***********************************************************************************/
	
	/**
	 * @param string result The XML probe response.
	 */
	process: function(result) {
		var oid_mib2 = 'iso.org.dod.internet.mgmt.mib-2.';
		var oid_ip   = oid_mib2 + 'ip';
		var oid_ipv6 = oid_mib2 + 'ipv6MIB.ipv6MIBObjects';
		
		var snmp = new SNMPResponse(result);
		this._processSerialInfo(snmp);
		
		var ips   = snmp.getOIDTable(oid_ip, 'ipAddrEntry');
		var ipv6s = snmp.getOIDTable(oid_ipv6, 'ipv6AddrEntry');
		var validInterfaces = this._getValidInterfaces(snmp);
		
		for (var index in validInterfaces) {
			var if_entry = validInterfaces[index];
			var ipAddresses = []; // If there are no IPv4 addresses, then skip the interface...
			if (!this._findIPv4Addresses(ips, if_entry.index, ipAddresses))			
				continue;
			
			this._findIPv6Addresses(ipv6s, if_entry.index, ipAddresses);        
			this.addNIC(ipAddresses, if_entry.mac, if_entry.name);
		}
	},
	
    _findIPv4Addresses: function(ips, interfaceIndex, ipAddresses) {
        var result = false;

        for (var i in ips) {
            var ip_entry = ips[i];
            if (ip_entry['ipAdEntIfIndex'] != interfaceIndex)
                continue;
                
            var ip = ip_entry['ipAdEntAddr'];

            if (ip)
                ip = '' + ip.toString();
			
            if (!this.isValidNicIP(ip))
                continue;
            
            var mask = ip_entry['ipAdEntNetMask'];       
            if (mask)
                mask = '' + mask.toString();
                
            ipAddresses.push(this._createIpObject(ip, mask,'4'));
            result = true;            
        }
     
        return result;
    },
    
	isValidNicIP: function(ipAddress){
		if (!SncIPAddressV4.validate(ipAddress))
			return false;

		var isInvalid = ipAddress.equals('0.0.0.0') || ipAddress.equals('255.255.255.255') || ipAddress.startsWith('127.');
		
		return !isInvalid;
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

            if (!ip || ip.isLocalhost())
                continue;
            
            var mask = ip_entry['ipv6AddrPfxLength'];       
            if (mask)
                mask = '' + mask.toString();
                
            ipAddresses.push(this._createIpObject(ip, mask,'6'));  
        }
    },
	
	_processSerialInfo: function(snmp) {
		var oid_mib2 = 'iso.org.dod.internet.mgmt.mib-2.';
		var oid_cisco   = 'iso.org.dod.internet.private.enterprises.cisco.';
		var oid_foundry = 'iso.org.dod.internet.private.enterprises.foundry.';
		var oid_apc     = 'iso.org.dod.internet.private.enterprises.apc.';
		var oid_entity  = oid_mib2 + 'entityMIB.';
		var oid_printer = oid_mib2 + 'printmib.';
		
		// get any serial numbers we might have...
		// first we look in the entity MIB, as this is the most generic place it might be...
		var physObjs = snmp.getOIDTable(oid_entity + 'entityMIBObjects.entityPhysical', 'entPhysicalEntry');
		if(physObjs != null) {
			for(var instance in physObjs) {
				if (physObjs[instance]['entPhysicalContainedIn'] === 0 && JSUtil.notNil(physObjs[instance]['entPhysicalSerialNum'])) {
					this.addSerial('physical', physObjs[instance]['entPhysicalSerialNum']);
					break;
				}
			}
		}
		// see if we can find a Cisco serial in the Cisco Stack MIB...
		this.addSerial('cisco_stack', snmp.getOIDText(oid_cisco + 'workgroup.ciscoStackMIB.chassisGrp.chassisSerialNumberString'));
		
		// our last resort for Cisco is their old MIB; note that this value is overwritten by this IOS line:
		// snmp-server chassis-id xxxx
		// so we use this only if we have to, as it may be tainted by the touch of humans...
		this.addSerial('cisco_chassis', snmp.getOIDText(oid_cisco + 'temporary.chassis.chassisId'));
		
		// if this wasn't a Cisco device, let's see if it was a Foundry device...
		this.addSerial('foundry', snmp.getOIDText(oid_foundry + 'products.switch.snChassis.snChasGen.snChasSerNum'));
		
		// if this was an APC PDU 
		this.addSerial('apc_pdu', snmp.getOIDText(oid_apc + 'products.hardware.masterswitch.sPDUIdent.sPDUIdentSerialNumber') );
		
		// if there was no serial number otherwise, then maybe we've got a printer here...
		var printerGen = snmp.getOIDTable(oid_printer + 'prtGeneral', 'prtGeneralEntry');
		if ((printerGen != null) && (typeof printerGen['1'] != 'undefined'))
			this.addSerial('printer', printerGen['1']['prtGeneralSerialNumber']);
		
		// let's see if we've got an APC UPS here, with its very own serial number...
		this.addSerial('standard', snmp.getOIDText(oid_apc + 'products.hardware.ups.upsIdent.upsAdvIdent.upsAdvIdentSerialNumber'));
		
	},
	
	/***********************************************************************************
	 * 
	 *  The following part is used to parse 'SNMP - Netscaler - Identity Info' Probe result
	 *
	 ***********************************************************************************/
	
	 processNetscalerIdentityInfo: function(result) {
		 
		var oid_group = 'iso.org.dod.internet.private.enterprises.netScaler.nsProducts.rs9000.nsSysGroup';
		var snmp = new SNMPResponse(result);
		var ips = snmp.getOIDTable(oid_group, 'nsIpAddrEntry');
		var vlans = snmp.getOIDTable(oid_group,'vlanEntry');
		
		var validInterfaces = this._getValidInterfaces(snmp);
		for (var index in validInterfaces) {
			var if_entry = validInterfaces[index];
			var ipAddresses = []; // If there are no IPv4 addresses, then skip the interface...
			if (!this._findNetscalerIPV4(ips, vlans, if_entry.name, ipAddresses))			
				continue;
	        
			
			this.addNIC(ipAddresses, if_entry.mac, if_entry.name);
		}
	},
	
	/**
	 * Netscaler by default does not provide any differentiation between network interfaces. 
	 * All network traffic is transmitted on all interfaces.
	 * The ip_addresses in nsIpAddrEntry can be assigned to all interfaces. If the ipVlan was 
	 * defined for the ip_address then the ip_address will be assigned to only interfaces 
	 * assigned to that vlan. 
	 */
	_findNetscalerIPV4: function (ips, vlans, interfaceName, ipAddresses) {
		var result = false;
		for (var i in ips) {
			var ip_entry = ips[i];
			var ip = ip_entry['ipAddr'];
			if (ip)
				ip = '' + ip.toString();
			
			if (!GlideIPAddressUtil.isValidNicIP(ip))
					continue;
			
			if (!ip_entry['ipVlan']) {
				ipAddresses.push(this._createIpObject(ip, ip_entry['ipNetmask'], '4'));
				result = true;
				continue;
			}
			
			var ipVlan = ip_entry['ipVlan'].toString() + '';
			
			// "NA" means Vlan 1 confirmed by Netscaler Supports (PRB1258867)
			if (ipVlan == 'NA') 
				ipVlan = '1';
				
			for (var vIndex in vlans) {
				var vlan_entry = vlans[vIndex];
				var vlan_id = vlan_entry['vlanId'].toString() + '';
				
				if ( vlan_id != ipVlan) 
					continue;
				
				var vInterfaces = vlan_entry['vlanMemberInterfaces'];
				
				if (!vInterfaces)
					continue; 
				
				vInterfaces = (vInterfaces.toString() + '').trim();
				var interfaceList = vInterfaces.split(' '); 
				if (interfaceList.indexOf(interfaceName) != -1) {
					ipAddresses.push(this._createIpObject(ip_entry['ipAddr'], ip_entry['ipNetmask'],'4'));
					result = true; 
				}
				
			}
			
		}
		return result; 
	},
	
	
	
	/***********************************************************************************
	 * 
	 *  Internal functions 
	 *
	 ***********************************************************************************/

	_createIpObject: function(ip, mask, version) {
		var ipObj = {};
		ipObj.ip_address = ip;
		ipObj.netmask = mask;
		ipObj.ip_version = version;
		ipObj.discovery_source = 'ServiceNow';
		
		return ipObj;
	},
    
    addNIC: function(ipAddresses, mac, name) {        
        var nic = {};
        nic[ 'name'        ] = name;
        nic[ 'ip_address'  ] = (ipAddresses.length > 0) ? ipAddresses[0].ip_address : null;
        nic[ 'netmask'     ] = (ipAddresses.length > 0) ? ipAddresses[0].netmask : null;
        nic[ 'mac_address' ] = mac ? mac: null;
        nic[ 'ip_addresses'] = ipAddresses;
        nic['discovery_source'] = 'ServiceNow';
        
		var key = nic.name + ":" + nic.ip_address + ":" + nic.netmask + ":" + nic.mac_address;
		if (!this.ciData.nicDeduper[key]) {
			this.nics.addRec(nic);
			this.ciData.nicDeduper[key] = true;
		}
    },
    
	addSerial: function(type, serial) { 	
        // just bail out if we don't have anything here...
        if ((serial == null) || (typeof serial == 'undefined') || gs.nil(serial) || !(new SncSerialNumber().isValid(serial)))
            return;
        
        // if this is the first serial we've seen, record it in the base ci...
        var ci_serial = this.ciData.getData()['serial_number'];
        if ((ci_serial == null) || (typeof ci_serial == 'undefined'))
            this.ciData.getData()['serial_number'] = serial;
        
        // and add it to our serial number list...
        var sr = {};
        sr[ 'serial_number_type' ] = type;
        sr[ 'serial_number' ]      = serial;
        sr[ 'valid' ]              = true;
		
		var key = sr.serial_number_type + ":" + sr.serial_number;
		if (!this.ciData.serialDeduper[key]) {
			this.serials.addRec(sr);
			this.ciData.serialDeduper[key] = true;
		}
    },
	
	/**
	 * Verify some common conditions for the snmp interfaces
	 */
	_getValidInterfaces: function(snmp) {
		var validInterfaces = {};
		var oid_mib2    = 'iso.org.dod.internet.mgmt.mib-2.';
		var oid_interfaces  = oid_mib2 + 'interfaces';
		var ifs   = snmp.getOIDTable(oid_interfaces, 'ifEntry');
		for (var index in ifs) {
			var if_entry = ifs[index];
	
			// We do not wanna record loopback interface type (http://oid-info.com/get/1.3.6.1.2.1.2.2.1.3)
			if (if_entry['ifType'] == 24 && !JSUtil.toBoolean(gs.getProperty('glide.discovery.allow_loopback_adapters', false)))
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
			validInterfaces[index] = {};
			validInterfaces[index].name = if_entry['ifDescr'];
			validInterfaces[index].index = if_entry['ifIndex'];
			validInterfaces[index].mac = mac; 
		}
		return validInterfaces; 
		
	},
	

	
    type: 'SnmpIdentityInfoParser'
};
