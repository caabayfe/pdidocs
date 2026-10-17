var CAPARPayloadBuilder = Class.create();
CAPARPayloadBuilder.prototype = {
    initialize: function() {
        this.logger = CIAnalyticsLogger.getLogger("CAPARPayloadBuilder");
    },

    getTopicPayload: function(event, taskGr, topicTypeGr) {
        var payload = {
            'topic_id': '',
            'cb_topic_id': '',
            'live_agent_transfer': '',
            'topic_completed': '',
            'parent_topic_id': '',
            'topic_category_id': '',
            'created_on': taskGr.getValue('sys_created_on')
        };
        if (event && event['Properties']) {
            if (event['Properties']['Topic Id'])
                payload['topic_id'] = event['Properties']['Topic Id'];
            payload['live_agent_transfer'] = event['Properties']['Live Agent Transfer'] + '';
            payload['topic_completed'] = event['Properties']['Last Node Visited'] + '';
            if (event['Properties']['Parent Topic Id'])
                payload['parent_topic_id'] = event['Properties']['Parent Topic Id'];
        }
        if (topicTypeGr) {
            payload['cb_topic_id'] = topicTypeGr.cb_topic_id + '';
            payload['topic_category_id'] = topicTypeGr.design_category + '';
        }
        return payload;
    },

    getTopicCategoryPayload: function(event, topicCategoryGr, taskGr) {
        var payload = {
            'topic_category_id': '',
            'topic_id': '',
            'cb_topic_id': '',
            'topic_category_completed': '',
            'conversation_end_state': '',
            'live_agent_transfer': '',
            'created_on': taskGr.getValue('sys_created_on')
        };
        if (event && event['Properties'])
            payload['topic_id'] = event['Properties']['Topic Id'] || '';
        if (topicCategoryGr && topicCategoryGr.isValidRecord())
            payload['topic_category_id'] = topicCategoryGr.getUniqueValue();
        if (taskGr && taskGr.topic_type)
            payload['cb_topic_id'] = taskGr.topic_type.cb_topic_id + '';
        if (event && event['Properties'] && (typeof(event['Properties']['Last Node Visited']) !== 'undefined'))
            payload['topic_category_completed'] = event['Properties']['Last Node Visited'] + '';
        if (event && event['Properties'] && event['Properties']['End State'])
            payload['conversation_end_state'] = event['Properties']['End State'] + '';
        if (event && event['Properties'] && event['Properties']['Live Agent Transfer'])
            payload['live_agent_transfer'] = event['Properties']['Live Agent Transfer'] + '';
        return payload;
    },

    getIntentPayload: function(event, topicGr, intentGr, intentFeedBackGr) {
        var payload = {
            'intent_id': '',
            'topic_id': '',
            'cb_topic_id': '',
            'name': event.Name,
            'created_on': intentFeedBackGr.getValue('sys_created_on'),
        };
        if (event && event['Properties']) {
            payload['intent_id'] = event['Properties']['Id'] || '';
            payload['topic_id'] = event['Properties']['Topic Id'] || '';
        }
        if (topicGr)
            payload['cb_topic_id'] = topicGr.cb_topic_id + '';
        return payload;
    },

    getIntegrationHubPayload: function(fdihInvocationGr, apiGr) {
        var payload = {
            'spoke_id': '',
            'action_id': '',
            'topic_id': '',
            'cb_topic_id': '',
            'created_on': fdihInvocationGr.getValue('sys_created_on')
        };
        if (apiGr && apiGr.isValidRecord()) {
            payload['spoke_id'] = apiGr.getValue('sys_scope');
            if (fdihInvocationGr && fdihInvocationGr.isValidRecord()) {
                var type = fdihInvocationGr.getValue('type');
                if (type == 'ACTION')
                    payload['action_id'] = apiGr.getValue('parent_action');
                else if (type == 'SUBFLOW')
                    payload['action_id'] = apiGr.getUniqueValue();
                if (fdihInvocationGr.calling_cs_conversation_task && fdihInvocationGr.calling_cs_conversation_task.topic_type) {
                    payload['topic_id'] = fdihInvocationGr.calling_cs_conversation_task.topic_type + '';
                    payload['cb_topic_id'] = fdihInvocationGr.calling_cs_conversation_task.topic_type.cb_topic_id + '';
                }
            }
        }
        return payload;
    },

    getActionableNotificationPayload: function(event, rec) {
        var payload = {
            state: '',
            created_on: rec.getValue('sys_created_on')
        };
        if (event && event['Properties'])
            payload['state'] = event['Properties']['State'] || '';
        return payload;
    },

    getIARPayload: function(event, autoResolutionContextGr) {
        var payload = {
            acceptance_id: '',
            usage_status: '',
            topic_id: '',
            created_on: autoResolutionContextGr.getValue('sys_created_on'),

        };
        if (event && event['Properties']) {
            payload['acceptance_id'] = event['Properties']['Acceptance Rate'] || '';
            payload['usage_status'] = event['Properties']['Usage'] || '';
        }
        if (autoResolutionContextGr && autoResolutionContextGr.matched_topic)
            payload['topic_id'] = autoResolutionContextGr.matched_topic + '';
        return payload;
    },

    type: 'CAPARPayloadBuilder'
};
