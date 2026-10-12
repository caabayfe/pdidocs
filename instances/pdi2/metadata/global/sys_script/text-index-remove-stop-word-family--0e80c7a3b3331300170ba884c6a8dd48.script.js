(function executeRule(current, previous) {
	if (!gs.nil(current.index))
		new GlideTSUtil().removeFamilyForStopWord(current.word, current.index);
	else if (!gs.nil(current.ts_configuration)) {
		var gr = new GlideRecord('ts_index_name');
		gr.addQuery('table', current.ts_configuration.table);
		gr.query();
		if (gr.next())
			new GlideTSUtil().removeFamilyForStopWord(current.word, gr.getUniqueValue());
	}
})(current, previous);
