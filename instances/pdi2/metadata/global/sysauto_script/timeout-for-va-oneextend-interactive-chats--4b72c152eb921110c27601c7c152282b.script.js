// Check periodically for timed out VA-OneExtend interactive chats.
// Error out the conversation if it has timed out for the specified amount of time
var gr = new GlideRecord('sys_cs_one_extend_invocation');
gr.addNullQuery('response_state');
gr.addNullQuery('timed_out_on');
gr.addNullQuery('cancelled_on');
gr.addNullQuery('outputs_received_on');
gr.addQuery('execution_mode', 'WAIT_FOR_RESPONSE_ASYNC');
gr.query();

while (gr.next()) {
    var time = new GlideDateTime();
    var executionStartTime = new GlideDateTime(gr.getValue('sent_on')).getNumericValue();
    if ((time.getNumericValue() - executionStartTime) > gr.getValue('timeout') * 1000) {
        if ('suspended' == gr.calling_cs_conversation_task.state) {
            sn_cs.VASystemObject.oneExtendTimedOut(gr.getValue('transaction_id'));
        }
        // Always manually mark is as TIMED_OUT, so we never have to revisit this record again
        gr.setValue('response_state', 'TIMED_OUT');
        gr.setValue('timed_out_on', time);
        gr.update();
    }
}
