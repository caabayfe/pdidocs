var SnapshotComparisonAjax = Class.create();

SnapshotComparisonAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	process : function() {
		var source = this.getParameter("sysparm_ajax_processor_source");
		var sourceTable = this.getParameter("sysparm_ajax_processor_source_table");
		var eventType = this.getParameter("sysparm_ajax_processor_event_type");
		var patternId = this.getParameter("sysparm_ajax_processor_pattern_id");
		var table = this.getParameter("sysparm_ajax_processor_table");

		var gr = new GlideRecordSecure(table);
		if (!gr.get(patternId))
			return null;

		var hash = gr.getValue('hash');
		return new SNC.IndexSuggestionAPI().evaluate(source, sourceTable, eventType, hash, table);
	},

    type: 'SnapshotComparisonAjax'
});
