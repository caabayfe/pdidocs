if (current.type == 'IP Address Range') {
    if (SncIPAddress.isV4(current.start_ip_address) 
            && SncIPAddress.isV4(current.end_ip_address)) {

		var startIP = new SncIPAddressV4(current.start_ip_address);
		var endIP = new SncIPAddressV4(current.end_ip_address);
		
		// Swap if startIP > endIP
		if (startIP.getAddressAsLong() > endIP.getAddressAsLong()) {
			var swap = startIP;
			startIP = endIP;
			endIP = swap;
		}

        current.start_ip_address = startIP.getAddressAsString(); 
        current.end_ip_address = endIP.getAddressAsString(); 
    } else {
        checkIPAddress('Starting IP Address', current.start_ip_address);
        checkIPAddress('Ending IP Address', current.end_ip_address);
    }
} else if (current.type == 'IP Network') {
    var network = current.network_ip + '/' + current.netmask;
    if (SncIPNetworkV4.validate(network)) {
        var nw = new SncIPNetworkV4(network);
        var nwa = nw.getAddress().getAddressAsString();
        var nwm = nw.getNetmask().getAddressAsNormalizedString();
        current.network_ip = nwa;
        current.netmask = nwm;
    } else {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Network specification is invalid'));
        gs.addErrorMessage(SncIPNetworkV4.getError(network));
        gs.addErrorMessage(gs.getMessage('Examples of valid IP addresses include: 10.23.54.2, 235.1.1.35, 25.255.255.250, 56F34AB0 <i>hex address form</i>'));
        gs.addErrorMessage(gs.getMessage('Examples of valid network masks include the above plus: 24 <i>(same as 255.255.255.0)</i>'));
    }
}

function checkIPAddress( desc, addx ) {
    if (!SncIPAddress.isV4(addx)) {
        current.setAbortAction(true);
        gs.addErrorMessage(desc + ' is invalid!');
        gs.addErrorMessage(SncIPAddressV4.getError(addx));
        gs.addErrorMessage(gs.getMessage('Examples of valid IP addresses include: 10.23.54.2, 235.1.1.35, 25.255.255.250, 56F34AB0 <i>hex address form</i>'));
    }
}
