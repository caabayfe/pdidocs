new F5FailoverCliSensor({
	processF5Result: function(ci){
		var status = this.status;
		DiscoveryLogger.info('failover status = ' + status, this.getEccQueueId(), null);
		if(status == 'standby')
			ci.data.operational_status=2;
		else
			ci.data.operational_status=1;
	}
});
