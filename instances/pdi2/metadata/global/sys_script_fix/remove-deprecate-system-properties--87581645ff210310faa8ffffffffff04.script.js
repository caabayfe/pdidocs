var propNames = [
    'glide.cache.size.MacMessageBatchingSessionCache',
    'glide.cache.size.MessageBatchingSessionCache',
    'com.glide.cs.message_batching_size_limit',
    'com.glide.cs.conversation.entity.cache.enabled'
];

var gr = new GlideRecord("sys_properties");
gr.addQuery('name', 'IN', propNames);
gr.query();

if (gr.getRowCount() <= 4) {
    gr.deleteMultiple();
} else {
    gs.log('Safety check failed: Found ' + gr.getRowCount() + ' records, expected max 4', 'DeleteSysProps');
}
