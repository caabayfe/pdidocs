
var INTERACTIVE_FDIH_SEND_MESSAGE = gs.getProperty('com.glide.cs.fdih.sendmessage.timeout') || 10; // seconds
var longRunningTimeoutThreshold = new GlideDateTime();
longRunningTimeoutThreshold.addSeconds(-1 * INTERACTIVE_FDIH_SEND_MESSAGE);
var timeOutValue = longRunningTimeoutThreshold.getValue();
var gr = new GlideRecord('sys_cs_ca_message');
gr.addQuery('status', 'processing');
gr.query();
while (gr.next()) {
  if (new GlideDateTime(gr.sys_created_on).getValue() <  timeOutValue) {
	gs.info("Timeout unprocessed VA CCIF Messages: " + gr.getValue("execution_context"));
	sn_cs.VASystemObject.processCustomAdapterFDIHResponseMessage(gr.getValue("execution_context"), "ERROR");
  }
}
