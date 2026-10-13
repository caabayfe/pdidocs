new DiscoveryJSONSensor({
    processJSON: function() {
        this.ci      = this.getCmdbCi();
        var arpTable = related_data.arpTable;
        var arpList  = [];
        if (JSUtil.nil(arpTable))
            return;
        for (var line in arpTable) {
            var macAddress = arpTable[line].mac;
            var ipAddress  = arpTable[line].ip;
            if ((JSUtil.notNil(macAddress)) && (JSUtil.notNil(ipAddress))) {
                arpList.push({'cmdb_ci':this.ci, 'mac_address':macAddress, 'ip_address':ipAddress});
            }
        }   
        // update cmdb
        if (JSUtil.notNil(arpList)) {
            this.addToRelatedList('discovery_net_arp_table', arpList, 'cmdb_ci', 'mac_address, ip_address');
        }
    },
    
    type: 'DiscoveryJSONSensor'
});
