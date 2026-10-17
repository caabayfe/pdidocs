function(ciData, log, identifier) { 
    var ips = getDiscoveredIPs(ciData);
    var matching = matchingCIs(ips, ciData);
    return new CIIdentifierResult(matching, ips.length > 0);
    
    function matchingCIs(ips, ciData) {
        var matches = [];
        if (ips.length == 0)
            return matches;

        // find matches for the discovered IP address...
        var gr = new GlideRecord(identifier.applies_to);
        gr.addQuery('sys_class_name', ciData.getData().sys_class_name);
        gr.addQuery('ip_address', ips);
        gr.query();
        
        // populate our return value...
        while (gr.next())
            matches.push('' + gr.getUniqueValue());

        return matches;
    }
    
    function getDiscoveredIPs(ciData) {
        var adapters = ciData.getRelatedList("cmdb_ci_network_adapter", "cmdb_ci");
        var result = [];
        for(var i = 0; i < adapters.length; i++) {
            if (SncIPAddressV4.getIPAddressV4Instance(adapters[i].ip_address) == null)
                continue;

            result.push(adapters[i].ip_address);
        }
        var ip = ciData.getData().ip_address;
        if (SncIPAddressV4.getIPAddressV4Instance(ip) != null)
            result.push(ip);
        return result;
    }
}
