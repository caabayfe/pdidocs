var NetworkDiscoveryUtil = Class.create();

NetworkDiscoveryUtil.isBroadcastAddress = function(ipAddress, netmask) {
	ipAddress = NetworkDiscoveryUtil.stringIpToInt(ipAddress);
	netmask = NetworkDiscoveryUtil.stringIpToInt(netmask);

	var networkAddress = ipAddress & netmask;
	var netmaskCidr = NetworkDiscoveryUtil.netmaskToCidr(NetworkDiscoveryUtil.convertIntIpToDotRepresentation(netmask));
	var broadcastAddress = networkAddress | (~netmask);
	return netmaskCidr < 31 && ipAddress == (0xFFFFFFFF & broadcastAddress);
}

NetworkDiscoveryUtil.isNetworkAddress = function(ipAddress, netmask) {
	ipAddress = NetworkDiscoveryUtil.stringIpToInt(ipAddress);
	netmask = NetworkDiscoveryUtil.stringIpToInt(netmask);

	var networkAddress = ipAddress & netmask;
	var netmaskCidr = NetworkDiscoveryUtil.netmaskToCidr(NetworkDiscoveryUtil.convertIntIpToDotRepresentation(netmask));
	return netmaskCidr < 31 && ipAddress == (0xFFFFFFFF & networkAddress);
}

NetworkDiscoveryUtil.stringIpToInt = function(ip) {
	if (!ip)
		return '';

	if (typeof ip === 'string' || ip instanceof String) {
		var octets = ip.split('.');
		return (((+octets[0])<<24)+((+octets[1])<<16)+((+octets[2])<<8)+(+octets[3]));
	}

	return ip;
}

NetworkDiscoveryUtil.doesIpContainedInNetwork = function(ip, mask, network) {
	return (network == (ip & mask)) &&
		(!NetworkDiscoveryUtil.isBroadcastAddress(ip,mask));
}

NetworkDiscoveryUtil.getNetworkFromIpAndMask = function(address,netmask){

	var networkAsInt = '';

	if(address && netmask){
		var addressAsLong = NetworkDiscoveryUtil.stringIpToInt(address);
		var netmaskAsLong = NetworkDiscoveryUtil.stringIpToInt(netmask);

		networkAsInt = (addressAsLong & netmaskAsLong);
	}

	return networkAsInt;
}

NetworkDiscoveryUtil.netmaskToCidr = function (netmask) {
	var cidr = 0;
	var parts = netmask.split('.');
	var part;
	for (var i=0; i < parts.length; i++) {
		part = Number(parts[i]);
		while (0x80 == (part & 0x80)) {
			++cidr;
			part = part << 1 & 0xff;
		}
	}
	return(String(cidr));
}

NetworkDiscoveryUtil.extractFirstMatchWithRegex = function(stringToMatch,regex)
{
	var regexObject = new RegExp(regex);
	var match = stringToMatch.match(regexObject);
	return match ? match[1] : null;
}

NetworkDiscoveryUtil.dottedIpv6toHex = function(dottedIpv6){
	var groupAsString = '';
	var partAsInt;
	var partAsString;
	var ipv6Hex = '';
	var parts;

	if (dottedIpv6 == null){
		return null;
	}

	parts = dottedIpv6.split(".");

	if (parts.length != 16){
		return null;
	}

	for (var i=0; i < parts.length; i++) {
		partAsString = parts[i];
		partAsInt = parseInt(partAsString);

		if (partAsString > 255 ||  partAsString < 0)
			return null;

		groupAsString += partAsInt.toString(16);

		if (i%2 == 1) {
			if(parseInt(groupAsString) == 0){
				groupAsString = '';
			}

			ipv6Hex += groupAsString + ":";
			groupAsString = '';
		}
	}
	return (ipv6Hex.slice(0,-1));
}

NetworkDiscoveryUtil.netmaskFromCidrBitCount = function(bitCount) {
	var mask=[],
		i;

	for(i = 0; i < 4; i++) {
		var n = Math.min(bitCount, 8);
		mask.push(256 - Math.pow(2, 8 - n));
		bitCount -= n;
	}
	return mask.join('.');
}

NetworkDiscoveryUtil.convertIntIpToDotRepresentation = function(ipAsInt) {
	return [
		(ipAsInt >>> 24) & 0xFF,
		(ipAsInt >>> 16) & 0xFF,
		(ipAsInt >>>  8) & 0xFF,
		(ipAsInt >>>  0) & 0xFF
	].join('.');
}

NetworkDiscoveryUtil.numIpsFromCidrBitCount = function(bitCount) {
	return (Math.pow(2, 32 - bitCount) - 2);
}

NetworkDiscoveryUtil.calculateBroadcastAddress = function(network, netmask) {
	var ipAsInt = NetworkDiscoveryUtil.stringIpToInt(network),
		netmaskAsInt = NetworkDiscoveryUtil.stringIpToInt(netmask),
		broadcastAsInt = (ipAsInt | ~netmaskAsInt) >>> 0; //to make it unsign

	return NetworkDiscoveryUtil.convertIntIpToDotRepresentation(broadcastAsInt);
}

NetworkDiscoveryUtil.calculateNetworkAddress = function(network, netmask) {
	var ipAsInt = NetworkDiscoveryUtil.stringIpToInt(network),
		netmaskAsInt = NetworkDiscoveryUtil.stringIpToInt(netmask),
		networkAsInt = (ipAsInt & netmaskAsInt) >>> 0; //to make it unsign

	return NetworkDiscoveryUtil.convertIntIpToDotRepresentation(networkAsInt);
}

NetworkDiscoveryUtil.prototype = {
	type: "NetworkDiscoveryUtil"
};
