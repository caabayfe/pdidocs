new DiscoverySensor({
    process: function(result) {
		// payload is somehow empty here, so payload_xml used
        this.parseOutput(payload_xml);
    },

    parseOutput: function(payload_xml) {
		var xmldoc = new XMLDocument(payload_xml);
		var iDRAC7 = !gs.nil(xmldoc.getNode("//dell/server3/outOfBandGroup")); // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.5']"
		
		if (iDRAC7) {
			                               // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.5.1.1.5']"
			var racVersion          = xmldoc.getNodeText("//dell/server3/outOfBandGroup/informationGroup/racInfoGroup/racVersion");
			                               // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.5.1.1.6']"
			var racURL              = xmldoc.getNodeText("//dell/server3/outOfBandGroup/informationGroup/racInfoGroup/racURL");
			                               // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.5.1.1.7']"
			var racType             = xmldoc.getNodeText("//dell/server3/outOfBandGroup/informationGroup/racInfoGroup/racType");
			                               // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.5.1.1.8']"
			var racFirmwareVersion  = xmldoc.getNodeText("//dell/server3/outOfBandGroup/informationGroup/racInfoGroup/racFirmwareVersion");
			                               // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.5.1.3.2']"
			var systemServiceTag    = xmldoc.getNodeText("//dell/server3/outOfBandGroup/informationGroup/systemInfoGroup/systemServiceTag");

			current.product_version = racVersion; // null means no update of field
			current.url = racURL;
			current.type = racType != null? this.RACTYPE[racType] : null;
			current.firmware_version = racFirmwareVersion;
			current.host = systemServiceTag != null? this._tagToSysId(systemServiceTag) : null;
			
		} else {
			                               // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.2.1.1.5']");
	        var drsProductVersion   = xmldoc.getNodeText("//dell/server3/drsOutofBandGroup/drsInformationGroup/drsProductInfoGroup/drsProductVersion");
			                               // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.2.1.1.7']");
	        var drsProductURL       = xmldoc.getNodeText("//dell/server3/drsOutofBandGroup/drsInformationGroup/drsProductInfoGroup/drsProductURL");
			                               // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.2.1.1.14']");
			var drsProductType      = xmldoc.getNodeText("//dell/server3/drsOutofBandGroup/drsInformationGroup/drsProductInfoGroup/drsProductType");
			                               // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.2.1.2.1']");
	        var drsFirmwareVersion  = xmldoc.getNodeText("//dell/server3/drsOutofBandGroup/drsInformationGroup/drsFirmwareGroup/drsFirmwareVersion");
			                               // OID xpath: "//*[@oid='1.3.6.1.4.1.674.10892.2.1.1.11']");
	        var drsSystemServiceTag = xmldoc.getNodeText("//dell/server3/drsOutofBandGroup/drsInformationGroup/drsProductInfoGroup/drsSystemServiceTag");
			
			current.product_version = drsProductVersion;
			current.url = drsProductURL;
			current.type = drsProductType != null? this.RACTYPE[drsProductType] : null;
			current.firmware_version = drsFirmwareVersion;
			current.host = drsSystemServiceTag != null? this._tagToSysId(drsSystemServiceTag) : null;
		}
    },
	
	_tagToSysId: function (systemServiceTag) {
		var gr = new GlideRecord('cmdb_serial_number');
		gr.addQuery('serial_number', systemServiceTag);
		gr.addQuery('absent', false);
		gr.addQuery('valid', true);
		gr.query();

		var sysId='';
		while (gr.next()) {
			var cigr = new GlideRecord('cmdb_ci_computer');
			// CI must be cmdb_ci_computer
			if (!gs.nil(gr.cmdb_ci) && cigr.get('sys_id', gr.cmdb_ci)) {
				if (!gs.nil(sysId) && sysId != gr.cmdb_ci) {
					DiscoveryLogger.warn('Duplicate computers found with Serial Number ' + systemServiceTag, this.type, this.getEccQueueId());
            	    return '';
	    	    }
    		    sysId = gr.cmdb_ci.toString();
    		}
        }
        if (gs.nil(sysId)) {
    		DiscoveryLogger.warn('Computer with Serial Number ' + systemServiceTag + ' not discovered yet', this.type, this.getEccQueueId());
			return '';
        } else {
	    	return sysId;
        }
    },
	
	// 1~9   see http://www.observium.org/svn/observer/trunk/mibs/DELL-RAC-MIB
	// 10~11 see http://commweb-ps3.us.dell.com/support-forums/servers/f/177/t/19566934
	// 16~17 see http://www.oidview.com/mibs/674/IDRAC-MIB.html
	RACTYPE: [,'other','unknown','DracIII','ERA','DRAC4','DRAC5','DRAC5MC','CMC','iDRAC','iDRAC6Monolithic','iDRAC6Modular',,,,,'iDRAC7Monolithic','iDRAC7Modular'],
	
    type: "DRACSensor"
});
