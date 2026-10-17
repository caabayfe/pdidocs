var VAClickMetricsConstants = Class.create();

// Link processor name
VAClickMetricsConstants.LINK_PROCESSOR = 'va_link.do';

// Glide Signals API
VAClickMetricsConstants.GLIDE_SINALS_API = 'GlideSignals_API';

//table name.
VAClickMetricsConstants.TABLE_NAME = 'sys_cs_click_metrics';

// logger name
VAClickMetricsConstants.LOGGER_NAME = 'sn_cs.click_metrics';
VAClickMetricsConstants.LOGGING_CONTEXT = {app: 'CI', track: 'CLICK_METRICS', layer:'Script'};

// State
VAClickMetricsConstants.STATE_READY = 'ready';
VAClickMetricsConstants.STATE_PROCESSED = 'processed';
VAClickMetricsConstants.STATE_EVENT_FIRED = 'event_fired';
VAClickMetricsConstants.STATE_ERROR = 'error';

// Event type
VAClickMetricsConstants.EVENT_TYPE_BOT_OUTPUT = 'bot_output';
VAClickMetricsConstants.EVENT_TYPE_AI_SEARCH = 'ai_search';
VAClickMetricsConstants.EVENT_TYPE_CONTEXTUAL_SEARCH  = 'contextual_search';
VAClickMetricsConstants.EVENT_TYPE_DEFAULT = VAClickMetricsConstants.EVENT_TYPE_BOT_OUTPUT;

// Event name
VAClickMetricsConstants.EVENT_NAME = 'va.click_metrics';
VAClickMetricsConstants.EVENT_TIMESTAMP_NAME = '_event_timestamp';

// processor result
VAClickMetricsConstants.RESULT_STATUS_SUCCESS = 'success';
VAClickMetricsConstants.RESULT_STATUS_ERROR = 'error';

VAClickMetricsConstants.CONVERSATION_ID = 'conversation_id';
VAClickMetricsConstants.CONVERSATION_TASK_ID = 'conversation_task_id';

// Click metrics attribute names.
VAClickMetricsConstants.KEY_NAME = 'Name';
VAClickMetricsConstants.KEY_SEARCH_TYPE = 'Search Type';
VAClickMetricsConstants.KEY_SEARCH_TERM = 'Search Term';
VAClickMetricsConstants.KEY_SEARCH_ID = 'Search Id';
VAClickMetricsConstants.KEY_RESULTS_COUNT = 'Results Count';
VAClickMetricsConstants.KEY_INTENT = 'Intent';
VAClickMetricsConstants.KEY_RESPONSE_TIME = 'Response Time';
VAClickMetricsConstants.KEY_TIME = 'Time';
VAClickMetricsConstants.KEY_LANGUAGE = 'Language';
VAClickMetricsConstants.KEY_RESULT_TYPE = 'Result Type';
VAClickMetricsConstants.KEY_TITLE = 'Title';
VAClickMetricsConstants.KEY_DESCRIPTION = 'Description';
VAClickMetricsConstants.KEY_ORDER = 'Order';
VAClickMetricsConstants.KEY_DATA_SOURCE_TITLE = 'Data Source Title';
VAClickMetricsConstants.KEY_DOCUMENT_ID = 'Document Id';
VAClickMetricsConstants.KEY_DOCUMENT_TABLE = 'Document Table';
VAClickMetricsConstants.KEY_DEFLECTION_LOG_ID = 'Deflection Log Id';
VAClickMetricsConstants.KEY_MODE = 'Mode';
VAClickMetricsConstants.KEY_FEEDBACK_VALUE = 'Feedback Value';
VAClickMetricsConstants.KEY_OUTPUT_TYPE = 'Output Type';
VAClickMetricsConstants.KEY_EXECUTION_MODE = "Execution Mode";
VAClickMetricsConstants.KEY_RESOURCE_LABEL = "Label";
VAClickMetricsConstants.KEY_GRANULAR_FEEDBACK_COMMENTS = "Granular Feedback Comments";
VAClickMetricsConstants.KEY_GRANULAR_FEEDBACK_ANSWERS = "Granular Feedback Answers";
VAClickMetricsConstants.KEY_MESSAGE_BUNDLE_ID = "Granular Message Bundle Id";
VAClickMetricsConstants.KEY_MESSAGE_ID = "Message Id";
VAClickMetricsConstants.KEY_DEFLECTION_LOG_STATE = "DEFLECTION_LOG_STATE";
VAClickMetricsConstants.KEY_GEN_AI_LOG_ID = "Gen AI Log Id";
VAClickMetricsConstants.KEY_AIA_AGENT_EXECUTION_PLAN = "AIA Agent Execution Plan";
VAClickMetricsConstants.KEY_MOSAIC_LLM_INVOCATION_ID = "Mosaic LLM Invocation Id";
VAClickMetricsConstants.KEY_EXPERIENCE = "Experience";
VAClickMetricsConstants.KEY_CHANNEL_TABLE = "Channel Table";
VAClickMetricsConstants.KEY_CHANNEL_ID = "Channel Id";

