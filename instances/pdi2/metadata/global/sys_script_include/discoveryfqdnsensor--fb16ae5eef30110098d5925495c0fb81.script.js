var DiscoveryFQDNSensor = Class.create();

/**
*  The finding of FQDN is based on Puppet and Chef. Here's how they do it.
*  PUppet => https://github.com/puppetlabs/facter/blob/master/lib/facter/domain.rb
*  Chef   => https://github.com/opscode/ohai/blob/master/lib/ohai/plugins/hostname.rb
*/

DiscoveryFQDNSensor.prototype = Object.extendsObject(DiscoverySensor, {
   
    process: function(result) {
        if (gs.nil(result.output))
            return;

		this.fqdn = '';
		this.hostname = '';
		this.domain = '';
        this.parseOutput(result.output);
    },

    parseOutput: function(output) {
        var lines = output.split(/\n/);
		var funcName;

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
			
			// If fqdn is found, then we're done! 
			if (this.fqdn != '') {
				current.fqdn = this.fqdn;
				break;
			}
			
			if (line.indexOf("----MARKER----") > -1) {
				var patt = /^-+.+?-+(.+?)-+/;
				var groups = patt.exec(line);
				funcName = groups[1];
				continue;
			}
						
			if (funcName == "HOSTNAME") {
				if (!this.parseHostnameCmd(line))
					break;			
			} else if (funcName == "DOMAINNAME")
				this.parseDomainCmd(line);
			else if (funcName == "RESOLVCONF")
				this.parseResolvConf(line);							
        }        
    },
	
	parseHostnameCmd: function(line) {
		// If for some reason there's no hostname at all, then there's really nothing we can do
		if (line == '') {
			this.getLogger().warn("Unable to find a hostname!");
			return false;
		}

		// If there's a dot, then it must include the domain info
		if (line.indexOf(".") > 0)
			this.fqdn = line;
		else
			this.hostname = line;		

		return true;
	},
	
	// If we get anything back from the dnsdomainname command, then we can set the fqdn
	parseDomainCmd: function(line) {		
		if (line == '')
			return;
		
		this.domain = line;
		this.fqdn = this.hostname + "." + this.domain;
	},
	
	parseResolvConf: function(line) {		
		// Ignore comments
		if (line.startsWith("#"))
			return;
				
		// Match on domain that starts with domain first
		var patt = /^\s*domain\s+(\S+)/
		var groups = patt.exec(line);
		
		// If there's no match, then we don't care
		if (groups != null) {
			this.domain = groups[1];
			this.fqdn = this.hostname + "." + this.domain;
			return;
		}

		// Match on domain that starts with search first
		var patt = /^\s*search\s+(\S+)/;
		var groups = patt.exec(line);
		
		// If there's no match, then we don't care
		if (groups != null) {
			this.domain = groups[1];
			this.fqdn = this.hostname + "." + this.domain;
			return;
		}	
	},
	
    type: "DiscoveryFQDNSensor"
});
