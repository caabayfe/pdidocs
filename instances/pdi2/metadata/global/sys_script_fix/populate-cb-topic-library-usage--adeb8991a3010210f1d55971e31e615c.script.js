var gr = new GlideRecord("sys_cs_topic_library_usage");
gr.addQuery("calling_cs_topic_id.model_type", "llm");
gr.query();
var hash = {}; // use a hash to keep track of what we're going to insert and remove duplicates before we insert
while (gr.next()) {
    var calling_cb_topic = gr.calling_cs_topic_id.cb_topic_id;
    var library_cb_topic = gr.library_cs_topic_id.cb_topic_id;
    if (calling_cb_topic && library_cb_topic) { //eliminate bad references
        if (!hash.hasOwnProperty([calling_cb_topic, library_cb_topic])) {
            hash[[calling_cb_topic, library_cb_topic]] = true; // add to hash; use calling topic + library topic id as the key
            var cbTopicLibraryUsageGr = new GlideRecord("sys_cb_topic_library_usage");
            cbTopicLibraryUsageGr.setValue('calling_cb_topic_id', calling_cb_topic);
            cbTopicLibraryUsageGr.setValue('library_cb_topic_id', library_cb_topic);
            cbTopicLibraryUsageGr.insert();
            gs.info("Populating sys_cb_topic_library_usage. " + calling_cb_topic + "," + library_cb_topic);
        }
    }
}
