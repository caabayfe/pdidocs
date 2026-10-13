// Discovery class

/**
 * Encapsulates the notion of a Shazzam scanner.  Instances have the following properties initialized:
 * 
 * result:     the result of the scanner
 * service:    the service name of the scanner
 * protocol:   the protocol of the scanner
 * name:       the name of the scanner
 * port:       the port being scanned
 * hostName:   the hostname for the IP, if one was resolved by this scanner
 * domainName: the Windows domain name, if one was resolved by this scanner
 * portProbe:  the port probe name
 * contents:   a hashmap of any nodes contained within this scanner, by name
 * 
 * Tom Dilatush tom.dilatush@service-now.com
 */

var ShazzamScanner;

(function() {
	var stringMap = { };
	function map(scanner, name, value) {
		// This map ensures that any string will only be stored
		// in memory once
		value = value || scanner[name];
		stringMap[name] = stringMap[name] || { };
		stringMap[name][value] = stringMap[name][value] || value;
		return stringMap[name][value];
	}

	ShazzamScanner = Class.create();

	ShazzamScanner.prototype = {
		initialize: function(scanner) {
			// first parse the attributes...
			this.result    = map(scanner, '@result');
			this.service   = map(scanner, '@service');
			this.protocol  = map(scanner, '@protocol');
			this.name      = map(scanner, '@name');
			this.port      = map(scanner, '@port');
			this.portProbe = map(scanner, '@portprobe');
			this.ipAddress=  scanner['@ip_address'];
			this.contents  = {};

			// Any scanners 
			this.scanners = g_array_util.ensureArray(scanner.scanner);
			for (var i = 0; i < this.scanners.length; i++)
				this.scanners[i] = new ShazzamScanner(this.scanners[i]);	

			// default resolved names to null...
			this.hostName = null;
			this.domainName = null;

			// build our contents...
			for (var name in scanner) {
				if (name.charAt(0) == '@')
					continue;
				this.contents[name] = map(scanner, name);
			}

			// then do a little "analysis" to see if we've resolved any names...
			if (this.result != 'resolved')
				return;

			var hn  = scanner.host_name;
			var hns = scanner.host_names;
			var dn  = scanner.domain_name;

			// if we have DNS hostnames, take the first one 
			if (hns) {
				var ns = hns.split(',');
				hn = ns[0];
			}

			// if we found anything, stuff it away...
			if (hn)
				this.hostName = hn;
			if (dn)
				this.domainName = map(scanner, 'domainName', dn);
		},

		type: "ShazzamScanner"
	}

})();
