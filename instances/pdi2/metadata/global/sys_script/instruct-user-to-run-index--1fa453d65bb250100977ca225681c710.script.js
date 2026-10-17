(function executeRule(current, previous /*null when async*/ ) {

    if (current.type == "external")
        return;

    var gr = new GlideRecord("ais_ingest_datasource_stats");
    gr.addQuery("datasource", current.source);
    gr.query();
    if (!gr.next()) {
		gs.addInfoMessage(gs.getMessage("This Indexed Source has never been fully processed. Click &quot;Index All Tables&quot; to ensure the content is available to be searched"));
    }

})(current, previous);
