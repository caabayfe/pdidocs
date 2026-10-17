new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var lines = output.split(/\n/);

        for (var i = 0; i < lines.length; i++) {
            var parts = lines[i].split("=");

            if (parts[0] && parts[0] == "server.info") {
                var version = new String(parts[1]);
                if (version.startsWith("Apache Tomcat/"))
                    version = version.substring(14);
                current.version = version;
                break;
            }
        }
    },

    type: "DiscoverySensor"
});
