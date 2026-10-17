// Discovery

var InstallSoftwareFilter = Class.create();

/*
 *	Based on key words, it'll filter out unix software/s that customers do not want to see
 */
InstallSoftwareFilter.filterUnixSoftware = function(packages) {
    var unixFilter = InstallSoftwareFilter.getSoftwareType('unix');

	if (!unixFilter.enable)
		return packages;
	
	var filter = new SNC.SoftwareFilter();
	
	return filter.filterSoftware(packages, unixFilter.sys_id, unixFilter.filter.indexOf('include') > -1);
};

/*
 *	Based on key words, it'll filter out windows software/s that customers do not want to see
 */
InstallSoftwareFilter.filterWindowsSoftware = function(packages) {
    var winFilter = InstallSoftwareFilter.getSoftwareType('windows');

    if (!winFilter.enable)
        return packages;

	var filter = new SNC.SoftwareFilter();
	
    return filter.filterSoftware(packages, winFilter.sys_id, winFilter.filter.indexOf('include') > -1);
};

InstallSoftwareFilter.getSoftwareType = function(type) {
    var gr = new GlideRecord('discovery_spkg_filter');
    gr.addQuery('type', type);
    gr.query();

    if (gr.next())
        return gr;
};

/*
 *  Flush the probe cache results for Unix Installed Software probes
 */
InstallSoftwareFilter.flushUnixProbeCache = function() {
	var probes = ['Linux - Installed Software',
				  'AIX - Installed Software',
				  'HP-UX - Installed Software',
				  'Solaris - Installed Software'];
	
	InstallSoftwareFilter.flushProbeCache(probes);
};

/*
 *  Flush the probe cache results for Windows Installed Software probe
 */
InstallSoftwareFilter.flushWinProbeCache = function() {
	var probes = ['Windows - Installed Software'];
	
	InstallSoftwareFilter.flushProbeCache(probes);
};

InstallSoftwareFilter.flushProbeCache = function(probes) {
		var gr = new GlideRecord('discovery_probes');
		gr.addQuery('name', 'IN', probes);
		gr.query();
	
		while (gr.next())
			ProbeResultsCache.getInstance().flushCache(gr.sys_id);
};

InstallSoftwareFilter.prototype = {
	initialize: function() {
	},
	
	type: 'InstallSoftwareFilter'
};
