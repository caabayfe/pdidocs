var AISearchConstants = Class.create();

AISearchConstants.USER_ID = 'userId';
AISearchConstants.SESSION_ID = 'sessionId';
AISearchConstants.APPLICATION_ID = 'applicationId';
AISearchConstants.APPLICATION_ID_GLOBAL = 'global';
AISearchConstants.APPLICATION_TYPE = 'applicationType';
AISearchConstants.APPLICATION_TYPE_AI_SEARCH = 'AISearchApplication';
AISearchConstants.SEARCH_CONTEXT_CONFIG_ID = 'searchContextConfigId';
AISearchConstants.QUERY_TERM = 'queryTerm';
AISearchConstants.SEARCH_PROFILE = 'searchProfile';
AISearchConstants.SEARCH_CONTEXT_CONFIG_ID = 'searchContextConfigId';
AISearchConstants.QUERY_LANGUAGE = 'queryLanguage';
AISearchConstants.LANGUAGE = 'language';

AISearchConstants.MATCHED_QEURY_INTENTS = 'matchedQueryIntents';
AISearchConstants.MATCHED_GENIUS_RESULT_INTENTS = 'matchedGeniusResultIntents';
AISearchConstants.MATCHED_INTENTS_PER_SOURCE = 'matchedIntentsPerSource';
	
AISearchConstants.RESPONSE_TIME_IN_MS = 'responseTimeInMs';
AISearchConstants.RECORD_ID = 'recordId';
AISearchConstants.TABLE_NAME = 'tableName';
AISearchConstants.RESULT_TYPE = 'resultType';
AISearchConstants.CARD_TYPE = 'cardType';


AISearchConstants.RESULT_TYPE_GENIUS = 'GENIUS';
AISearchConstants.RESULT_TYPE_SEARCH = 'REGULAR';

AISearchConstants.EVENT_TYPE_SEARCH_EVENT = 'SEARCH_EVENT';
AISearchConstants.RESULT_EVENT_TYPE_GENIUS = 'GENIUS_RESULT_EVENT';
AISearchConstants.RESULT_EVENT_TYPE_SEARCH = 'SEARCH_RESULT_EVENT';

AISearchConstants.RESULT_SYS_ID = 'resultSysId';
AISearchConstants.LABEL_DESCRIPTION = 'labelDescription';
AISearchConstants.SOURCE_TABLE = 'sourceTable';
AISearchConstants.AIS_DOC_ID = 'aisDocId';
AISearchConstants.DATA_SOURCE_TABLE = 'ais_datasource';

AISearchConstants.ACTION_TYPE = 'actionType';
AISearchConstants.ACTION_ID = 'actionId';
AISearchConstants.ACTION_VALUE = 'actionValue';


AISearchConstants.SIGNAL_TYPE  = 'signalType';
AISearchConstants.SIGNAL_VALUE = 'signalValue';
AISearchConstants.SOURCE_URL = 'sourceUrl';
AISearchConstants.CATALOG_SOURCE_TABLE = 'sc_cat_item';
AISearchConstants.CLICK_ACTION_SIGNAL_TYPE = 'CLICK';

AISearchConstants.DEFAULT_GENIUS_SEARCH_RESULT_LIMIT = 1; // arbitrarily set max number
AISearchConstants.DEFAULT_SEARCH_RESULT_LIMIT = 3; // arbitrarily set max number

AISearchConstants.DATA_SOURCE_TABLE = 'ais_datasource';
AISearchConstants.SEARCH_ANALYTICS_PAYLOAD = 'searchAnalyticsPayload';

AISearchConstants.AI_SEARCH_CARD_TO_ADAPTER_CARD_MAP_TABLE = "sys_cs_aisearch_card_to_adapter_card_map";

// action type - feedback
AISearchConstants.ACTION_TYPE_FEED_BACK = 'VA_Feedback'; 

// action value
AISearchConstants.FEEDBACK_VALUE_HELPFUL = 'Helpful';
AISearchConstants.FEEDBACK_VALUE_NOT_HELPFUL = ' Not Helpful';
AISearchConstants.FEEDBACK_VALUE_IGNORED = 'Ignored';
AISearchConstants.FEEDBACK_VALUE_ABANDONED_SESSION = 'Abandoned Session';
AISearchConstants.FEEDBACK_VALUE_NEED_HELP = 'Needs Help';

// message table
AISearchConstants.MESSAGE_TABLE_NAME = "sys_cs_message";

// generic feedback value
AISearchConstants.USER_FEEDBACK_VALUE_HELPFUL = "accepted";
AISearchConstants.USER_FEEDBACK_VALUE_NOT_HELPFUL = "rejected";
AISearchConstants.USER_FEEDBACK_VALUE_IGNORED = "ignored";

AISearchConstants.AIS_GENIUS_CONFIG_ID = 'ais_genius_config_id';

// Deflection log constants
AISearchConstants.SYS_CS_DEFLECTION_LOG_TABLE = 'sys_cs_deflection_log';
AISearchConstants.DEFLECTION_STATUS_NO_RESPONSE = 'no_response';
AISearchConstants.DEFLECTION_STATUS_RESOLVED = 'resolved';
AISearchConstants.DEFLECTION_STATUS_NOT_RESOLVED = 'not_resolved';
AISearchConstants.DEFLECTION_STATUS_RESPONSE_PROVIDED = 'response_provided';
AISearchConstants.DEFLECTION_STATUS_DEFAULT = AISearchConstants.DEFLECTION_STATUS_NO_RESPONSE;

AISearchConstants.RESOURCE_TABLE_DEFLECTION_TYPE_MAP = {
    'sc_cat_item': 'catalog',
    'kb_knowledge': 'kb',
    'sys_cs_topic': 'topic'
};

AISearchConstants.DEFLECTION_LOG_SEARCH_MODE_AGENTIC = "agentic";
AISearchConstants.DEFLECTION_LOG_SEARCH_MODE_SEARCH = "search";
AISearchConstants.DEFLECTION_LOG_DEFAULT_SEARCH_MODE = global.AISearchConstants.DEFLECTION_LOG_SEARCH_MODE_SEARCH; 
