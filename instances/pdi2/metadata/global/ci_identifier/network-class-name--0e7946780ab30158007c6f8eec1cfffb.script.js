function(ciData, log, identifier) { 
    var nets = getDiscoveredNetworks(ciData);
    var matching = matchingCIs(nets, ciData);
    return new CIIdentifierResult(matching, nets.length > 0);
    
    function matchingCIs(nets, ciData) {
        var matches = [];
        if (nets.length == 0)
            return matches;
            
        var ips = [];
        var macs = [];
        var checker = {};
        for (var i = 0; i < nets.length; i++) {
            ips.push(nets[i].ip_address);
            macs.push(nets[i].mac_address);
            checker[nets[i].mac_address] = nets[i].ip_address;
        }

        // find matches for the discovered IP address...
        var gr = new GlideRecord(identifier.applies_to);
        gr.addQuery('sys_class_name', ciData.getData().sys_class_name);
        gr.addQuery('ip_address', ips);
        gr.addQuery('mac_address', macs);
        gr.query();
        
        // populate our return value...
        while (gr.next()) {
            if (checker[gr.mac_address] != gr.ip_address)
                continue;
            matches.push('' + gr.getUniqueValue());
        }

        return matches;
    }
    
    function getDiscoveredNetworks(ciData) {
        var adapters = ciData.getRelatedList("cmdb_ci_network_adapter", "cmdb_ci");
        var result = [];
        for(var i = 0; i < adapters.length; i++) {
            var valid_ip = (SncIPAddressV4.getIPAddressV4Instance(adapters[i].ip_address) != null);
            var valid_mac = (SncMACAddress.getMACAddressInstance(adapters[i].mac_address) != null);
            if (!valid_ip || !valid_mac)
                continue;

            result.push(adapters[i]);
        }
        return result;
    }
}
