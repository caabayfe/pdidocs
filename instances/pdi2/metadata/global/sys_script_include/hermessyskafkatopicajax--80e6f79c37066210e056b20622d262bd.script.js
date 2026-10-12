var HermesSysKafkaTopicAjax = Class.create();
HermesSysKafkaTopicAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	isTopicExternal: function() {
		var nameSpaceId = this.getParameter('namespace');
		var gr = new GlideRecordSecure('sys_kafka_namespace');
		if (gr.get(nameSpaceId)) {
			if (gr.getValue('sn_internal') === "0")
				return true;
			return false;
		}
	},

	isSCInstalled: function() {
		return GlidePluginManager().isActive('com.glide.hub.stream_connect.replication.core') ||
		GlidePluginManager().isActive('com.glide.hub.kafka_consumer') ||
		GlidePluginManager().isActive('com.glide.hub.action_step.kafka') ||
		GlidePluginManager.isActive('com.glide.hub.stream_connect.installer');
	},

	hasHermesAppServices: function() {
		var HERMES_SYSID = '2e269051b71201109fed8481de11a9c0';
		var HERMES_INTERNAL_SYSID = 'bfe548804320311041a0e8625ab8f242';
		var gr = new GlideRecord('hermes_app_services');
		gr.addQuery('service_id', HERMES_SYSID).addOrCondition('service_id', HERMES_INTERNAL_SYSID);
		gr.setLimit(1);
		gr.query();
		return gr.hasNext();
	},

    type: 'HermesSysKafkaTopicAjax'
});
