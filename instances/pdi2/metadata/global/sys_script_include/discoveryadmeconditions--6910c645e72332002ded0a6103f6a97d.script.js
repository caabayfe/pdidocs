DiscoveryADMEConditions = {
	shouldTriggerADME: function(discovery_source) {
		var admeIsEnabled = gs.getProperty('glide.discovery.enable_adme') == 'true';
		return admeIsEnabled;
		
	},
	
	shouldTriggerADM: function(discovery_source) {
		return !DiscoveryADMEConditions.shouldTriggerADME(discovery_source);
	}
};
