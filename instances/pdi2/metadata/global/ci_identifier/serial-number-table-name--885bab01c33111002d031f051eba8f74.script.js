/**
 * Identifier to handle edge case where an incomplete response from a network device may cause
 * the device to be misclassified.  Discovery will then rely on known serial numbers and the device
 * name to prevent duplication and reclassification.  However, if either the device name is empty
 * or no serial number is detected, this identifier will return no matches.
 *
 */
function(ciData, log, identifier) {
	this.logger = JSUtil.notNil(log) ? log : new DiscoveryLogger();
    var discoveredSerials = getDiscoveredSerials(ciData);
	
    var matching = matchingCIs(discoveredSerials, ciData);
    return new CIIdentifierResult(matching, discoveredSerials.length > 0);
    
    function matchingCIs(discoveredSerials, ciData) {
        var matches = [];

        // If there's no discovered serial numbers or no name, skip the lookup
        if (discoveredSerials.length == 0 || JSUtil.nil(ciData.getData().name))
            return matches;

        // find matches for all valid serials in the serial number table...
        var gr = new GlideAggregate('cmdb_serial_number');
        gr.addEncodedQuery(buildEncodedQuery(discoveredSerials));
        gr.addAggregate('COUNT', 'cmdb_ci');
        gr.addQuery('valid', 'true');
        gr.addQuery('absent', 'false');
        gr.groupBy('cmdb_ci');
        gr.addHaving('COUNT', '=', discoveredSerials.length);
        gr.query();

        // populate our return value...
        while (gr.next())
            if (ciData.getData().name == gr.cmdb_ci.name) {
                matches.push('' + gr.getValue('cmdb_ci'));
				
				var classFound = ciData.data["sys_class_name"];
				var classExist = gr.cmdb_ci.sys_class_name;
				
				if (classFound != classExist) {
					this.logger.info("Existing " + classExist + " record found. Ignoring " + classFound + " classification", "Identifier: " + identifier.name);
					
					//prevent reclassification by updating the class in ciData
					ciData.data["sys_class_name"] = classExist;
				}
			}

        return matches;
    }

    function buildEncodedQuery(discoveredSerials) {
        var conds = [];
        for (var i = 0; i < discoveredSerials.length; i++)
            conds.push('serial_number=' + discoveredSerials[i].serial_number + '^serial_number_type=' + discoveredSerials[i].serial_number_type);

        return conds.join('^NQ');
    }
    
    function getDiscoveredSerials(ciData) {
        var srls = ciData.getRelatedList('cmdb_serial_number', 'cmdb_ci');
        var result = [];

        for (var i = 0; i < srls.length; i++) {
            var srl = srls[i];
            var sn = new SncSerialNumber();
            if (sn.isValid(srl.serial_number))
                result.push(srl);
        }

        return result;
    }
}
