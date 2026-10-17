new DiscoverySensor({
    process: function(result) {
        if (gs.nil(result.output))
            return;

        this.parseOutput(result.output);
    },

	getOSPackage: function() {
		var ci_sys_id = g_probe.getParameter('ci_sys_id');
		var gr = new GlideRecord('cmdb_ci_aix_server');
		
		if (ci_sys_id) {
			gr.get('sys_id', ci_sys_id);

			var osPkg = {};
			osPkg.name = 'AIX';
			osPkg.publisher = 'IBM';
			osPkg.version = gr.getValue('os_version');
			return osPkg;
		}
		return null;
	},

    parseOutput: function(output) {
        var packages = [];

        var line = output.split('\n');
        for (var i = 0; i < line.length; i++) {
            if (line[i] == '')
                continue;

            if (line[i].indexOf('#') != -1)
                continue;
          
            var parts = line[i].split(":");
            var pkg = parts[0];
            var name = parts[1];
            var version = parts[2];
            var state = parts[5];
            var desc = parts[7];

            if (!name)
                continue;

            var software = {};
            software.name = name;
            if (version)
                software.version = version;
            if (desc)
                software.short_description = desc + (state ? (" ; State: " + state + " ") : "") 
                    + (pkg ? (" ; Package Name: " + pkg + " ") : "");
            
            packages.push(software);
        }

		var osPkg = this.getOSPackage();
		if (osPkg != null)
			packages.push(osPkg);
		
		var filteredPackages = InstallSoftwareFilter.filterUnixSoftware(packages);
        this.addToRelatedList('cmdb_ci_spkg', filteredPackages, '', '');
    },

    type: "DiscoverySensor"
});
