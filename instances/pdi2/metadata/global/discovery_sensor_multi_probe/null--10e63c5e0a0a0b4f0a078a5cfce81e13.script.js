function(result, ciData, debug, sensor) {
    var output = result.output;
    if (output === null || gs.nil(output))
        return;

    run(output, ciData, debug);

    function run(output, ciData, debug) {
        var ci_data = ciData.getData();
        var uname = output;
        var unameParts = uname.split(/ /);

        var osName = unameParts[0];
        var osHostname = unameParts[1] ? unameParts[1] : "unknown.host";
        var osVersion = unameParts[2] ? unameParts[2] : "";
		if (osName == "AIX" && unameParts[3] && unameParts[2])
			osVersion = unameParts[3] + "." + unameParts[2] + ".0.0"

        ci_data.os_name = osName;
        ci_data.output = output;
		ci_data.os_version = osVersion;

        // Don't bother with ssh hostname ('name') if we shouldn't trust the ssh name and DNS already has already populated it
        var trusted = JSUtil.toBoolean(gs.getProperty("glide.discovery.hostname.ssh_trusted", "false"));
        var haveNow = JSUtil.notNil(ci_data['name']);
        var haveNew = JSUtil.notNil(osHostname);

        // Always set the ci "host_name" regardless of whether ssh is trusted or not.  This is never set from dns.
        ci_data['host_name'] = osHostname;

        if (!haveNew)
            return;

        if (!trusted && haveNow)
            return; 
        
        var hn = new HostnameJS();
		hn.setLogger(sensor.getLogger());		
        ci_data['name'] = hn.format(osHostname, JSUtil.notNil(ciData.ip_address)? ciData.ip_address:null);
    }
}		
