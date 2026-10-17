(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord("ais_publish_history");
    gr.addQuery("document_id", current.sys_id);
    gr.query();
    if (gr.next()) {
        g_scratchpad.last_published = gr.sys_updated_on;
    } else {
        true;
    }
	g_scratchpad.dictionary_id = current.sys_id;

})(current, previous);
