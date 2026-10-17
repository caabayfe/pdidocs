function(ciData, log, identifier) {
    var discoveredNICs = getDiscoveredNICs(ciData);
    var matching = matchingCIs(discoveredNICs);
    return new CIIdentifierResult(matching, discoveredNICs.length > 0);
    
    function matchingCIs(discoveredNICs) {
        var matches = [];

        if (discoveredNICs.length == 0)
            return matches;

        // find matches for all NICs in the network adapter table...
        var gr = new GlideAggregate('cmdb_ci_network_adapter');
        gr.addEncodedQuery(buildEncodedQuery(discoveredNICs));
        gr.addAggregate('COUNT', 'cmdb_ci');
        gr.addQuery('valid', 'true');
        gr.addQuery('install_status', '!=', '100');
        gr.groupBy('cmdb_ci');
        gr.addHaving('COUNT', '=', discoveredNICs.length);
        gr.query();
        
        // populate our return value...
        while (gr.next())
            matches.push('' + gr.getValue('cmdb_ci'));

        return matches;
    }

    function buildEncodedQuery(discoveredNICs) {
        var conds = [];
        for (var i = 0; i < discoveredNICs.length; i++) {
            var ma = SncMACAddress.getMACAddressInstance(discoveredNICs[i].mac_address);
            if (!ma)
                continue;
            conds.push('mac_address=' + ma.getAddressAsString());
        }
        return conds.join('^NQ');
    }
    
    function getDiscoveredNICs(ciData) {
        var adapters = ciData.getRelatedList("cmdb_ci_network_adapter", "cmdb_ci");
        var result = [];
        for(var i = 0; i < adapters.length; i++) {
            if (gs.nil(adapters[i].mac_address) || gs.nil(adapters[i].ip_address))
                continue;

            result.push(adapters[i]);
        }	
        return result;
    }
}
