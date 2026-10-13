new DiscoverySensor({
    process: function(result) {
		
        this.ciData = new CIData();
        this.ciData.fromXML(this.getParameter('cidata'));
        this.ci_data = this.ciData.getData();
        
		var snmp = new SNMPResponse(result);
        var capabilities = {};
        if (g_device) {
           var status = new DiscoveryStatus('' + g_device.getStatus());
           capabilities['discover'] = status.discover;
        }
        var props = {};
        this.analyze(snmp, capabilities, props);

        // run the classifier...
		if (this.runClassifier(capabilities, props))
            return;

        // ..., but if it fails for some reason, do the right thing...
        if (g_device)
            g_device.changeDeviceState("rejected");

        this.fireAdditionalClassifier();
    },
    
    runClassifier: function(capabilities, props) {
        // find the classification type we're supposed to use...
        var ppgr = new GlideRecord('discovery_port_probe');
        ppgr.addActiveQuery();
        ppgr.addQuery('name', 'snmp');
        ppgr.query();
        if (!ppgr.next())
            return false;
        
        var classifierType = '' + ppgr.getValue('classy');
        if (gs.nil(classifierType))
            return false;
        
        var classer = this.getClassifier(classifierType, capabilities, props);
        
        if (!classer.find())
            return false;
        
        var classifier = classer.getClassificationRecord();
        if (this.classifierIsDisabled(classifier)) {
        	this.handleDisabledClassifier(classifier, 'SNMP Classify');
        	return;
        }
        
        // set our make and model, if we should...
        this.ci_data['sys_class_name'] = classer.getClassificationTable();
        if (g_device)
            g_device.setClassifiedAs(classer.getClassificationTable());

        // run classify script box and set the CI data if applicable
        this.runClassificationScript(classer, this.ci_data);

        // set maker and model
        var maker = classer.getManufacturer();
        if (gs.nil(maker))
            maker = props['maker'];
        var model = classer.getModel();
        if (gs.nil(model))
            model = props['model'];
        var mam = MakeAndModelJS.fromNames(maker, model, 'hardware');
        this.ci_data['manufacturer'] = mam.getManufacturerSysID();
        this.ci_data['model_id'] = mam.getModelNameSysID();

        this._handleHostname(props['name']);
            
        var hm = new Packages.java.util.HashMap();
        hm.put( 'port',             this.getParameter('port')                              );
        hm.put( 'port_probe',       this.getParameter('port_probe')                        );
        hm.put( 'cidata',           this.ciData.toXML()                                    );
        hm.put( 'triggered_probes', '' + classer.getTriggeredProbesAsString('exploration') );
		hm.put( 'classifiers',      this.getParameter('classifiers')                       );
		hm.put( 'is_supplementary', this.getParameter('is_supplementary')                  );
		hm.put( 'mid_selector_details', this.getParameter('mid_selector_details')          );
		
		if(JSUtil.notNil(this.vlanInstanceList))
			hm.put( 'vlanInstanceList', this.vlanInstanceList.join(','));
		
        var identification = '' + classer.getTriggeredProbesAsString('identification');
		if(JSUtil.nil(identification)) {
			if (g_device)
				DiscoveryErrorsUtilities.addError('SN-1584', 'No Identification phase defined for SNMP');
		}
		classer.triggerProbes(this.getEccQueueId(), hm, 'identification');
        
        // change device history state, if we have one...
        if (g_device) {
            var status = new DiscoveryStatus(g_device.getStatus());
            g_device.state('Classified', 'Identifying', status.logStateChanges, 'SNMP Classify', this.getEccQueueId());
        }		
        
        return true;
    },
    
    getClassifier: function(classifierType, capabilities, props) {
        this.addCIDataBaseValue(capabilities);
        var classer = new SncDiscoverySNMPClassification(this.getEccQueueRecord());
		
		var fValues = {};
        for (i in capabilities)
			fValues[i] = capabilities[i];
		for (i in props)
			fValues[i] = props[i];			
		
        classer.setValues(this.toHashMap(fValues));
        classer.setSystemOID(props['sysoid']);
        classer.setType(classifierType);

        return classer;
    },
    
    analyze: function(snmp, capabilities, props) {
        var vlanIfMap = this.makeMapFromList('135,136,209,53');
        var switchIntMap = this.makeMapFromList(gs.getProperty('glide.discovery.switch_interface_types', '1,6,7,8,9,24,26,53,62,69,71,78,115,117,209'));
        var oid_mib2 = 'iso.org.dod.internet.mgmt.mib-2.';
        var oid_apc = 'iso.org.dod.internet.private.enterprises.apc.';
        var oid_novell = 'iso.org.dod.internet.private.enterprises.novell.';
		var oid_cisco = 'iso.org.dod.internet.private.enterprises.cisco.';
        var oid_hrSystem    = oid_mib2 + 'host.hrSystem.';
        var oid_dot1dBridge = oid_mib2 + 'dot1dBridge.';
        var oid_interfaces  = oid_mib2 + 'interfaces';
        var oid_ip          = oid_mib2 + 'ip';
        var oid_ups         = oid_mib2 + 'upsMIB.';
        var oid_system      = oid_mib2 + 'system.';
        var oid_entity      = oid_mib2 + 'entityMIB.';
		var oid_bgp         = oid_mib2 + 'bgp.';
        var oid_cisco_vlans = oid_cisco + 'ciscoMgmt.ciscoVtpMIB.vtpMIBObjects.vlanInfo';
		var oid_dot1q_vlans = oid_dot1dBridge + 'qBridgeMIB.qBridgeMIBObjects.dot1qVlan';
		var oid_cisco_hsrp = oid_cisco + 'ciscoMgmt.ciscoHsrpMIB.ciscoHsrpMIBObjects.cHsrpGroup';

        // if we didn't get any results, bail out...
        var test = snmp.getOIDObj('iso');
        if (test == null)
            return;

		// if current IP is an HSRP VIP, bail out...
		var ciscoHsrpTable = snmp.getOIDTable(oid_cisco_hsrp, 'cHsrpGrpEntry'),
			ip = this.ci_data['ip_address'],
			isNetworkDiscovery = (g_disco_functions.getDiscoveryType(this.getParameter('agent_correlator')) == 'Nets'),
			ipAddrTable = snmp.getOIDTable(oid_ip, 'ipAddrEntry');
		
		for (var key in ipAddrTable) {
			var entryIp = ipAddrTable[key].ipAdEntAddr + '',
				netmask = ipAddrTable[key].ipAdEntNetMask + '';

			var netmaskCidr = NetworkDiscoveryUtil.netmaskToCidr(netmask);
			if (netmaskCidr > 30)
				continue;

			if (ip == NetworkDiscoveryUtil.calculateBroadcastAddress(entryIp, netmask) || ip == NetworkDiscoveryUtil.calculateNetworkAddress(entryIp, netmask)) {
				var errorMessage = ip + ' is a broadcast or network address. Aborting discovery';
				DiscoveryLogger.warn(errorMessage, 'Discovery');

				DiscoveryErrorsUtilities.addError('SN-1592', errorMessage);

				this.processDupIpRecords();
				return;
			}           
        }

		if (!isNetworkDiscovery) {
			for (var key in ciscoHsrpTable) {
				if (ciscoHsrpTable[key].cHsrpGrpVirtualIpAddr == ip) {
					var errorMessage = ip + ' is an HSRP VIP. Aborting discovery';
					DiscoveryLogger.warn(errorMessage);

					DiscoveryErrorsUtilities.addError('SN-1591', errorMessage);

					this.processDupIpRecords();
					return;
				}
			}
		}

        // is this thing a host?
        var upTime   = snmp.getOIDText( oid_hrSystem + 'hrSystemUptime'       );
        var procs    = snmp.getOIDText( oid_hrSystem + 'hrSystemProcesses'    );
        var maxProcs = snmp.getOIDText( oid_hrSystem + 'hrSystemMaxProcesses' );
        var isHost = (upTime != null) && (procs > 0) && ((maxProcs > procs) || (maxProcs == 0));
        capabilities['hosting'] = '' + isHost;
        
        // is this thing a printer?
        var isPrinter = false;
        var isHrDevicePrinter = false;
        var hasPrtGeneralSerialNumber = false;
        // first look in the Host Resources MIB...
        var devices = snmp.getOIDTable(oid_mib2 + 'host.hrDevice', 'hrDeviceEntry');
		var hrDeviceDescrs = [];  //used in short_description
        for (var index in devices) {
            var deviceType = devices[index]['hrDeviceType'];
            isHrDevicePrinter = isHrDevicePrinter || (deviceType.substr(-2) == '.5'); //1.3.6.1.2.1.25.3.1.5 is 'hrDevicePrinter'
			
			if ('hrDeviceDescr' in devices[index]) {
				var hrDeviceDescr = devices[index]['hrDeviceDescr'];
				if (hrDeviceDescrs.indexOf(hrDeviceDescr) > -1)
					continue;
				
				hrDeviceDescrs.push(hrDeviceDescr);
			}
        }
        // then look in the Printer MIB...
        var prtGens = snmp.getOIDTable(oid_mib2 + 'printmib.prtGeneral', 'prtGeneralEntry');
        for (var index in prtGens) {
            var prtSerial = prtGens[index]['prtGeneralSerialNumber'];
            hasPrtGeneralSerialNumber = hasPrtGeneralSerialNumber || JSUtil.notNil(prtSerial);
        }
        // if both conditions are true we assume the device has printing capability
        isPrinter = isHrDevicePrinter && hasPrtGeneralSerialNumber;
        capabilities['printing'] = '' + isPrinter;
        
        // is this thing a switch?
        var ports = snmp.getOIDInt( oid_dot1dBridge + 'dot1dBase.dot1dBaseNumPorts' );
        var isSwitch = ports > 0;
		
	var vlanTable;

	// In case cisco_switch_community_string_indexing property is true, try to get info from Cisco's OIDs
	if (gs.getProperty("glide.discovery.cisco_switch_community_string_indexing") == "true")
		vlanTable = snmp.getOIDTable(oid_cisco_vlans, 'vtpVlanEntry');
	// If we have information form Cisco's OID, keep it, otherwise try to find it using a generic MIB
	vlanTable = vlanTable || snmp.getOIDTable(oid_dot1q_vlans, 'dot1qVlanCurrentEntry');

	/*
	 * Previously we checked if the type of the VLAN form Cisco OID was 'Ethernet' in order to add it to VLAN list.
	 * Since VLAN is L2, there is no valid reason to check for a specific type, just to verify we have at least 1 VLAN,
	 * so it will make sense to trigger VLAN based probes.
	 * There is a chance that we will have only default VLAN, but theoretically a switch can operate even with default VLAN only
	 */
	var rex = /.*\.([0-9]+)$/;
	this.vlanInstanceList = [];

	for(var inst in vlanTable) {
		var match = rex.exec(inst);

		if(match && match[1])
			this.vlanInstanceList.push(match[1]);
	}

	if (this.vlanInstanceList.length > 0)
		isSwitch = true;
		
        capabilities['switching'] = '' + isSwitch;
        capabilities['block_switch_exploration'] = 'false';
        
        // if it's a switch, does it do VLANs?
        var vlans = 0;
        if (isSwitch) {
            var interfaces = snmp.getOIDTable(oid_interfaces, 'ifEntry');
            for (var index in interfaces) {
                if (this.isInMap(vlanIfMap, interfaces[index]['ifType']))
                    vlans++;
            }
        }
        capabilities['vlans'] = '' + (vlans > 1);
        
        // is this thing a router?
        var forwarder = snmp.getOIDInt( oid_ip + '.ipForwarding'    );
        var forwarded = snmp.getOIDInt( oid_ip + '.ipForwDatagrams' );
        var isRouter = (forwarder == 1) && (forwarded > 0);
        if (isRouter)
            isPrinter = false;
        capabilities['routing'] = '' + isRouter;
        capabilities['block_router_exploration'] = 'false';
        
        // if it's a router, can we infer that it's not a layer 3 switch?
        var isHintRouter = true;
        if (isRouter) {
            var interfaces = snmp.getOIDTable(oid_interfaces, 'ifEntry');
            for (var index in interfaces) {
                if (this.isInMap(switchIntMap, interfaces[index]['ifType'])) {
                    isHintRouter = false;
                    break;
                }
            }
        }
        capabilities['hint_router'] = '' + isHintRouter;
        
        // is this thing a UPS?
        var isUPS = snmp.getOIDInt(oid_ups + 'upsObjects.upsOutput.upsOutputNumLines') > 0;
        
        // is this thing an APC UPS?
        var isAPC = snmp.getOIDText(oid_apc + 'products.hardware.ups.upsIdent.upsBasicIdent.upsBasicIdentModel') != null;
        capabilities['powering'] = '' + (isUPS || isAPC);
        capabilities['mfr_apc'] = '' + isAPC;
        
        // is this thing an APC PDU?
        var isAPCPDU = snmp.getOIDText(oid_apc + 'products.hardware.masterswitch.sPDUIdent.sPDUIdentModelNumber') != null;
        capabilities['power_distribution'] = '' + isAPCPDU;
        // this is a work around so this value won't get overwritten when checking an ACP UPS
        if (!isAPC)
            capabilities['mfr_apc'] = '' + isAPCPDU;
    
        // is this thing a Netware server?
        var isNetware = snmp.getOIDText(oid_novell + 'mibDoc.nwServer.nwSystem.nwSysServerName') != null;
        capabilities['netware'] = '' + isNetware;
        
        // catch routers that have never forwarded packets - if it forwards, and it's nothing else, then it's a router...
        if (!(isHost || isPrinter || isAPC || isNetware || isRouter || isSwitch || isUPS) && (forwarder == 1))
            capabilities['routing'] = 'true';
        
        // set can_route to true if capability is true - this makes it available to identity phase - see PRB1276780.
        if (capabilities['routing'] == 'true')
            this.ci_data['can_route'] = true;

		var blockBGP = gs.getProperty('glide.discovery.bgp_router_disable', 'true') == 'true';
		var bgpVersion = snmp.getOIDText(oid_bgp + 'bgpVersion');
		var bgpLocalASN = snmp.getOIDText(oid_bgp + 'bgpLocalAs');
		var bgpID = snmp.getOIDText(oid_bgp + 'bgpIdentifier');
		if (blockBGP && JSUtil.notNil(bgpVersion) && bgpLocalASN != '0' && bgpID != '0.0.0.0')
			capabilities['block_router_exploration'] = 'true';

        // now fish out the other properties we need before we can run classify...
		var sysDescr = snmp.getOIDText(oid_system + 'sysDescr');
		var sysObjectID = snmp.getOIDText(oid_system + 'sysObjectID');
        props[ 'sysdescr'   ] = sysDescr;
        props[ 'sysoid'     ] = sysObjectID;
        props[ 'ip_address' ] = snmp.snmp['@ip'];
        props[ 'maker'      ] = null;
        props[ 'model'      ] = null;
        props[ 'name'       ] = null;
        var physObjs = snmp.getOIDTable(oid_entity + 'entityMIBObjects.entityPhysical', 'entPhysicalEntry');
		var entPhysicalDescrs = [];  //used in short_description
        if (physObjs != null) {
			var maker = null;
			var model = null; 
            for (var pKey in physObjs) {
				// save the first value that is detected
				if (JSUtil.nil(maker) && 'entPhysicalMfgName' in physObjs[pKey])
					maker = physObjs[pKey]['entPhysicalMfgName'];
					
				if (JSUtil.nil(model) && 'entPhysicalModelName' in physObjs[pKey])
					model = physObjs[pKey]['entPhysicalModelName'];
				
				if ('entPhysicalDescr' in physObjs[pKey]) {
					var entPhysicalDescr = physObjs[pKey]['entPhysicalDescr'];
					if (entPhysicalDescr)
						entPhysicalDescrs.push(entPhysicalDescr);
				}
			}
					
			if (JSUtil.notNil(maker))
				props['maker'] = maker;
			
			if (JSUtil.notNil(model))
				props['model'] = model;
        }
        var sysName = snmp.getOIDText(oid_system + 'sysName');
        var hn = new HostnameJS();
		hn.setLogger(this.getLogger());
        
		props['name'] = hn.format(sysName);
		
		// build short_description so it gets written to ci in identity phase (moved from IPDeviceHandler.java)
		var shortDescription = sysDescr;
		for (var index in entPhysicalDescrs)
			shortDescription += '\n' + entPhysicalDescrs[index];
			
		if (sysObjectID) {
			if (sysObjectID.startsWith('.'))
				sysObjectID = sysObjectID.substring(0);
			
			shortDescription += '\nSystem OID: ' + sysObjectID;
		}
		
		for (var index in hrDeviceDescrs)
			shortDescription += '\n' + hrDeviceDescrs[index];

		this.ci_data['short_description'] = shortDescription;
    },

    _handleHostname: function(name) {
        // set our host name, if we should...
        var trusted = JSUtil.toBoolean(gs.getProperty("glide.discovery.hostname.snmp_trusted", "false"));
        var haveNow = JSUtil.notNil(this.ci_data['name']);
        var haveNew = JSUtil.notNil(name);
        if (!haveNew)
            return;

        if (!trusted && haveNow)
            return;

        this.ci_data['name'] = name;
    },
	
    handleError: function(errors) {
		DiscoverySensor.prototype.handleError.call(this, errors, {
			sourceName: 'SNMP Classify',
			lastState: DiscoverySensor.HistoryStates.ACTIVE_COULDNT_CLASSIFY,
			deviceState: DiscoverySensor.DeviceStates.REJECTED,
			fireClassifiers: true
		});	
    },
    
    toHashMap: function(obj) {
        var hashMap = new Packages.java.util.HashMap();
        for (var name in obj)
            hashMap.put(name, obj[name]);

        return hashMap;
    },
    
    makeMapFromList: function(list) {
        var map = {};
        var parts = list.split(',');
        for (var i = 0; i < parts.length; i++)
            map[parts[i]] = true;

        return map;
    },
    
    isInMap: function(map, test) {
        return typeof map[test] != 'undefined';
    },
	
    // Needed for PRB1354616 to handle a special case for Printers where there is 
    // 'No such name' error but enough OIDs to classify properly.
    prepare: function(results) {
		
            for (var i = 0; i < results.length; i++) {
            var result = results[i];
            if (result['@error']) {
                var error = result['@error'];
                if (error.toLowerCase() == 'no such name' && !this.checkEmptyPayload(result)) 
                    delete result['@error']; // error is already logged as a warning
            }		
        }
    },
        
    type: 'DiscoverySensor'
});
