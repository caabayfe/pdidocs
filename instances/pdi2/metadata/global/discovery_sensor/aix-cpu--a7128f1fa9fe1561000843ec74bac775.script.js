new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var lines = output.split(/\n/);
        var cpuCnt = 0;

        for (var i = 0; i < lines.length; i++) {
            var parts = lines[i].split(",");
            if (parts[0] == "frequency") {
                current.cpu_speed = new RoundingInterval("cpu").getRoundedValue(parseInt(parts[1]) / 1000 / 1000);
                cpuCnt++;
            } else if (parts[0] == "type")
                current.cpu_type = parts[1];
        }

        current.cpu_count = cpuCnt;
    },

    type: "DiscoverySensor"
});
