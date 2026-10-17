var AllowedHostnameHelper = Class.create();
AllowedHostnameHelper.prototype = {
	
	initialize: function() {
		this.ALLOWED_HOSTNAME_TABLE = "sys_cs_hostname_allow_list";
		this.existingHostnames = this._getExistingHostnamesFromAllowListTable();
		this.WILDCARD = '*.';
	},
	
	/*
	* Ex 1. url: https://www.abc.service-now.com
	* output hostname: abc.service-now.com
	*
	* Ex 2. url: https://support.microsoft.com
	* output hostname: *.microsoft.com
	*/
	extractHostnameFromURL: function(url) {
		var logUtil = new LinkUnfurlingLoggingUtils();
		if (gs.nil(url)) {
			logUtil.atWarn(url).log("The provided URL {0} for parsing is empty or invalid.", url);
			return;
		}				
		var hostname = this._stripProtocolFromURL(url);
		if (gs.nil(hostname)) {
			logUtil.atWarn(url).log("The hostname {0} in URL is empty or undefined.", hostname);
			return;
		}
		return this._processHostname(hostname);
	},

	/*
	 * Get the hostname from a given URL and always keep the http / https. e.g.
	 * Input url: https://www.service-now.com/docs/troubleshooting.html
	 * Output hostname: https://www.service-now.com
	 */
	extractHostnameFromURLWithProtocol: function(url) {
		if (gs.nil(url)) {
			new LinkUnfurlingLoggingUtils().atWarn(url).log("The provided URL {0} for parsing is empty or invalid.", url);
			return;
		}

		return this._removePathFromURL(url);
	},

	insertHostname: function(hostname) {
		if (gs.nil(hostname))
			return;
		
		var allowedDomainGr = new GlideRecord(this.ALLOWED_HOSTNAME_TABLE);
		allowedDomainGr.setValue('hostname', hostname);
		allowedDomainGr.setValue('active', true);
		allowedDomainGr.insert();
	},
	
	checkHostnameExists: function(hostname) {
		if (gs.nil(hostname))
			return false;
		return this.existingHostnames.indexOf(String(hostname)) >= 0;
	},
	
	/*
	* Given a URL https://www.google.com
	* check if URL is in allow list
	* else get the hostname, check if hostname exists in the allow list with wildcard
	*/
	isURLAllowedForUnfurling: function(url) {
		if (gs.nil(url))
			return false;
		
		var hostname = '';
		
		hostname = this._stripProtocolFromURL(url);
		if (gs.nil(hostname))
			return false;
		
		if (this.checkHostnameExists(hostname))
			return true;
		else {
			hostname = this._processHostname(hostname);
			return this.checkHostnameExists(hostname);
		}
	},
	
	_getExistingHostnamesFromAllowListTable: function() {		
		var existingHostnames = [];
		var hostnameGr = new GlideRecord(this.ALLOWED_HOSTNAME_TABLE);
		hostnameGr.addActiveQuery();
		hostnameGr.addDomainQuery(this._getDomainQuery(gs.getUser().getDomainID()));
		hostnameGr.query();
		
		while (hostnameGr.next()) 
			existingHostnames.push(hostnameGr.getValue('hostname'));
		
		return existingHostnames;
	},
	
	_getDomainQuery: function(domainId) {
		/*If the user uses the domain picker to switch to the global domain, gs.getUser().getDomainID() returns the string "global". 
		For all other domains, the method returns the sys_id of that domain.*/
		if (gs.nil(domainId) || domainId === 'global')
			return 'global';
		else {
			var domainGr = new GlideRecord('domain');
			domainGr.get(domainId);
			return domainGr;
		}
	},
	
	_stripProtocolFromURL: function(url) {
		var urlParts = url.replace('http://','').replace('https://','').split(/[/?#]/);
		return urlParts[0];				
	},

	_removePathFromURL: function(url) {
		var urlParts = url.split(/[/?#]/);
		if (url.startsWith("http"))
			return urlParts[0] + "//" + urlParts[2];
		return urlParts[0];
	},
	
	_processHostname: function(hostname) {
		var parts = hostname.split('.');
		var domain = parts.slice(-2).join('.');
		
		if (domain.indexOf('service-now.com') === 0)
			return hostname;
		else
			return this.WILDCARD + domain; //append the wild card for domains
	},

	type: 'AllowedHostnameHelper'
};