VAClickMetricsConstants.VALUE_AI_SEARCH ='AI Search';
VAClickMetricsConstants.VALUE_CONTEXTUAL ='Contextual';
VAClickMetricsConstants.VALUE_GENIUS_CARD ='AI Search - Genius';
VAClickMetricsConstants.VALUE_AI_SEARCH_RESULT ='AI Search - Standard';

VAClickMetricsConstants.VALUE_EXECUTION ='EXECUTION';
VAClickMetricsConstants.VALUE_EXECUTION_MODE ='Auto';

VAClickMetricsConstants.VALUE_SEARCH_TRIGGERED = 'SEARCH_TRIGGERED';
VAClickMetricsConstants.VALUE_SEARCH_RESULT_DISPLAYED = 'SEARCH_RESULT_DISPLAYED';
VAClickMetricsConstants.VALUE_SEARCH_RESULT_CLICKED = 'SEARCH_RESULT_CLICKED';
VAClickMetricsConstants.VALUE_SEARCH_COMPLETED_EVENT = 'SEARCH_COMPLETED_EVENT';
VAClickMetricsConstants.VALUE_SEARCH_FALLBACK_EVENT = 'SEARCH_FALLBACK_EVENT';
VAClickMetricsConstants.VALUE_SEARCH_CATALOG_REQUESTED_EVENT = 'SEARCH_CATALOG_REQUESTED_EVENT';

VAClickMetricsConstants.VALUE_BOT_OUTPUT_CREATED = 'BOT_OUTPUT_CREATED';
VAClickMetricsConstants.VALUE_BOT_OUTPUT_LINK_DISPLAYED = 'BOT_OUTPUT_LINK_DISPLAYED';
VAClickMetricsConstants.VALUE_BOT_OUTPUT_LINK_CLICKED = 'BOT_OPUTPUT_LINK_CLICKED';
VAClickMetricsConstants.KEY_CORRELATION_ID = 'Correlation Id';
VAClickMetricsConstants.VALUE_FEEDBACK = 'FEEDBACK';
VAClickMetricsConstants.OUTPUT_TYPE_SYNTHESIZED_VALUE = 'Synthesized';
VAClickMetricsConstants.OUTPUT_TYPE_CITATION_VALUE = 'Citation';
VAClickMetricsConstants.OUTPUT_TYPE_SOURCES_VALUE = 'Sources';

VAClickMetricsConstants.DATA_SOURCE_KNOWLEDGE = 'Knowledge';
VAClickMetricsConstants.SCHEDULED_JOB_NAMES = ['Process VA Click Metrics for AI Search', 'Process VA Click Metrics for AI Search', 'Process VA Click Metrics for Bot Output'];

VAClickMetricsConstants.CLICK_METRICS_EVENT_ENABLED_PROP_NAME = 'com.glide.cs.click_metrics.event_enabled';
