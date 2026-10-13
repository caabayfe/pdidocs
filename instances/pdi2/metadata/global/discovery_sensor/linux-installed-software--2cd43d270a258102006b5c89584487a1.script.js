new DiscoveryJSONSensor({

    processJSON: function() {
        if (JSUtil.nil(related_data.packages))
            return;

        var osPkg = this.getOSPackage();
        if (osPkg != null)
            related_data.packages.push(osPkg);
        
        var filteredPackages = InstallSoftwareFilter.filterUnixSoftware(related_data.packages);
        this.addToRelatedList('cmdb_ci_spkg', filteredPackages, '', '');
    },

    getOSPackage: function() {
        var ci_sys_id = g_probe.getParameter('ci_sys_id');
        var gr = new GlideRecord('cmdb_ci_linux_server');

        if (ci_sys_id && gr.get('sys_id', ci_sys_id)) {
            var osPkg = {};
            var osName = gr.getValue('os');
            if(JSUtil.nil(osName))
                return null;
            osPkg.name = osName;
            osPkg.version = gr.getValue('os_version');
            osPkg.publisher = this.getOSPublisher(osName);
            return osPkg;
        }
        return null;
    },

    getOSPublisher: function(osName) {
		osPub = osName.toLowerCase();
        if (osPub.indexOf('oracle') != -1) {
            return 'Oracle';
        } else if (osPub.indexOf('centos') != -1) {
            return 'CentOS';
        } else if (osPub.indexOf('fedora') != -1) {
            return 'Fedora';
        } else if (osPub.indexOf('red hat') != -1) {
            return 'Red Hat';
        } else if (osPub.indexOf('suse') != -1) {
            return 'SuSE';
        } else if (osPub.indexOf('ubuntu') != -1) {
            return 'Ubuntu';
        } else if (osPub.indexOf('rocky') != -1) {
            return 'Rocky';
        } else if (osPub.indexOf('photon os') != -1) {
            return 'VMware';
        } else if (osPub.indexOf('amazon') != -1) {
            return 'Amazon';
        } else if (osPub.indexOf('almalinux') != -1) {
            return 'AlmaLinux';
        } else if (osPub.indexOf('debian') != -1) {
            return 'Debian';
        } else {
            return 'GNU/Linux';
        }
    },

    type: "DiscoveryJSONSensor"
});
