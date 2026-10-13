new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var lines = output.split(/\n/);
        var ram = 0;

        for (var i = 0; i < lines.length; i++) {
            var parts = lines[i].split(",");
            if (parts[0] == "size")
                ram += parseInt(parts[1]);
        }

        current.ram = new RoundingInterval("ram").getRoundedValue(ram);
    },

    type: "DiscoverySensor"
});
