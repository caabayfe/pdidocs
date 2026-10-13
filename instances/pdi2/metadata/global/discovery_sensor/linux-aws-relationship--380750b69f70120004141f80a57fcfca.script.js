new DiscoverySensor({
	process: function(result) {
		this.prepareJSON(result);
		
		if(related_data){
			current.virtual = 'true';
			var vmGlideRecord = DiscoveryAWSRelationshipSensor.findAndCreateRelationToVM(related_data.account_id, related_data.region, related_data.instance_id, this.getCmdbCi(), this.getEccQueueId());
			
			if(vmGlideRecord && vmGlideRecord.getRowCount() > 0)
				current.correlation_id = vmGlideRecord.getValue('object_id');
			
			current.object_id = related_data.instance_id;
		}
	}
});
