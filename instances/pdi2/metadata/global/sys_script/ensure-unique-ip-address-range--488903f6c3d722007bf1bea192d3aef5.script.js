(function executeRule(current, previous) {
    var startIP = new SncIPAddressV4(current.start_ip);
    var endIP = new SncIPAddressV4(current.end_ip);

    // Swap if startIP > endIP
    if (startIP.getAddressAsLong() > endIP.getAddressAsLong()) {
        var swap = startIP;
        startIP = endIP;
        endIP = swap;
    }

    current.start_ip = startIP.getAddressAsString();
    current.end_ip = endIP.getAddressAsString();

    var match = new GlideRecord('ip_address_range');
    match.addQuery('sys_id', '!=', current.sys_id);
    match.addQuery('start_ip', current.start_ip);
    match.addQuery('end_ip', current.end_ip);
    match.addQuery('sys_domain', current.sys_domain);
    match.query();
    if (match.next()) {
        gs.addErrorMessage(gs.getMessage('IP already exists'));
        current.setAbortAction(true);
    }

})(current, previous);
