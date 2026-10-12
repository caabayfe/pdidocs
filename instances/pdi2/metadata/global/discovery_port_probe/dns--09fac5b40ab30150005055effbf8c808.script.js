function(cidata, result, scanner, status, midServer, sensor) {
    var resolvedHostname = scanner.hostName;
    var sourceAddress = result.ip;

    if (!JSUtil.nil(resolvedHostname))
        cidata.getData()['dns_name'] = resolvedHostname;

    handleScanCI(cidata, resolvedHostname, sourceAddress);

    function handleScanCI(cidata, resolvedHostname, sourceAddress) {
        var trusted = JSUtil.toBoolean(gs.getProperty("glide.discovery.hostname.dns_nbt_trusted", "false"));
        var haveNow = !JSUtil.nil(cidata.getData()['name']);
        var haveDNS = !JSUtil.nil(resolvedHostname);

        if (!haveDNS)
            return;

        if (haveNow && !trusted)
            return;

        var hn = new HostnameJS();	
		
		var dl = sensor.getLogger();
		dl.setSource("DNS Port Probe script");
		hn.setLogger(dl);
				
        cidata.getData()['name'] = hn.format(resolvedHostname);
        var dname = hn.getDomainName();
        if (JSUtil.notNil(dname))
            cidata.getData()['dns_domain'] = dname;
    }
}
