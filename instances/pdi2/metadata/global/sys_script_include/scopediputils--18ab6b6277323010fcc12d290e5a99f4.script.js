var ScopedIpUtils = Class.create();
ScopedIpUtils.prototype = {
    initialize: function() {},

    type: 'ScopedIpUtils'
};

ScopedIpUtils.isV4 = function(ip) {
    return SncIPAddressV4.getIPAddressV4FromDDecimal(ip) != null;
};

ScopedIpUtils.isV6 = function(ip) {
    return SncIPAddressV6.get(ip) != null;
};

// If IPv4, return as-is.  If IPv6, return the canonical form
ScopedIpUtils.toString = function(ip) {
    if (global.ScopedIpUtils.isV4(ip))
        return ip;

    return global.ScopedIpUtils.canonical(ip);
};

// Applies to IPv6 only.  If IPv6, return the canonical form.  If IPv4, return as-is.
ScopedIpUtils.canonical = function(ip) {
    var ipv6 = SncIPAddressV6.get(ip);

    if (ipv6 != null)
        return ipv6.toString(); // this currently returns a compressed form and may not meet RFC 5952

    return ip;
};

// Checks whether IP address is v4 or v6 and then check if it is the localhost address 
ScopedIpUtils.isLocalhost = function(ip) {
    var ipAddress = SncIPAddressV4.getIPAddressV4FromDDecimal(ip);
    if (ipAddress == null)
        ipAddress = SncIPAddressV6.get(ip);

    if (ipAddress != null)
        return ipAddress.isLocalhost();

    return false;
};

// Checks whether IP address is v4 or v6 and then check if it is the link-local IP address 
ScopedIpUtils.isLinkLocal = function(ip) {
    var ipAddress = SncIPAddressV4.getIPAddressV4FromDDecimal(ip);
    if (ipAddress == null)
        ipAddress = SncIPAddressV6.get(ip);

    if (ipAddress != null)
        return ipAddress.isLinkLocalAddress();

    return false;
};
