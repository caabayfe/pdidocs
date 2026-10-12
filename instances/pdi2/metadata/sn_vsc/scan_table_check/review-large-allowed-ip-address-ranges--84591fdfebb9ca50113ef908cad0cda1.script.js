(function (finding, current) {
	// Additionally, please note that CIDR blocks contain a larger amount of IP addresses as the number decreases. 
	//		For example, the CIDR block size 8 is larger (contains more IP addresses)
	//		than the CIDR block size 16.

	var largestExpectedCIDRBlock = 16; // Adjust as needed


	var range = [current.getValue('range_start'), current.getValue('range_end')];
	var estimatedBlockSize = estimateCIDRBlockSize(range);
	if(estimatedBlockSize < largestExpectedCIDRBlock) {
		finding.setCurrentSource(current);
		finding.setValue('finding_details', 'The IP Range "' + current.getValue('range_start') + '" to "' 
			+ current.getValue('range_end') +'" has an estimated CIDR block size of ' + estimatedBlockSize + '.');
		finding.increment();
	}
	

	// Provides estimate of CIDR Block size
	//		Accepts array of 2 strings that are IPv4 addresses 
	function estimateCIDRBlockSize(range) {
		if (range.length != 2) return -1;
		var l = IPV4AsInt(range[0]);
		var r = IPV4AsInt(range[1]);
		if(l == -1 || r == -1 || l > r) return -1;
		return 32 - Math.ceil(Math.log2(r - l));
	}

	function IPV4AsInt(ip) {

		ip = ip.split('.').map(function (x) { return parseInt(x);});

		// Quick check if IP Is valid.
		//  contains 4 valid octets (0 <= value <= 255)
		if(ip.length != 4 || !ip.every(function(elem) { return elem >= 0 && elem <= 255;})) {
			return -1;
		}

		// Calculated IP as int by octet.
		return ip.reduce(function (acc, octet, idx) {
			return acc + (Math.pow(256, 3 - idx) * octet);
		}, 0);
	}

})(finding, current);
