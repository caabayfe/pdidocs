function(ciData, log, identifier) {
    var discoveredSerials = getDiscoveredSerials(ciData);
    var matching = matchingCIs(discoveredSerials, ciData);
    return new CIIdentifierResult(matching, discoveredSerials.length > 0);
    
    function matchingCIs(discoveredSerials, ciData) {
        var matches = [];

        // If there's no discovered serial numbers, skip the lookup
        if (discoveredSerials.length == 0)
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
            if (ciData.getData().sys_class_name == gr.cmdb_ci.sys_class_name)
                matches.push('' + gr.getValue('cmdb_ci'));

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
