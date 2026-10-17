new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var mi = output.trim().split(",");
        var mm = MakeAndModelJS.fromNames(mi[0], (mi.length == 1) ? null : mi[1], "hardware");

        current.manufacturer = mm.getManufacturerSysID();
        current.model_id = mm.getModelNameSysID();
    },

    type: "DiscoverySensor"
});
