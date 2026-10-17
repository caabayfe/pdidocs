(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord("ais_publish_history");
    gr.addQuery("table", current.getTableName());
	gr.addQuery("document_id", current.sys_id);
    gr.query();
    if (!gr.next()) {
		gs.addInfoMessage(gs.getMessage("This Search Profile has never been published. Click &quot;Publish&quot; to ensure its configurations are available"));
    }
})(current, previous);
