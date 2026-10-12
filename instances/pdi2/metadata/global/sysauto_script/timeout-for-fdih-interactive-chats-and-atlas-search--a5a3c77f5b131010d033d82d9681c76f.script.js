// Check periodically for timed out FDIH interactive chats and FDIH AI Search operations
// Error out the conversation if it has timed out for the specified amount of time
var INTERACTIVE_FDIH_TOPIC_TIMEOUT = gs.getProperty('com.glide.cs.fdih.interactive.timeout') || 120; // seconds
var INTERACTIVE_FDIH_AI_SEARCH_TIMEOUT = gs.getProperty('com.glide.cs.fdih.aisearch.timeout') || 10; // seconds
var INTERACTIVE_FDIH_DTAC_TIMEOUT = gs.getProperty('com.glide.cs.dynamic_translation_time_out') || 15; // seconds
var INTERACTIVE_FDIH_UNIFIED_SEARCH_TIMEOUT = gs.getProperty('com.glide.cs.fdih.unified_search.timeout') || 120; // seconds
var INTERACTIVE_FDIH_SYNTHESIZED_SEARCH_TIMEOUT = gs.getProperty('sn_vad_genai.com.glide.cs.fdih.synthesized_search.timeout') || 30; // seconds
var AI_SEARCH_CALL_MECHANISM = gs.getProperty('sn_nowassist_va.ais_call_mechanism') || 'data_broker';
var AI_SEARCH_FD_ACTION_NAME = 'AI Search';
var AI_ASYNC_SEARCH_FD_ACTION_NAME = 'Async Search';
var UNIFIED_ASYNC_SEARCH_FD_ACTION_NAME = 'Async AI Search';

var longRunningTimeoutThreshold = new GlideDateTime();
longRunningTimeoutThreshold.addSeconds(-1 * INTERACTIVE_FDIH_TOPIC_TIMEOUT);

var aiSearchTimeoutThreshold = new GlideDateTime();
aiSearchTimeoutThreshold.addSeconds(-1 * INTERACTIVE_FDIH_AI_SEARCH_TIMEOUT);

var dtacTimeoutThreshold = new GlideDateTime();
dtacTimeoutThreshold.addSeconds(-1 * INTERACTIVE_FDIH_DTAC_TIMEOUT);

var unifiedSearchTimeoutThreshold = new GlideDateTime();
unifiedSearchTimeoutThreshold.addSeconds(-1 * INTERACTIVE_FDIH_UNIFIED_SEARCH_TIMEOUT);

var synthesizedSearchTimeoutThreshold = new GlideDateTime();
synthesizedSearchTimeoutThreshold.addSeconds(-1 * INTERACTIVE_FDIH_SYNTHESIZED_SEARCH_TIMEOUT);

if ("data_broker" == AI_SEARCH_CALL_MECHANISM) {
    // MULTIPLE CALLBACK MODE for Async AI Search -- SPECIAL TIMEOUT LOGIC (in "Data Broker" mode).
    // Timeout a sys_cs_fdih_invocation record where < 2 associated sys_cs_fdih_invocation_callback records.
    var gaMissingCallback = new GlideAggregate('sys_cs_fdih_invocation_callback');
    gaMissingCallback.groupBy('fdih_invocation');
    gaMissingCallback.orderByAggregate('COUNT', 'fdih_invocation');
    gaMissingCallback.addAggregate('COUNT', 'fdih_invocation');
    gaMissingCallback.addHaving('COUNT', 'fdih_invocation', '<', 2);
    gaMissingCallback.addQuery('fdih_invocation.response_state', 'IN', 'COMPLETE, IN_PROGRESS');
    gaMissingCallback.addNotNullQuery('fdih_invocation.callback_id');
    gaMissingCallback.addQuery('fdih_invocation.callback_mode', 'multiple');
    gaMissingCallback.addQuery('fdih_invocation.execution_context.name', UNIFIED_ASYNC_SEARCH_FD_ACTION_NAME);
    gaMissingCallback.addQuery('output_type', 'IN', 'genius_result, regular_result');
    gaMissingCallback.query();
    while (gaMissingCallback.next()) {
        if (gaMissingCallback.fdih_invocation.sent_on < synthesizedSearchTimeoutThreshold.getValue()) {
            sn_cs.VASystemObject.timeoutFDIH(gaMissingCallback.fdih_invocation, gaMissingCallback.fdih_invocation.calling_cs_conversation_task.conversation, gaMissingCallback.fdih_invocation.execution_context.name, 'ERROR_TOPIC');
        }
    }
} else if ("router" == AI_SEARCH_CALL_MECHANISM) {
	var grMissingResponse = new GlideRecord('sys_cs_fdih_invocation');
	grMissingResponse.addNotNullQuery('callback_mode');
	grMissingResponse.addNotNullQuery('callback_id');
	grMissingResponse.addQuery('execution_mode', 'IN', 'WAIT_FOR_RESPONSE');
	grMissingResponse.addQuery('response_state', 'IN_PROGRESS').addOrCondition('response_state', '');
	grMissingResponse.addNullQuery('result');
	grMissingResponse.query();
	while(grMissingResponse.next()) {
		if (grMissingResponse.sent_on < synthesizedSearchTimeoutThreshold.getValue()) {
            sn_cs.VASystemObject.timeoutFDIH(grMissingResponse.getUniqueValue(), grMissingResponse.calling_cs_conversation_task.conversation, grMissingResponse.execution_context.name, 'ERROR_TOPIC');
        }
    }
}

var gr = new GlideRecord('sys_cs_fdih_invocation');
gr.addNullQuery('response_state');
gr.addQuery('execution_mode', 'IN', 'WAIT_FOR_RESPONSE, QUICK_EXECUTE');
gr.addQuery('callback_mode', 'NOT IN', 'multiple'); // do not interfere with MULTIPLE CALLBACK MODE timeout logic (above)
gr.query();

while (gr.next()) {
	if (gr.name == 'DTAC') {
		if (gr.sent_on < dtacTimeoutThreshold.getValue()) {
			sn_cs.VASystemObject.timeoutDTAC(gr.context_id);
		}
	} else if (gr.execution_context.name == UNIFIED_ASYNC_SEARCH_FD_ACTION_NAME) {
		if (gr.sent_on < unifiedSearchTimeoutThreshold.getValue()) {
			sn_cs.VASystemObject.timeoutFDIH(gr.getUniqueValue(), gr.calling_cs_conversation_task.conversation, gr.execution_context.name, 'ERROR_TOPIC');
		}
	} else if ((gr.execution_context.name == AI_SEARCH_FD_ACTION_NAME || gr.execution_context.name == AI_ASYNC_SEARCH_FD_ACTION_NAME)) {
		if (gr.sent_on < aiSearchTimeoutThreshold.getValue()) {
			sn_cs.VASystemObject.timeoutFDIH(gr.getUniqueValue(), gr.calling_cs_conversation_task.conversation, gr.execution_context.name, 'FALLBACK_TOPIC');
		}
	} else if ((gr.execution_context.name != AI_SEARCH_FD_ACTION_NAME && gr.execution_context.name != AI_ASYNC_SEARCH_FD_ACTION_NAME)) {
		if (gr.sent_on < longRunningTimeoutThreshold.getValue()) {
			sn_cs.VASystemObject.timeoutFDIH(gr.getUniqueValue(), gr.calling_cs_conversation_task.conversation, gr.execution_context.name, 'ERROR_TOPIC');
		}
	}
}
