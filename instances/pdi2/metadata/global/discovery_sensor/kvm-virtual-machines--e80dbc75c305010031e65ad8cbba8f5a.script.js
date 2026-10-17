new DiscoveryKvmSensor({
	
	process: function(result) {
		if (gs.nil(result.output))
            return;
		this.parseDomainListOutput(output);
	},
	
    type: "DiscoveryKvmSensor"
});
