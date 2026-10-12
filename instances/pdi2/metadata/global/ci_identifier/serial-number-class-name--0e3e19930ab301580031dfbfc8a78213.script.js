function(ciData, log, identifier) { 
    var discoveredSerials = getDiscoveredSerials(ciData);
    var matching = matchingCIs(discoveredSerials, ciData);
    return new CIIdentifierResult(matching, discoveredSerials.length > 0);
    
    function matchingCIs(discoveredSerials, ciData) {
        var matches = [];

        // If there's no discovered serial numbers, skip the lookup
        if (discoveredSerials.length == 0)
            return matches;

        // find matches for any discovered serial number...
        var gr = new GlideRecord(identifier.applies_to);
        gr.addQuery('sys_class_name', ciData.getData().sys_class_name);
        gr.addQuery('serial_number', discoveredSerials);
        gr.query();
        
        while (gr.next()) {
			if (_shouldSkip(discoveredSerials, gr))            
                continue;

            matches.push('' + gr.getUniqueValue());
       }

        return matches;
    }

	/* Typically if we have serial number table available to match against, we should use it by leveraging 
	 * the "serial number table and class name" identifier. However...
	 * If we've only discovered one serial number, we should always match with it. 
	 * If the serial number table identifer doesn't exist or it's been deactivated, we don't want to skip. 
	 * If the CI we've just found by looking at the serial number field doesn't have anything in the serial number table, then we shouldn't skip
	*/	
	function _shouldSkip(discoveredSerials, gr) {
		// We've only got one valid serial to match, don't skip 
		if (discoveredSerials.length == 1)
			return false;
		
		// Get the Serial Number Table & Class Name identifier		
		var idgr = _getSerialNumberTableIdentifier();		
		// if we can't find the serial number table identifier, don't skip!
		if (!idgr)
			return false;
	
		// if it's been deactivated, don't skip!
		if (idgr.active == false)
			return false;
		
		if (hasSerialNumberTable(gr))
			return true;
	
		return false;
	}
	
	function _getSerialNumberTableIdentifier() {
		// Look up by sys_id or name.
		var gr = new GlideRecord("ci_identifier");
		if (gr.get("sys_id", "0e9717c40a0a0b4508e68214b8335cbd"))
			return gr;			
		else if (gr.get("name", "Serial Number Table & Class Name"))
			return gr;
		else
			return null;				
	}
	
    /*
     * Check for skip here because if a CI already has serial numbers populated in the serial number table, we shouldn't even bother
     * with checking the serial number field value anymore.
     */
    function hasSerialNumberTable(cigr) {
        var sgr = new GlideRecord("cmdb_serial_number");
        sgr.addQuery("cmdb_ci", cigr.sys_id);
        sgr.addQuery('absent', 'false');
        sgr.addQuery('valid', 'true');		
		sgr.setLimit(1);
        sgr.query();
        if (sgr.next())
            return true;
        else
            return false;
    }
    
    function getDiscoveredSerials(ciData) {
        var srls = ciData.getRelatedList('cmdb_serial_number', 'cmdb_ci');
        var result = [];
        for (var i = 0; i < srls.length; i++) {
            var srl = srls[i];
            var sn = new SncSerialNumber();
            if (sn.isValid(srl.serial_number))
                result.push(srl.serial_number);
        }
        return result;
    }
}
