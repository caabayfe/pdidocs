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

            if (name == "cpu")
                current.cpu_type = value;
            else if (name == "count")
                current.cpu_count = value;
        }
    },

    type: "DiscoverySensor"
});
