var StreamConnectUtils = Class.create();
StreamConnectUtils.prototype = {
    initialize: function() {
    },

    deleteInactiveStream: function(etlConsumerGR) {
        var consumerSysId = etlConsumerGR.sys_id.toString();

        var streamGR = new GlideRecord('sys_kafka_stream');
        streamGR.addQuery('kafka_etl_consumer', consumerSysId);
        streamGR.addQuery('active', true);
        streamGR.query();

        if (streamGR.next()) {
            etlConsumerGR.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("You cannot delete a consumer that has an active Kafka Stream."));
            gs.setRedirect(etlConsumerGR.sys_class_name.toString() + ".do?sys_id=" + consumerSysId);
            return false;
        }

        streamGR = new GlideRecord('sys_kafka_stream');
        streamGR.addQuery('kafka_etl_consumer', consumerSysId);
        streamGR.deleteMultiple();

        return true;
    },

    hasHermesTopic: function(topicAliasSysId) {
        var gr = new GlideRecord("sys_kafka_topic_m2m_sys_sc_topic_alias");
        if (!gr.isValid()) {
            return false;
        }
        gr.addQuery("sc_topic_alias", topicAliasSysId);
        gr.query();
        return gr.next();
    },

    hasDirectKafkaTopic: function(topicAliasSysId) {
        var gr = new GlideRecord("sys_kafka_direct_topic");
        if (!gr.isValid()) {
            return false;
        }
        gr.addQuery("sc_topic_alias", topicAliasSysId);
        gr.query();
        return gr.next();

    },

    isTopicAliasConnected: function(current) {
        return this.hasDirectKafkaTopic(current.sys_id) || this.hasHermesTopic(current.sys_id);
    },

    getUnlinkedUnderlyingTopicRefQuery: function (underlyingTable) {
        if (!underlyingTable)
            return '';

        if (underlyingTable == 'sys_kafka_direct_topic') {
            return 'sc_topic_aliasISEMPTY';
        }

        if (underlyingTable == 'sys_kafka_topic') {
            var mm = new GlideRecord('sys_kafka_topic_m2m_sys_sc_topic_alias');
            if (!mm.isValid())
                return '';

            mm.addNotNullQuery('hermes_topic');
            mm.query();

            var seen = {};
            while (mm.next()) {
                var topicId = mm.getValue('hermes_topic');
                if (topicId) {
                    seen[topicId] = true;
                }
            }

            var ids = Object.keys(seen);
            if (ids.length > 0) {
                return 'sys_idNOT IN' + ids.join(',');
            }
        }

        return '';
    },

    



    type: 'StreamConnectUtils'
};
