new DiscoverySensor({
    process: function(result) {
        if (JSUtil.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var lines = output.split("\n");

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            if (line.indexOf(" Ver ") > -1) {
                var version = line.substring(line.indexOf(" Ver ")+5);
                version = version.substring(0, version.indexOf(" "));
                current.version = version;
            }
        }
    },

    type: "DiscoverySensor"
});
