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
            var off = line.indexOf("filesets for");
            if (off == -1)
                continue;

            var patchName = line.substring(off+13);
            patchName = patchName.substring(0, patchName.indexOf(" "));

            var patch = {};
            patch.name = patchName;
            patches.push(patch);
        }

        return patches;
    },

    type: "DiscoverySensor"
});
