/*
 *  Notes: This identifier will go through the table specified in applies_to field of the identifier
 *         and match based on serial number field of the CI. 
 *
 *  Warning: This could potentially cause reclassification since it does not check for the CI class (sys_class_name).
 */

function(ciData, log, identifier) { 
    var discoveredSerials = getDiscoveredSerials(ciData);
    var matching = matchingCIs(discoveredSerials, ciData);
    return new CIIdentifierResult(matching, discoveredSerials.length > 0);
    
    function matchingCIs(discoveredSerials, ciData) {
        var matches = [];
		if (discoveredSerials.length == 0)
            return matches;
		
        // find matches for any discovered serial number...
        var gr = new GlideRecord(identifier.applies_to);
        gr.addQuery('serial_number', discoveredSerials);
        gr.query();
        
        // populate our return value...
        while (gr.next())
            matches.push('' + gr.getUniqueValue());

        return matches;
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
