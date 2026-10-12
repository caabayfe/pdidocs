var MIDPackageDownloadHostUtil = Class.create();

// Glide System Property to specify the base uri from where the mid packages will downloaded.
MIDPackageDownloadHostUtil._MID_PACKAGE_HOST_PROPERTY = "mid.install_server.base_uri";
MIDPackageDownloadHostUtil._DEFAULT_BASE_URI = "https://install.service-now.com";

MIDPackageDownloadHostUtil.prototype = {
    initialize: function() {
    },
	
	getDownloadHostBaseUri: function(){
		// If System Property "mid.install_server.base_uri" is configured, then return
		if(gs.getProperty(MIDPackageDownloadHostUtil._MID_PACKAGE_HOST_PROPERTY)){
			var midPackageDownloadHost = gs.getProperty(MIDPackageDownloadHostUtil._MID_PACKAGE_HOST_PROPERTY).trim();
			return midPackageDownloadHost;
		}
		
		return MIDPackageDownloadHostUtil._DEFAULT_BASE_URI;
	},
	
    type: 'MIDPackageDownloadHostUtil'
};
