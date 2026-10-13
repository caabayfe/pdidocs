(function executeRule(current, previous /*null when async*/) {
	var accelRunGlideRecord = new GlideRecord('subnet_accel_run');
	accelRunGlideRecord.query();

	if (accelRunGlideRecord.next() && accelRunGlideRecord.auto_include_new_mids ) { 
		//If application is 'Discovery' no further check needed. However, if its 'ALL'
		//then check for isDiscoveryIncludedInAll
		if (current.application.name == 'Discovery' || 
				isDiscoveryIncludedInAll() ) { 
			if (current.operation() == 'insert')
				SubnetAcceleratorManager.addMidToSelectedList( current.agent,
										accelRunGlideRecord.getUniqueValue());
			else if (current.operation() == 'delete' )
				SubnetAcceleratorManager.removeMidIfNeeded( current.agent,
										accelRunGlideRecord.getUniqueValue());
		}
	}
	
	//Check if Discovery application is included in 'ALL'
	function isDiscoveryIncludedInAll() {
		var gr =  new GlideRecord('ecc_agent_application');
		gr.addQuery('name','Discovery');
		gr.query();
		if (gr.next())
			return gr.included_in_app_all;
		return false;
	}
})(current, previous);
