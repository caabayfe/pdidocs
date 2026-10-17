new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        current.details_xml = result.output;
    },

    type: "DiscoverySensor"
});
