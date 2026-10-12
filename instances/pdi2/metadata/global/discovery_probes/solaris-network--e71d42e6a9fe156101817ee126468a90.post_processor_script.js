new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {   
		
		if (JSUtil.nil(output))
			return;
		
		var idutil = new IDSensorUtil();
		
		related_data.adapters = idutil.getAdapters(output, " zone ", 
            new RegExp("^(\\S+)\\s+((.*\\n\\t.*){0,})", "gm"),
            new RegExp("inet (\\S+)\\s+netmask (\\S+)", "g"), 
            new RegExp("inet6 (\\S+)\\/(\\d+)", "ig"), 
            this.getMacAddress);

		/* Example line:
		 * default              192.168.2.1          UG        1      16935 pcn0
		 *
		 * Match group 1: 192.168.2.1
		 * Match group 2: pcn0
		 */
		related_data.default_gateway = idutil.getAdapterGateways(output, related_data.adapters, new RegExp("^default\\s+(\\S+)\\s+(?:\\S+\\s+){3}(\\S+)\\s*$", "gm"));
	},
	
    getMacAddress : function(output, adapterName, ipAddress) {
		
        var macRegex = new RegExp("^" + adapterName + ".*? ether (\\S+)", "mg");
        var macMatch = macRegex.exec(output);
        if (macMatch)
            return macMatch[1];

	    macRegex = new RegExp("^" + adapterName + "\\s+" + ipAddress + "\\s+.*?(\\S+)$", "mg");
        macMatch = macRegex.exec(output);
        if (macMatch)
            return macMatch[1];

        return "";
    }
		
});
