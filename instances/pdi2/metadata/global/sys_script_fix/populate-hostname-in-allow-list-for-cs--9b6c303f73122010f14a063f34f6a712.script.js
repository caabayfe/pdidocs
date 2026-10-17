var url = gs.getProperty("glide.servlet.uri");

if (!gs.nil(url)) {
	var hostnameHelper = new global.AllowedHostnameHelper();
	var hostname = hostnameHelper.extractHostnameFromURL(url);	
	if (hostnameHelper.checkHostnameExists(hostname)) 
		gs.info('Given hostname {0} already exists in the Hostname allow list table.', hostname);
	else {
		hostnameHelper.insertHostname(hostname);
		gs.info('Added hostname {0} from url {1} in the Hostname allow list table.', hostname, url);
	}
}
