var IHKafkaStats = Class.create();
IHKafkaStats.prototype = {
    initialize: function() {},

    getConsumeAverage: function(filter, groupID, groupField) {
        return this._getAverage(filter, groupID, 'consumed_messages', groupField);
    },

    getProduceAverage: function(filter, groupID, groupField) {
        return this._getAverage(filter, groupID, 'produced_messages', groupField);
    },

    getQueueAverageSubscription: function(filter, subscriptionID) {
        var totalQueueDepth = 0;
        var partitionGroups = new GlideRecord('sys_kafka_partition_group');
        partitionGroups.addQuery('subscription', subscriptionID);
        partitionGroups.query();
        while (partitionGroups.next()) {
            totalQueueDepth += this.getQueueAverage(filter, partitionGroups.getUniqueValue(), 'partition_group');
        }
        return totalQueueDepth;
    },

    getQueueAverage: function(filter, groupID, groupField) {

        if (groupField == 'subscription') {
            return this.getQueueAverageSubscription(filter, groupID);
        }

        var stat = new GlideAggregate('sys_kafka_consumer_statistics');
        stat.addAggregate('SUM', 'lag_messages');
        stat.addAggregate('COUNT', 'lag_messages');
        stat.addQuery('sys_created_on', '>=', filter);
        stat.addQuery(groupField, groupID);
        stat.groupBy(groupField);
        stat.query();
        if (stat.next()) {

            var totalLag = stat.getAggregate('SUM', 'lag_messages');
            var records = stat.getAggregate('COUNT', 'lag_messages');
            return totalLag / records;
        }

        return 0;
    },

    _getAverage: function(filter, groupID, statField, groupField) {
        var stat = new GlideAggregate('sys_kafka_consumer_statistics');
        stat.addAggregate('SUM', statField);
        stat.addAggregate('MIN', 'sys_created_on');
        stat.addAggregate('MAX', 'sys_created_on');
        stat.addQuery('sys_created_on', '>=', filter);
        stat.addQuery(groupField, groupID);
        stat.groupBy(groupField);
        stat.query();
        if (stat.next()) {
            var start = new GlideDateTime(stat.getAggregate('MIN', 'sys_created_on'));
            var end = new GlideDateTime(stat.getAggregate('MAX', 'sys_created_on'));
            var duration = (end.getNumericValue() - start.getNumericValue()) / 1000 + GlideProperties.getInt('glide.ih.kafka.consumer.log_interval', 60);
            return stat.getAggregate('SUM', statField) / duration;

        }
        return 0;
    },

    getEstimatedQueueDepthTime: function(filter, groupID, groupField) {
        try {
            if (filter == null || groupID == null || groupField == null) {
                return "00:00:00";
            }
            var totalQueueDepth = this.getQueueAverageSubscription(filter, groupID);
            var consumedMessagesPerSecond = this.getConsumeAverage(filter, groupID, groupField);
            if (totalQueueDepth == null || consumedMessagesPerSecond == null ||  totalQueueDepth == 0 || consumedMessagesPerSecond == 0) {
                return "00:00:00";
            }
            var estimatedQueueDepthTime = totalQueueDepth / consumedMessagesPerSecond;
            var hours = Math.floor(estimatedQueueDepthTime / 3600);
            if (hours < 10) {
                hours = "0" + hours.toString();
            }
            var minutes = Math.floor((estimatedQueueDepthTime % 3600) / 60);
            if (minutes < 10) {
                minutes = "0" + minutes.toString();
            }
            var seconds = Math.round(estimatedQueueDepthTime % 60);
            if (seconds < 10) {
                seconds = "0" + seconds.toString();
        }
            return [hours, minutes, seconds].join(':');
        } catch (e) {
            gs.warn("Error in getEstimatedQueueDepthTime: " + e.message);
            return "";
        }
    },

    _constructScriptConsumerLink: function(scriptConsumerSysId) {
        if (!gs.nil(scriptConsumerSysId)) {
            return "sys_kafka_script_consumer.do?sys_id=" + scriptConsumerSysId;
        }
    },

    _constructRTEConsumerLink: function(rteConsumerSysId) {
        gr = new GlideRecord("sys_kafka_rte_consumer");
        if (gr.get(rteConsumerSysId)) {
            robustImportSetTransformerSysId = gr.getValue("robust_import_set_transformer");
            return "sys_robust_import_set_transformer.do?sys_id=" + robustImportSetTransformerSysId;
        }
    },

    _constructTransformMapConsumerLink: function(transformMapConsumerSysId) {
        gr = new GlideRecord("sys_kafka_transform_map_consumer");
        if (gr.get(transformMapConsumerSysId)) {
            sysTransformMapSysId = gr.getValue("transform_map");
            return "sys_transform_map.do?sys_id=" + sysTransformMapSysId;
        }
    },

    _constructFlowTriggerConsumerLink: function(flowTriggerSysId) {
        if (!gs.nil(flowTriggerSysId)) {
            return "now/workflow-studio/builder?table=sys_hub_flow&sysId=" + flowTriggerSysId;
        } 
    },

constructConsumerUrl: function(consumerTable, consumerId, subscriptionSysId) {

    if (!consumerTable) {
        return { url: "", error: gs.getMessage("Consumer Table is null") };
    }

    if (!consumerId) {
        return { url: "", error: gs.getMessage("Consumer Id is null") };
    }

    var gr = new GlideRecord(consumerTable);
    if (!gr.get(consumerId)) {
        return { url: "", error: gs.getMessage("Consumer ID {0} was not found in the Consumer Table {1}.", [consumerId, consumerTable]) };
    }

    var constructUrl = "";
    if (consumerTable == "sys_kafka_flow_trigger") {
        var flowTriggerSysId = gr.getValue("flow");
        constructUrl = this._constructFlowTriggerConsumerLink(flowTriggerSysId);
    }
    
    if (consumerTable == "sys_kafka_stream" && gr.canRead()) {
        var etlConsumerSysId = gr.getValue("kafka_etl_consumer");
        var tableName = gr.kafka_etl_consumer.sys_class_name;
        if (tableName == "sys_kafka_rte_consumer") {
            constructUrl = this._constructRTEConsumerLink(etlConsumerSysId);
        } else if (tableName == "sys_kafka_transform_map_consumer") {
            constructUrl = this._constructTransformMapConsumerLink(etlConsumerSysId);
        } else if (tableName == "sys_kafka_script_consumer") {
            constructUrl = this._constructScriptConsumerLink(etlConsumerSysId);
        } 
    }

    if (!constructUrl) {
        return { url: "", error: gs.getMessage("Unknown Consumer Type") };
    } else {
        return { url: constructUrl, error: "" };
    }
},

    type: 'IHKafkaStats'
};
