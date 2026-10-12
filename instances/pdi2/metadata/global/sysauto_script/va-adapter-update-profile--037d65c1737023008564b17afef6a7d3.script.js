// Delete all the consumer channel records, inorder to update the latest user profile.
var gr = new GlideRecord('sys_cs_consumer_channel');
gr.query();
gr.deleteMultiple();
