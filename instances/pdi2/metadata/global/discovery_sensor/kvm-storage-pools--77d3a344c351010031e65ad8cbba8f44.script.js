new DiscoveryKvmSensor({
	
	process: function(result) {
		if (gs.nil(result.output))
            return;
		this.parseStoragePoolListOutput(output);
	},
	
    type: "DiscoveryKvmSensor"
});
