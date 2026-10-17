var CAPARConstants = Class.create();
CAPARConstants.prototype = {
    initialize: function() {},

    type: 'CAPARConstants'
};

CAPARConstants.CONVERSATION_END_STATES = {
    'User Closed VA – Clicked End/X': '0',
    'System Closed VA – User No Response': '1',
    'System Closed VA – Topic Complete': '2',
    'System Closed VA – Left With AI Search': '3',
    'System closed VA – Auto Closed': '4',
    'System Closed VA – User Never Engaged': '5',
    'User Closed LA – Clicked End/X': '6',
    'System Closed LA – User No Response': '7',
    'System Closed LA – Chat Complete': '8',
    'Agent Closed LA – Clicked End/X': '9',
    'User Closed LA - Before Agent Engagement': '10',
    'System Closed LA – Before Agent Engagement': '11'
};

//Conversation Payload Constants
CAPARConstants.DYNAMICPROPERTIES = 'DynamicProperties';
CAPARConstants.DP_CHANNEL_NAME = 'Channel Name';
CAPARConstants.DP_SELF_SOLVE = 'Self Solve';
CAPARConstants.DP_END_STATE = 'End State';
CAPARConstants.DP_FEEDBACK_RESULT_ID = 'Feedback Result Id';
CAPARConstants.DP_CONVERSATION_TYPE = 'Conversation Type';
CAPARConstants.EVENTS = 'Events';
CAPARConstants.EVENT_TYPE = 'Type';
CAPARConstants.EVENT_TYPE_TOPIC = 'Topic';
CAPARConstants.EVENT_TYPE_TOPIC_CATEGORY = 'Topic Category';
CAPARConstants.EVENT_TYPE_INTEGRATION_HUB = 'Integration Hub';
CAPARConstants.EVENT_TYPE_CUSTOM = 'Custom';
CAPARConstants.EVENT_PROPERTIES = 'Properties';
CAPARConstants.EVENT_PROP_CHANNEL_NAME = 'Channel Name';
CAPARConstants.EVENT_PROP_LAST_VISITED_NODE_NAME = 'Last Visited Node Name';
CAPARConstants.EVENT_PROP_SUB_CATEGORY = 'Sub Category';
CAPARConstants.EVENT_PROP_SPOKE = 'Spoke';
CAPARConstants.LOCALE = 'Locale';
CAPARConstants.ID = 'Id';
CAPARConstants.DURATION = 'Duration';
CAPARConstants.PAR_PAYLOAD = 'par_payload';
CAPARConstants.PAR_PAYLOAD_TOPIC_ID = 'topic_id';
CAPARConstants.PAR_PAYLOAD_TOPIC_TYPE = 'type';
CAPARConstants.PAR_PAYLOAD_TOPIC_CATEGORY_ID = 'topic_category_id';
CAPARConstants.PAR_PAYLOAD_CHANNEL = 'channel';
CAPARConstants.PAR_PAYLOAD_LAST_VISITED_NODE = 'last_visited_node';
CAPARConstants.PAR_PAYLOAD_SPOKE = 'spoke';
CAPARConstants.USER = 'User';
CAPARConstants.USER_Id = 'UserId';


CAPARConstants.BREAKDOWN = {
    NAME: {
        CHANNEL: 'channel',
        LAST_VISITED_NODE: 'last_visited_node',
        SPOKE: 'spoke',
        TYPE: 'type'
    }
};

CAPARConstants.DATA_COLLECTION_JOBS = {
	HISTORICAL_GENERAL: '4e4ee18b77f33110dfe21f130e5a9974',
	HISTORICAL_SEARCH_AND_CUSTOM_EVENTS: 'abb846207734021030f71f130e5a99b9'
}
