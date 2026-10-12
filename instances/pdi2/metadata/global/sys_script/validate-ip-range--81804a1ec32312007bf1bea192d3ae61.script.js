(function executeRule(current, previous /*null when async*/) {

	var range = current.range;
	if (JSUtil.nil(range)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Range cannot be empty'));
	}

	var ipAddress = SncIPAddressV4;
	var ipNetwork = SncIPNetworkV4;
	var ipRange   = SncIPRangeV4;
	var validRange = true;
	var invalidIpElements = [];
	var validIpElements = [];
	var ipElements = range.split(',');
	var i;
	for (i = 0; i < ipElements.length; i++) {
		var ipElement = ipElements[i];

		var isNetwork = ipNetwork.getIPNetworkInstance(ipElement);
		if (isNetwork) {
			validIpElements.push(isNetwork);
			continue;
		}

		var isRange = ipRange.getIPRangeV4Instance(ipElement);
		if (isRange) {
			validIpElements.push(isRange);
			continue;
		}

		var isAddress = ipAddress.getIPAddressV4Instance(ipElement);
		if (isAddress) {
			validIpElements.push(isAddress);
			continue;
		}

		validRange = false;
		invalidIpElements.push(ipElement);
	}

	if (!validRange) {
		current.setAbortAction(true);
		for (i = 0; i < invalidIpElements.length; i++) {
			gs.addErrorMessage(gs.getMessage('invalid range format', invalidIpElements[i]));
		}
	}

	current.range = validIpElements.join(",");


})(current, previous);
