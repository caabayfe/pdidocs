new DiscoveryJSONSensor({
	
	processJSON: function() {        
		this.packages = related_data.packages;
		if (JSUtil.nil(this.packages))
			return;

		var osPkg = this.getOSPackage();
		if (osPkg != null)
			this.packages.push(osPkg);

		var filteredPackages = InstallSoftwareFilter.filterUnixSoftware(this.packages);
		this.addToRelatedList('cmdb_ci_spkg', filteredPackages, '', '');
    },

	getOSPackage: function() {
        var ci_sys_id = g_probe.getParameter('ci_sys_id');
        var gr = new GlideRecord('cmdb_ci_solaris_server');

        if (ci_sys_id) {
            gr.get('sys_id', ci_sys_id);

            var osPkg = {};
            osPkg.name = gr.getValue('os');
            osPkg.version = gr.getValue('os_version');
            osPkg.publisher = 'Oracle';
            return osPkg;
        }
        return null;
    },
   
    type: "DiscoveryJSONSensor"
});
