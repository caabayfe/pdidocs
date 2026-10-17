new DiscoverySensor({
	process: function(result) {
		this.prepareJSON(result);
		if (related_data.warn)
			DiscoveryLogger.warn(related_data.warn, this.getSensorName(), this.getEccQueueId());
		
		if(related_data.host_object_id){
			var vmGlideRecord = DiscoveryAzureRelationshipSensor.findAndCreateRelationToVM(related_data.host_object_id, this.getCmdbCi(), this.getEccQueueId());
			
			if(vmGlideRecord && vmGlideRecord.getRowCount() > 0)
				current.correlation_id = vmGlideRecord.getValue('object_id');
			
			current.object_id = related_data.host_object_id;
		}
	}
});
