var StreamConnectTopicAliasLinker = Class.create();
StreamConnectTopicAliasLinker.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    linkDirectKafkaTopic: function() {
        var underlyingTopicSysID = this.getParameter('sysparm_underlying_topic_sys_id');
        var topicAliasSysID = this.getParameter('sysparm_topic_alias_sys_id');
        
        var gr = new GlideRecordSecure('sys_kafka_direct_topic');
        gr.addQuery("sys_id", underlyingTopicSysID);
        gr.query();
        if (gr.next()) {
            gr.setValue('sc_topic_alias', topicAliasSysID);
            gr.update();
        }
    },

    linkHermesTopic: function() {
        var underlyingTopicSysID = this.getParameter('sysparm_underlying_topic_sys_id');
        var topicAliasSysID = this.getParameter('sysparm_topic_alias_sys_id');
        
        var m2m = new GlideRecordSecure('sys_kafka_topic_m2m_sys_sc_topic_alias');
        m2m.initialize();
        m2m.setValue('hermes_topic', underlyingTopicSysID); 
        m2m.setValue('sc_topic_alias', topicAliasSysID);
        m2m.insert();
    },

    unlinkDirectKafkaTopic: function() {
        var topicAliasSysID = this.getParameter('sysparm_topic_alias_sys_id');
        var gr = new GlideRecordSecure('sys_kafka_direct_topic');
        gr.addQuery('sc_topic_alias', topicAliasSysID);
        gr.query();
        if (gr.next()) {
            gr.setValue('sc_topic_alias', '');
            gr.update();
        }
    
    },

    unlinkHermesTopic: function() {
        var topicAliasSysID = this.getParameter('sysparm_topic_alias_sys_id');
        var gr = new GlideRecordSecure('sys_kafka_topic_m2m_sys_sc_topic_alias');

        gr.addQuery('sc_topic_alias', topicAliasSysID);
        gr.query();
        if (gr.next()) {
            gr.deleteRecord();
        }
    },

    type: 'StreamConnectTopicAliasLinker'
});
