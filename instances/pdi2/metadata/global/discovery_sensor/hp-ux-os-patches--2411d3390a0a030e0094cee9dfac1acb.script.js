new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.addToRelatedList('cmdb_ci_patches', this.parsePatches(result.output), 'cmdb_ci', 'name');
    },

    parsePatches: function(output) {
        var patches = [];
        var lines = output.split(/\n/);

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var parts = line.split(/\s+/);

            if (parts[0]) {
                var patchName = parts[0];
                var patch = {};
                patch.name = patchName;
                patches.push(patch);
            }
        }

        return patches;
    },

    type: "DiscoverySensor"
});
