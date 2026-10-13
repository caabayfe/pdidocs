new DiscoverySensor({
	process: function (probeResult) {

		// PRB1353490: We occasionally can't get the CI when the system is under heavy load.  We
		// can't do anything in this case, so just warn and exit.
		var cmdbCI = this.getCmdbCi();
		if (!cmdbCI || (typeof cmdbCI == 'string' && cmdbCI.toLowerCase() == 'null')) {
			DiscoveryLogger.error('Unable to find server for neighbor matching', sensorName, g_probe.getEccQueueId());
			return;
		}

		var cdpRoot = 'iso.org.dod.internet.private.enterprises.cisco.ciscoMgmt.ciscoCdpMIB.ciscoCdpMIBObjects.';
		var lldpRoot = 'iso.std.iso8802.ieee802dot1.ieee802dot1mibs.lldpMIB.lldpObjects.';
		var oid_dot1dBasePortTable = 'iso.org.dod.internet.mgmt.mib-2.dot1dBridge.dot1dBase';
		
		var snmp = new SNMPResponse(probeResult);
		// this is the id of the layer 2 device (for example switch) being
		// classified. The id is stored in the parent table
		// cmdb_ci_netgear.dscy_discovery_proto_id. The value stored may be 
		// a concatenation of cdpID:lldpID. 
		var myCdpId = snmp.getOIDText(cdpRoot + 'cdpGlobal.cdpGlobalDeviceId');
		var myLldpId = snmp.getOIDText(lldpRoot + 'lldpLocalSystemData.lldpLocSysName');
		
		// set a protocol ID for the device, prefer CDP if available
		if (!JSUtil.nil(myCdpId)) {
			var combinedId = [myCdpId, myLldpId].join(':');
			if (current.discovery_proto_id != combinedId) {
				current.discovery_proto_id = combinedId;
				current.discovery_proto_type = 'CDP';
			}
		} else if (!JSUtil.nil(myLldpId)) {
			if (current.discovery_proto_id != myLldpId) {
				current.discovery_proto_id = myLldpId;
				current.discovery_proto_type = 'LLDP';
			}
		} else {
			return;
		}
		
		var cmdbCI = this.getCmdbCi();
		var switchPorts = this.buildSwitchPortCache(cmdbCI);
		var routerInterfaces = this.buildRouterInterfaceCache(cmdbCI);
		
		
		// once we have the interface_number and interface_name associated, we just need to 
		// add the dscy_router_interface.sys_id to the dcyRouterID object member in the list
		var interfaces = this.buildInterfaceCacheByID(cmdbCI, switchPorts, routerInterfaces);
		
		var cdpRemoteData = snmp.getOIDTable(cdpRoot + 'cdpCache', 'cdpCacheEntry');
		var neighborResults = this.processCdpData(myCdpId, cdpRemoteData, interfaces);	
		var lldpRemoteData = snmp.getOIDTable(lldpRoot + 'lldpRemoteSystemsData', 'lldpRemEntry');
		var dot1dBasePortTable = snmp.getOIDTable(oid_dot1dBasePortTable, 'dot1dBasePortEntry');
		var lldpResults = this.processLldpData(myLldpId, lldpRemoteData, dot1dBasePortTable, interfaces);
		
		neighborResults.push.apply(neighborResults, lldpResults);
		
		this.addToRelatedList('discovery_device_neighbors', neighborResults, 'cmdb_ci', 'neighbor_source,origin_interface,neighbor_id');
	},
	

	processCdpData: function (myCdpId, cdpRemoteData, interfaces) {
		// cdpRemoteData is the cdpCache table from an SNMPResponse()
		// use that payload to build up cache of JSON CDP data items
		var cdpData = this.buildCDPCacheByIndex(myCdpId, cdpRemoteData);
		// create the same exact thing but indexed by human readable neighbor name
		var neighborsByCdpId = this.buildCDPCacheByName(cdpData);
		// the cache currently looks like
		//  origin: the dotted index take from cdpCacheEntry attr ie instance=".6.2"
		//	ioLookup: the first int parsed from the instance attr ie 6
        //  neighborAddr: <cdpCacheAddress> converted to IPV4 decimal format, 
		//	neighborId: <cdpCacheDeviceId> assumed to be the dscy_netgear.discovery_proto_id of the neighbor represented a cdpCacheEntry
		//	neighborCISysId: dscy_netgear.sys_id where disco_proto = neighborId
		
				
		// now we have the port number index in the interfaces cache to match the cdp{ioLookup:6}
		// value that would have been extracted from the instance=.6.1 attribute tag from each
		// cdpCacheEntry that was orginally in indexed by neighborid.
		// this will return interfacesByNeighborCdpId[neighborId] = dscy_router_interface.sys_id
		var interfacesByNeighborCdpId = this.connectToExistingNeighbors(myCdpId, neighborsByCdpId, interfaces);
		// the previous function call was with me as the neighbor
		// on a CI that was initialized prior to this CI being identified
		// This next call will be the flip of that, where  I am the origin
		// any new content of the cpdCache table are going to be inserted as my
		// neighbors
		var result = this.connectNeighborsToMe(cdpData, interfaces,interfacesByNeighborCdpId);
		
		return (result);
	},
	
	 /********************************	
	  connectNeighborsToMe:
		- myCdpId: the global cdp id of the current payload, used to see if the myCdpId is
			 a neighbor of anyone in the discovery_device_neighbors table. 
		- interfaces[port_number]={number:interface_number,name:interface_name,dcyRouterID:'' }	
		- neighborsByCdpId[neighborid] =
			{origin: instance=.6.2,ioLookup:parsed,neighborAddr:ipAddress,neighborId:cdpCacheDeviceId }
			
		Use the ioLookup taken from cdpData to find interface object and get router_interface.sys_id
		-- interfaces[neighborsByCdpId[neighborid].ioLookup]
  
	  NOTE: The following glide query against discovery_device_neighbors will
      get any cdp record where the globalcdpid of the payload is a neighbor
		   
			cmdb_ci   -- the switch or router that is my neighbor
			origin_interface  -   the dscy_router_interface of my neighbor
			neighbor_address -    this is my address, as I am this record's neighbor
			neighbor_interface  - this is my dscy_router_interface as I am 
								  this record's neighbor
			neighbor_id    -----> my cdpId, the current or origin of this payload
			neighbor_source
			
			
	it returns a cache of neighbors to origin_interface
    ****************************/
	connectNeighborsToMe: function (cdpData, interfaces, interfacesByNeighborCdpId) {
		var result = [];
		for (i = 0; i < cdpData.length; i++) {
			var cdp = cdpData[i];
			
			if (!interfaces.hasOwnProperty(cdp.originInterfaceKey))
				continue;
			
			// the previous function call was with me as the neighbor
			// on a CI that was initialized prior to this CI being identified
			// This next data structure is the flip of that, where  I am the origin
			// and the content of the cpdCache table are going to be inserted as my
			// neighbors
			var record = {
				origin_interface: interfaces[cdp.originInterfaceKey].dcyRouterID,
				neighbor_address: cdp.neighborAddr,
				neighbor_id: cdp.neighborId,
				neighbor_interface: interfacesByNeighborCdpId[cdp.neighborId],
				neighbor_source: 'CDP'
			};
	
			result.push(record);
		}
		
		return (result);
	},
	
    /********************************	
	  connectToExistingNeighbors:
		- myCdpId: the global cdp id of the current payload, used to see if the myCdpId is
			 a neighbor of anyone in the discovery_device_neighbors table. 
		- interfaces[port_number]={number:interface_number,name:interface_name,dcyRouterID:'' }	
		- neighborsByCdpId[neighborid] =
			{origin: instance=.6.2,ioLookup:parsed,neighborAddr:ipAddress,neighborId:cdpCacheDeviceId }
		
		Use the ioLookup taken from cdpData to find interface object and get router_interface.sys_id
		-- interfaces[neighborsByCdpId[neighborid].ioLookup]
  
	  NOTE: The following glide query against discovery_device_neighbors will
      get any cdp record where the globalcdpid of the payload is a neighbor
		   
			cmdb_ci   -- the switch or router that is my neighbor
			origin_interface  -   the dscy_router_interface of my neighbor
			neighbor_address -    this is my address, as I am this record's neighbor
			neighbor_interface  - this is my dscy_router_interface as I am 
								  this record's neighbor
			neighbor_id    -----> myCdpId, the current or origin of this payload
			neighbor_source
			
			
	it returns a cache of neighbors to origin_interface
    ****************************/
	connectToExistingNeighbors: function (myCdpId, neighborsByCdpId, interfaces) {
		
		var gr = new GlideRecord('discovery_device_neighbors');
		gr.addQuery('neighbor_id', myCdpId); // find where myCdpId is the neighbor
		gr.addQuery('neighbor_source', 'CDP');
		gr.addQuery('status', 'Installed');
		gr.query();
		
		// cache indexed by a dotwalk into the cmdb_ci.discovery_proto_id which will
		// return the cdpData of the neighbor. The cache stores the origin_interface, which is 
		// an interface belonging to the neighbor 
		// (not an interface of the currently global myCdpId)
		var interfacesByNeighborCdpId = {};		
		while (gr.next()) {
    		
			if (gr.cmdb_ci.discovery_proto_type != 'CDP')
				continue;
			
			var neighborId = gr.cmdb_ci.discovery_proto_id + '';
			if (neighborId.indexOf(':') >= 0)
				neighborId = neighborId.split(/:/)[0];

			if (JSUtil.nil(neighborId))
				continue;
			
			if (!interfacesByNeighborCdpId.hasOwnProperty(neighborId)) {
				// the router of the origin_interface of this record, which is my
				// neighbor - FDT:Question there can never be more than one interface per cmdb.disco_proto_id
				interfacesByNeighborCdpId[neighborId] = gr.origin_interface.sys_id + '';
			}
			
			// the neighbor_interface, is pointing to my one of myCdpId interfaces, making             
			// myCdpId the neighbor to this record, 
			// if it is empty, we need to find the appropriate interface and make the 
			if (JSUtil.nil(gr.neighbor_interface)) {
				// hole found -- that's me
			
				if (neighborsByCdpId.hasOwnProperty(neighborId)) {
					// get the origin lookup key that is derived from instance=".6.2"
					// of each cdpCacheEntry. In this case the key will be 6
					var ifLookup = neighborsByCdpId[neighborId].originInterfaceKey;
					// is that value to find the sys_id of the corresponding 
					// dscy_router_interface
					var ifKey = interfaces[ifLookup].name;

					// now that we can map from the switchPort.interface_id to the 
					// cache entry, update the record, adding my interface as their neighbor
					gr.neighbor_interface = interfaces[ifLookup].dcyRouterID;
					gr.update();
				}
			}
		}
		
		return interfacesByNeighborCdpId;
	},
	
	
	/********************************	
	  buildInterfaceCacheByIndexName:
	   - cmdbCI: the sys_id of the cmdb item that is the origin of this payload
	   - an array of switchPort data objects
	   {number:interface_number,name:interface_name,dcyRouterID:'' }
	   
	   using the cmdbi.sys_id provided map the ci to fill in the dcyRouterID and then
	   return the cache indexed by the port id which is the value we have available to us
	   in the cpdCacheEntry via the instance=".6.1" attribute of each entry. The first number
	   is the port index, in this example 6. 
	   this function will set  dcyRouterID = dscy_router_interface.sys_id
	   and return an indexed cache
	******************************/   
	buildInterfaceCacheByID: function(cmdbCI, switchPorts, routerInterfaces) {

		var tempCache = {};
		for (var i=0; i<switchPorts.length; i++) {
			if (!tempCache.hasOwnProperty(switchPorts[i].name))
				tempCache[switchPorts[i].name] = switchPorts[i];
		}
		// now that we can lookup easily by a corresponding value in
		// dscy_router_interface (name), get the interface list for 
		// this CI
        var gr = new GlideRecord('dscy_router_interface');
		gr.addQuery('cmdb_ci', cmdbCI);
		gr.query();
		
		while (gr.next()) {
			if (!tempCache.hasOwnProperty(gr.name))
				continue;
			
			tempCache[gr.name].dcyRouterID = gr.sys_id + '';

		}
		// back out in the analysis, we do not have a name, we have the port id, so we have 
		// to reindex one more time to make the cache useful when returned
		var interfaces = {};
		for (i=0;i<switchPorts.length;i++) {
			interfaces[switchPorts[i].number]=switchPorts[i];
		}
		
		for (i=0;i<routerInterfaces.length;i++) {
			interfaces[routerInterfaces[i].number]=routerInterfaces[i];
		}
		
		return interfaces;
	},
	
	/********************************************************************
	  buildCDPCacheByIndex:
	   - cdpRemoteData: the section of the payload that contains the cdpCacheEntry elements 

	  NOTE:
	  
	  Given the a cdpCache with entries in the following format
	  
	 <cdpCacheEntry instance=".6.2">
        <cdpCacheAddress type="SnmpOctetString">0a c4 21 fc</cdpCacheAddress>
        <cdpCacheDevicePort type="SnmpOctetString">mgmt0</cdpCacheDevicePort>
        <cdpCacheDeviceId type="SnmpOctetString">ssw-002(AMS18100105)</cdpCacheDeviceId>
    </cdpCacheEntry>
	
	returns an array of JSON objects with those elements mapped as follows:
			origin: instance=".6.2"
			ioLookup: the 6 from the origin from above
            neighborAddr: <cdpCacheAddress> converted to IPV4 decimal format, 
			neighborId: <cdpCacheDeviceId>
			neighborCISysId: filled in later, the CI.sys_id of neighborId
	
	********************************************************************/
	buildCDPCacheByIndex: function (myCdpId, cdpRemoteData) {
		
		var cdpData = [];
		for (var inst in cdpRemoteData) {
			if (!cdpRemoteData.hasOwnProperty(inst))
				continue;
		   
			var cdp = cdpRemoteData[inst];
			var neighborId = cdp.cdpCacheDeviceId;
			if (neighborId == myCdpId)
				continue;
			
			var neighborAddr = cdp.cdpCacheAddress;
			if (!neighborAddr)
				continue;
					
			var hexIP = neighborAddr.split(' ').join('');
			if (!SncIPAddressV4.validate(hexIP))
			    continue;
			    
		    neighborAddr = new SncIPAddressV4(hexIP);
			
			// get the lookup for finding the name in the dscy_switchport table
			var ioIndexArray = inst.split(".");
			if (!ioIndexArray[0])
				continue;
			
			var ioLookUp = ioIndexArray[0];
			var origin = inst; 
			
			cdpData.push({origin: origin, 
						  neighborAddr: neighborAddr, 
						  neighborId: neighborId, 
						  originInterfaceKey:ioLookUp,
						  // for later lookups
						  neighborCISysId: ''});
		}
		
		return cdpData;
	},
	
	/********************************************************************
	  buildCDPCacheByName:
	   - cdpData: the cache built from the cdpCacheEntry, indexed by neighbor IDs
	
	returns the exact same array of CDP JSON objects, but indexed by the human readable neighborID:
			origin: instance=".6.2"
			ioLookup: the 6 from the origin from above
            neighborAddr: <cdpCacheAddress> converted to IPV4 decimal format, 
			neighborId: <cdpCacheDeviceId>
	
	********************************************************************/
	buildCDPCacheByName: function(cdpData) {
	// index neighbor data by neighbor cdp id
		var neighborsByCdpId = {};
		for (var i = 0; i < cdpData.length; i++) {
			var cdp = cdpData[i];
	
			if (neighborsByCdpId.hasOwnProperty(cdp.neighborId))
				continue;
	
			neighborsByCdpId[cdp.neighborId] = cdp;
		}	
		
		return neighborsByCdpId;
	},
	
	/********************************************************************
	   buildSwitchPortCache:
	   - cmdbCI: the cmdb_ci.sys_id of the record being mapped
	   
	   NOTE: switchPortIndexes is an array built from the payload as follows:
	   
	   In the example below, that would be the 6 and the 51 of the instance=".6.2" and 
	   instance=".51.1" value from the cdp cache in the current payload.
	   
	   <cdpCacheEntry instance=".6.2">...</cdpCacheEntry>
	   <cdpCacheEntry instance=".51.1">...</cdpCacheEntry>
	   
	   build lookup in the cache switchPortsByInterfaceNumber:
	   
	   switchPortsByInterfaceNumber[6]=dscy_switchport.interface_name
	   switchPortsByInterfaceNumber[51]=dscy_switchport.interface_name 
	   
	   These switchPortIntIndexes will be used to map this record as a neighbor to their corresponding entries in the neighbor table.
       returns an array of  {number:interface_number,name:interface_name,dcyRouterID:'' }
	   dcyRouterID is blank at this point, it will be filled in next call, but just to keep
	   the object structure clear throughout, it is set to empty here
	********************************************************************/
	buildSwitchPortCache: function(myCmdbCi) {
		var switchPorts = [];		
		var iGr = new GlideRecord('dscy_switchport');
		iGr.addQuery('cmdb_ci', myCmdbCi);
		iGr.query();

		while (iGr.next()) {
			var interfaceLookup = {};
			interfaceLookup.name = iGr.interface_name + '';
			interfaceLookup.number = iGr.interface_number + '';
			interfaceLookup.dcyRouterID = ''; // filled in later
			switchPorts.push(interfaceLookup);
		}

		return switchPorts;	
	},
	
	buildRouterInterfaceCache: function(myCmdbCi) {
		var routerInterfaces = [];		
		var iGr = new GlideRecord('dscy_router_interface');
		iGr.addQuery('cmdb_ci', myCmdbCi);
		iGr.query();	
	
		while (iGr.next()) {
			var interfaceLookup = {};
			interfaceLookup.name = iGr.name + '';
			interfaceLookup.number = iGr.number + '';
			interfaceLookup.dcyRouterID = iGr.getUniqueValue() + '';
			routerInterfaces.push(interfaceLookup);
		}

		return routerInterfaces;	
	},

	findLocalReflectedInterface: function (neighborsByLldpId, neighborId, neighborGr) {
		var doesEntryBelongToNeighborProvided = false;
		var didFindPortMatch = false;

		for (var inst in neighborsByLldpId) {
			doesEntryBelongToNeighborProvided = (inst == neighborId);
			/* 
			 * Try to match the remote port info to neighbor's interface first and if there is no match
			 * use the old logic [last condition in OR statement]
			 */
			didFindPortMatch = (neighborsByLldpId[inst].lldpRemPortId == neighborGr.origin_interface.name + '') ||
				(neighborsByLldpId[inst].lldpRemPortId == neighborGr.origin_interface.number + '') ||
				(neighborsByLldpId[inst].portNumber == neighborGr.origin_interface.number + '');

			if (doesEntryBelongToNeighborProvided && didFindPortMatch)
				return neighborsByLldpId[inst];
		}
		
		return null;
	},

	getIfIndexByPortNumber: function (dot1dBasePortTable, portNumber) {
		return dot1dBasePortTable[portNumber].dot1dBasePortIfIndex;
	},
	
	processLldpData: function (myLldpId, lldpRemoteData, dot1dBasePortTable, interfaces) {
		
		var neighborsByLldpId = {};
		var inst;
		for (inst in lldpRemoteData) {
			
			if (!lldpRemoteData.hasOwnProperty(inst))
				continue;
			
			var neighbor = lldpRemoteData[inst];
			if (JSUtil.nil(neighbor.lldpRemSysName) || neighborsByLldpId.hasOwnProperty('lldpRemPortId'))
				continue;
			
			// Cisco and Juniper format their instance numbers differently
			// this is the key that maps back to the IF-MIB entry which 
			// will ultimately get us the interface name
			var instParts = inst.split('.');
			if (instParts.length > 1) {
				neighbor.portNumber = instParts[1]; // JunOS
			} else {
				neighbor.portNumber = instParts[0]; // Cisco
			}
			neighborsByLldpId[neighbor.lldpRemSysName] = neighbor;
		}

		// get neighbor reflections and fill in any holes, ensuring eventual consistency
		var gr = new GlideRecord('discovery_device_neighbors');
		gr.addQuery('neighbor_id', myLldpId);
		gr.addQuery('neighbor_source', 'LLDP');
		gr.addQuery('status', 'Installed');
		gr.query();

		var reflectionsByNeighborLldpId = {};

		while (gr.next()) {
			var neighborId = gr.cmdb_ci.discovery_proto_id;
			if (neighborId.indexOf(':') >= 0)
				neighborId = neighborId.split(/:/)[1];
			
			if (JSUtil.nil(neighborId)) {
				continue;
			}

			var localReflectedInterface = this.findLocalReflectedInterface(neighborsByLldpId, neighborId, gr);
			if (localReflectedInterface && !reflectionsByNeighborLldpId.hasOwnProperty(localReflectedInterface.lldpRemSysName))
				reflectionsByNeighborLldpId[localReflectedInterface.lldpRemSysName] = gr.origin_interface.sys_id + '';

			if (JSUtil.nil(gr.neighbor_interface)) {
				// hole found -- that's me
				if (JSUtil.nil(neighborId))
					continue; // cannot resolve interface
				
				if (localReflectedInterface) {
					var localPortNumber = localReflectedInterface.portNumber;
					gr.neighbor_interface = interfaces[localPortNumber].dcyRouterID || 
											interfaces[this.getIfIndexByPortNumber(dot1dBasePortTable, localPortNumber)].dcyRouterID;
					gr.update();
				}
			}
		}
		
		var result = [];
		for (inst in neighborsByLldpId) {
			if (!neighborsByLldpId.hasOwnProperty(inst))
				continue; // can't resolve local iface index to a sys_id
			
			var neighbor = neighborsByLldpId[inst];
			if (!interfaces.hasOwnProperty(neighbor.portNumber) && 
				!interfaces.hasOwnProperty(this.getIfIndexByPortNumber(dot1dBasePortTable, neighbor.portNumber))) 
				continue; // can't resolve local iface index to a sys_id

			var originInterface = interfaces[neighbor.portNumber].dcyRouterID ||
									interfaces[this.getIfIndexByPortNumber(dot1dBasePortTable, neighbor.portNumber)].dcyRouterID,
				neighborInterface = reflectionsByNeighborLldpId[neighbor.lldpRemSysName];

			// Verify record before pushing it into the end result
			if (JSUtil.nil(originInterface) && JSUtil.nil(neighbor.lldpRemSysName) && JSUtil.nil(neighborInterface))
				continue;

			var record = {
				origin_interface: originInterface,
				neighbor_id: neighbor.lldpRemSysName,
				neighbor_interface: neighborInterface,
				neighbor_source: 'LLDP'
			};

			result.push(record);
		}
		
		return(result);
	},

	
   cacheToString: function(cache) {
	   var msg = '{';
	   for (var key in cache) {
		  if (cache.hasOwnProperty(key)) {
			 if (msg.indexOf('{') != msg.length-1)
				 msg+=',';
				 if (cache[key].constructor.name == 'Object')
					 msg += '[' + key +'] = ' + toString(cache[key]);
                 else  
					 msg += key + ':' + cache[key];
          }
	   }
	   msg += '}';
       return msg;
	},
	
   cacheToStringIterator: function(cache) {
	   var msg = '';
	   for (var i=0; i<cache.length; i++) {
		   msg += ' [' + i + '] = ';
		   msg += this.cacheToString(cache[i]);
	   }
	   
	   return msg;
   },	

});
