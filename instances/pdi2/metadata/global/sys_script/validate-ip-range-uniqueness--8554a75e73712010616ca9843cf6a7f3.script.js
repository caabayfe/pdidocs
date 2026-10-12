(function executeRule(current, previous /*null when async*/ ) {

    //Validate Start IP
    if (GlideStringUtil.nil(current.start_ip)) {
        gs.addErrorMessage(gs.getMessage("Empty Start IP."));
        current.setAbortAction(true);
        return false;
    }

    // for Single IP, Admins can only set Start IP.
    // Set End IP, with Start IP Value in those scenario
    if (GlideStringUtil.nil(current.end_ip)) {
        current.end_ip = current.start_ip;
    }

    // Validate Start IP and End IP version - they should be of same type either IPv4 or IPv6
    var startIp = SncIPAddress.fromString(current.start_ip);
    var endIp = SncIPAddress.fromString(current.end_ip);

    if (GlideStringUtil.nil(startIp)) {
        gs.addErrorMessage(gs.getMessage("Invalid Start IP."));
		// Reset start_ip as this is invalid
		current.start_ip = "";
        current.setAbortAction(true);
        return false;
    }

    if (GlideStringUtil.nil(endIp)) {
        gs.addErrorMessage(gs.getMessage("Invalid End IP."));
		// Reset end_ip as this is invalid
		current.end_ip = "";
        current.setAbortAction(true);
        return false;
    }

    // If both the IP is NOT of same type then, abort
    if ((startIp.isV4() && endIp.isV6()) || (startIp.isV6() && endIp.isV4())) {
        gs.addErrorMessage(gs.getMessage("Both Start IP and End IP must be either of type IPV4 or type IPV6."));
        current.setAbortAction(true);
        return false;
    }


	var ipRangeGr = new GlideRecord("sys_ip_address_range");
    ipRangeGr.addQuery("start_ip", current.start_ip);
    ipRangeGr.addQuery("end_ip", current.end_ip);
    ipRangeGr.addQuery("sys_ip_filter_criteria", current.sys_ip_filter_criteria);
    ipRangeGr.addQuery("sys_id","!=",current.sys_id);
    ipRangeGr.query();
    // If an IP Range already exist with this start_ip, end_ip and sys_ip_filter_criteria then abort the insert/update
    if (ipRangeGr.next()) {
        gs.addErrorMessage(gs.getMessage("Duplicate IP Range entry with Start IP and End IP '{0} - {1}' for this IP Filter. Aborting the operation.", [current.start_ip, current.end_ip]));
        current.setAbortAction(true);
    }

})(current, previous);
