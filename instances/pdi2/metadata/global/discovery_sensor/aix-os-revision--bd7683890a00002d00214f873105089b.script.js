new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        current.os_service_pack = output.trim();
    },

    type: "DiscoverySensor"
});
