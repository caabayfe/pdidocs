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

            if (line.indexOf("Server version:") > -1) {
                var version = line.substring(line.indexOf(":") + 2);

            if (version.startsWith("Apache/"))
                version = version.substring(7);

                current.version = version.trim();
                break;
            }
        }

        current.short_description = output;
    },

    type: "DiscoverySensor"
});
