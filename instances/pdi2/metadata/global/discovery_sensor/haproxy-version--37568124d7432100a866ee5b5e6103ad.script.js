new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var lines = output.split(/\n/g);

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
			var vKeyword = "HA-Proxy version";
            if (line.indexOf(vKeyword) > -1) {
                var version = line.substring(vKeyword.length+1);
				current.version = version.trim();
                break;
            }
        }

        current.short_description = output;
    },

    type: "DiscoverySensor"
});
