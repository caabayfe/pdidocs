/**
 * Implements a sensor for catching the HP printer model ID
 * 
 * Aleck Lin aleck.lin@servicenow.com
 */

new DiscoverySensor({
    process: function(result) {				
		var snmp = new SNMPResponse(result);
		
		var tempDeviceDesciption = null;
		var deviceDesciption = null;
        var oid_mib2 = 'iso.org.dod.internet.mgmt.mib-2.';		
		var devices = snmp.getOIDTable(oid_mib2 + 'host.hrDevice', 'hrDeviceEntry');
        for (var index in devices) {
            var deviceType = devices[index]['hrDeviceType'];
			// Based on the definition OID "1.3.6.1.2.1.25.3.1", if it ends with .5, then it's a printer device and thus it would make sense to 
			// grab device description as its model ID. However, I've noticed that an HP LaserJet 400 color M451dn that does not follow this format
			// at all. In fact, it shows 1.3.6.1.2.1.25.3.1 as the device type, which means it's just some generic device. For this reason, I'm trying
			// to make the logic a bit more complicated. 
			// We'll always take the device description from one that says it's a printer (.5), but if it doesn't exist, then we'll just take the 
			// description from the first entry in the device entry.
			if (deviceType.substr(-2) != '.5') {
				tempDeviceDesciption = (tempDeviceDesciption == null) ? devices[index]['hrDeviceDescr'] : tempDeviceDesciption;
				continue;
			}
			
            deviceDesciption = devices[index]['hrDeviceDescr'];
			break;
        }		
		
		deviceDesciption = (deviceDesciption == null) ? tempDeviceDesciption : deviceDesciption;
		
		// If we have nothing by this point, then we really have no model ID info
		if (deviceDesciption == null) {
			DiscoveryLogger.warn("Unable to find model ID information", 'SNMP - HP Printer Model', this.getEccQueueId());
			return;
		}

		var parentGr = this.getCmdbRecord();
		var manufacturer = parentGr.manufacturer.name + '';
		
		// If possible, strip out the manufacturer name from the device description so that we can get a cleaner model ID		
		deviceDesciption = JSUtil.notNil(manufacturer) ? deviceDesciption.replace(manufacturer, "").trim() : deviceDesciption;

		mm = MakeAndModelJS.fromNames(manufacturer, deviceDesciption, 'hardware');
		
		current.model_id = mm.getModelNameSysID();
    },

    type: 'DiscoverySensor'
});
