function(cidata, result, scanner, status, midServer, sensor) {
    var resolvedHostname = scanner.hostName;
    var sourceAddress = result.ip;
    var resolvedDomain = scanner.domainName;

    handleScanCI(cidata, resolvedHostname, sourceAddress, resolvedDomain);
        
    function handleScanCI(cidata, resolvedHostname, sourceAddress, resolvedDomain) {
        if (!JSUtil.nil(resolvedHostname)) {
            var hn = new HostnameJS();
			
			var dl = sensor.getLogger();
			dl.setSource("wins Port Probe script");
			hn.setLogger(dl);			
			
            cidata.getData()['name'] = hn.format(resolvedHostname);
        }
        if (!JSUtil.nil(resolvedDomain)) {
            cidata.getData()['os_domain'] = resolvedDomain;
        }
    }
}
