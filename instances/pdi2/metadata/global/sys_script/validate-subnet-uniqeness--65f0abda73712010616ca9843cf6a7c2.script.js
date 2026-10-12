(function executeRule(current, previous /*null when async*/ ) {

    // Validate Network IP
    if (GlideStringUtil.nil(current.network_ip)) {
        gs.addErrorMessage(gs.getMessage("Empty Network IP."));
        current.setAbortAction(true);
        return false;
    }

    // Validate Netmask
    if (GlideStringUtil.nil(current.netmask)) {
        gs.addErrorMessage(gs.getMessage("Empty Netmask."));
        current.setAbortAction(true);
        return false;
    }

    // Validate the network with Network IP and  Netmask.
	var nw = SncIPNetwork.fromStringAndPrefix(current.network_ip, current.netmask);
    if (GlideStringUtil.nil(nw)) {
        gs.addErrorMessage(gs.getMessage("Invalid Subnet record with Network IP '{0}' and Netmask '{1}'", [current.network_ip, current.netmask]));
        current.setAbortAction(true);
        return false;
    }


	var ipSubnetGr = new GlideRecord("sys_ip_address_subnet");
    ipSubnetGr.addQuery("network_ip", current.network_ip);
    ipSubnetGr.addQuery("netmask", current.netmask);
    ipSubnetGr.addQuery("sys_ip_filter_criteria", current.sys_ip_filter_criteria);
    ipSubnetGr.addQuery("sys_id","!=",current.sys_id);
    ipSubnetGr.query();
    // If a Subnet already exist with this network_ip, netmask and sys_ip_filter_criteria then abort the insert/update
    if (ipSubnetGr.next()) {
        gs.addErrorMessage(gs.getMessage("Duplicate Subnet record entry with Network IP and Netmask '{0} - {1}' for this IP Filter. Aborting the operation.", [current.network_ip, current.netmask]));
        current.setAbortAction(true);
    }

})(current, previous);
