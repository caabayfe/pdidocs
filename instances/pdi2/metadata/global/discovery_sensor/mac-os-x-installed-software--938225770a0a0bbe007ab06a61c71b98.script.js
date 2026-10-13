new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var DMPU = new DiscoveryMacProfileUtils();
        var baseElements = DMPU.getBaseElement(output);
        var section = baseElements[0];

        this.processInstalledSoftwares(section['_items']);
    },

    processInstalledSoftwares: function(items) {
        var packages = [];

        for (var i = 0; i < items.length; i++) {
            var app = items[i];
            var software = {};

            software.name = new String(app['_name']);
            software.version = new String(app['version']);

            packages.push(software);
        }

        this.addToRelatedList('cmdb_ci_spkg', packages, '', '');
    },

    type: "DiscoverySensor"
});
