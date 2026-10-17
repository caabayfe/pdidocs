cancelDiscovery(current);

function cancelDiscovery(current){
	var dac =  new SncDiscoveryCancel();
	if (JSUtil.nil(current.range_assign_status) && 
		JSUtil.nil(current.subnet_discovery_status)) {
		current.state = 'Canceled';
		current.update();
	} else if (JSUtil.nil(current.range_assign_status) &&
			   !JSUtil.nil(current.subnet_discovery_status)) {
		dac.cancelAll(current.subnet_discovery_status);
	} else if (!JSUtil.nil(current.range_assign_status)){
		dac.cancelAll(current.range_assign_status);
	}
}
