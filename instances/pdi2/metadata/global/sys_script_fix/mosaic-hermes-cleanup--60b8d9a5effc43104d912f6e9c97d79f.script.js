
    try {
    	gs.info('Hermes cleanup: Executing Hermes cleanup script');
		NAMESPACE_SYS_ID: "a035b909ff823210e1d2ffffffffffbf";
		SCRIPT_CONSUMER_SYS_ID: "cf387220ff757210534bffffffffff39";
		if (sn_one_extend.GenerativeAIUtility.isInstanceOffGlideEnabled()) {
			gs.info('Hermes cleanup: Instance offglide is enabled, so skipping Hermes cleanup');
		} else {
			var kafkaTopicGr = new GlideRecord('sys_kafka_topic');
			kafkaTopicGr.addQuery("name", "log");
			kafkaTopicGr.addQuery("namespace", this.NAMESPACE_SYS_ID);
			kafkaTopicGr.query();

			var kafkaStreamGr = new GlideRecord('sys_kafka_stream');
			kafkaStreamGr.addQuery("name", "Mosaic Stream");
			kafkaStreamGr.addQuery("kafka_etl_consumer", this.SCRIPT_CONSUMER_SYS_ID);
			kafkaStreamGr.query();

			if (kafkaTopicGr.hasNext() || kafkaStreamGr.hasNext()) {
				gs.info('Hermes cleanup: sys_kafka_topic or sys_kafka_stream records exist, skipping Hermes cleanup');
			} else {
				// do the cleanup
				var serviceSysId = '4b33ba24ff063210e1d2ffffffffffd2';

				var serviceGr = new GlideRecord('sys_service');
				if (serviceGr.isValid()) {
					if (serviceGr.get(serviceSysId)) {
						// Delete associated sys_service_endpoint records first
						var endpointGr = new GlideRecord('sys_service_endpoint');
						endpointGr.addQuery('service', serviceSysId);
						endpointGr.query();
						while (endpointGr.next()) {
							gs.info('Hermes cleanup: Deleting sys_service_endpoint record: ' + endpointGr.getUniqueValue());
							endpointGr.deleteRecord();
						}

						// Delete the sys_service record
						gs.info('Hermes cleanup: Deleting sys_service record: ' + serviceSysId);
						serviceGr.deleteRecord();
					} else {
						gs.info('Hermes cleanup: sys_service record not found for sys_id: ' + serviceSysId);
					}
				}
			}
		}
	} catch (e) {
		// ignore
	}
