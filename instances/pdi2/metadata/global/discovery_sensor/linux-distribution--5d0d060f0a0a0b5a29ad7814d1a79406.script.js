new DiscoveryJSONSensor({

	processJSON: function(jsonResult) {
		if (JSUtil.nil(current.os_version)) {
			var ci = this.getCmdbRecord();
			if (ci)
				current.os_version = ci.kernel_release;
		}
    },
    type: "DiscoveryJSONSensor"
});
