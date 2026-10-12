var StreamConnectClientCallableUtils = Class.create();
StreamConnectClientCallableUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    getConsumerUrl: function() {
        var subscriptionSysId = this.getParameter('sysparm_subscription_sysid');
        var gr = new GlideRecordSecure("sys_kafka_subscription");
        if (gr.get(subscriptionSysId)) {
            var consumerTable = gr.getValue("consumer_table");
            var consumerId = gr.getValue("consumer_id");
            var stats = new IHKafkaStats();
            var result = stats.constructConsumerUrl(consumerTable, consumerId, subscriptionSysId);
            return JSON.stringify(result);
        }
        return JSON.stringify({});
    },

    type: 'StreamConnectClientCallableUtils'
});
