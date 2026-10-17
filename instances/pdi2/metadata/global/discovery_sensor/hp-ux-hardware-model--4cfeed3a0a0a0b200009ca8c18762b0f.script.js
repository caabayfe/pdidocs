new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var mm = MakeAndModelJS.fromNames("HP", output.trim(), "hardware");
        current.manufacturer = mm.getManufacturerSysID();
        current.model_id = mm.getModelNameSysID();
    },

    type: "DiscoverySensor"
});
