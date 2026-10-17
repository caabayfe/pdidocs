/*
 *  Notes: This identifier will go through the table specified in applies_to field of the identifier
 *         and match based on the MAC address field. 
 *
 *  Warning: This could potentially cause reclassification since it does not check for the CI class (sys_class_name).
 */

function(ciData, log, identifier) { 
    var macs = getDiscoveredMACs(ciData);
    var matching = matchingCIs(macs, ciData);
    return new CIIdentifierResult(matching, macs.length > 0);
    
    function matchingCIs(macs, ciData) {
        var matches = [];
        if (macs.length == 0)
            return matches;

        // find matches for the discovered MAC address...
        var gr = new GlideRecord(identifier.applies_to);
        gr.addQuery('mac_address', macs);
        gr.query();
        
        // populate our return value...
        while (gr.next())
            matches.push('' + gr.getUniqueValue());

        return matches;
    }
    
    function getDiscoveredMACs(ciData) {
        var adapters = ciData.getRelatedList("cmdb_ci_network_adapter", "cmdb_ci");
        var result = [];
        for(var i = 0; i < adapters.length; i++) {
            if (SncMACAddress.getMACAddressInstance(adapters[i].mac_address) == null)
                continue;

            result.push(adapters[i].mac_address);
        }	
        return result;
    }
}
