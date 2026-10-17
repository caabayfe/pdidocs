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

            if (name == "memory_installed_in_machine")
                current.ram = new RoundingInterval("ram").getRoundedValue((parseInt(value)*4)/1024);
        }
    },

    type: "DiscoverySensor"
});
