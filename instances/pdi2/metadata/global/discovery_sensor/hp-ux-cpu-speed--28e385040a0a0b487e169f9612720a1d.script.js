new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var lines = output.split(/\n/);

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            if (line == '')
                continue;

            var parts = line.split(":");
            var name = parts[0].trim();
            var value = parts[1].trim();

            if (name == "itick_per_usec")
                current.cpu_speed = new RoundingInterval("cpu").getRoundedValue(value);
        }
    },

    type: "DiscoverySensor"
});
