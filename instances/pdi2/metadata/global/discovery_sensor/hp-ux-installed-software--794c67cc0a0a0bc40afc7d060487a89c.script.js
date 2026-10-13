new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var packages = [];

        var line = output.split('\n');
        for (var i = 0; i < line.length; i++) {
            var trimmedLine = line[i].trim()
            if (trimmedLine == '')
                continue;

            if (trimmedLine.indexOf('#') == 0)
                continue;

            var parts = trimmedLine.split(/\s+/); // Split on whitespaces in middle, tab or space
            software = {
                name: parts.shift(), // First part is guaranteed to exist (although it may be an empty string)
                version: parts.shift() || '', // Second part may not exist - set it to an empty string so it won't be "undefined"
                short_description: parts.join(' ') // Put the rest of the string back together. Note: This will replace contiguous whitespace in the original string with a single space.
            };

            packages.push(software);
        }

        var osPkg = this.getOSPackage();
        if (osPkg != null)
            packages.push(osPkg);
			
        var filteredPackages = InstallSoftwareFilter.filterUnixSoftware(packages);
        this.addToRelatedList('cmdb_ci_spkg', filteredPackages, '', '');
    },

    getOSPackage: function() {
        var ci_sys_id = g_probe.getParameter('ci_sys_id');
        var gr = new GlideRecord('cmdb_ci_hpux_server');

        if (ci_sys_id) {
            gr.get('sys_id', ci_sys_id);

            var osPkg = {};
            osPkg.name = gr.getValue('os');
            osPkg.version = gr.getValue('os_version');
            osPkg.publisher = 'HP';
            return osPkg;
        }
        return null;
    },

    type: "DiscoverySensor"
});
