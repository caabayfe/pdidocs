new DiscoverySensor({
    process: function(result) {
        gs.log("Long running command complete... ");
        gs.log("RESULTS");
        gs.log(result.output)
        gs.log("END OF RESULTS");
    },

    type: "DiscoverySensor"
});
