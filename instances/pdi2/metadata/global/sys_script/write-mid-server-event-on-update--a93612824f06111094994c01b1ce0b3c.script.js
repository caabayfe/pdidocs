(function executeRule(current, previous /*null when async*/ ) {
    var clusterName = MIDServerUtil.getClusterName(current.sys_id);
	
    // This happens whenever MID server status changes
    if (previous.status != current.status)
        MIDServerUtil.writeEvent(current.name, clusterName, current.status.toLowerCase());
    // this happens when MID server validation status changes
    if (previous.validated != current.validated) {
		switch(String(current.validated)){
			case 'true':
				MIDServerUtil.writeEvent(current.name, clusterName, 'validated');
				break;
			case 'false':
				MIDServerUtil.writeEvent(current.name, clusterName, 'invalidated');
				break;
			case 'validating':
				MIDServerUtil.writeEvent(current.name, clusterName, 'validating');
				break;
			case 'validation_failed':
				MIDServerUtil.writeEvent(current.name, clusterName, 'validation failed');
				break;
			case 'rekey':
				MIDServerUtil.writeEvent(current.name, clusterName, 'rekey');
				break;
		}   
    }
})(current, previous);
