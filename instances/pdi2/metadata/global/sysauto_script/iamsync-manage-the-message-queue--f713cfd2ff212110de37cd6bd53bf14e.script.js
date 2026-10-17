var TABLENAME = "iamsync_message";
var now = new GlideDateTime();
var gr = new GlideRecord(TABLENAME);
gr.addQuery('queue_expiration', '<', now ).addOrCondition('state','ack').addOrCondition('state','terminated');
gr.deleteMultiple();

//Moving the message back to ready state if claimed message is not processed in 1 hr. Reason could be instance failure.
var gdt = new GlideDateTime();
gdt.addSeconds(-3600);
gr = new GlideRecord(TABLENAME);
gr.addQuery('state', 'claimed' );
gr.addQuery('claimed', '<', gdt );
gr.setValue('state', 'nack');
gr.updateMultiple();
