new DiscoverySensor({
    process: function(result) {
		var ci   = this.getCmdbCi();
		var vlan = new DiscoveryVlanSwitchProcessor();
        vlan.process(ci, result);
    },
    
    type: 'DiscoverySensor'
});
