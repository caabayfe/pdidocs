(function executeRule(current, previous /*null when async*/) {
	var agg = new GlideAggregate("sys_email_reply_separator");
	agg.addActiveQuery();
	agg.addAggregate("COUNT");
	agg.query();
	var count = 0;
	if (agg.next())
		count = agg.getAggregate("COUNT");

	var maxReplySeparators = parseInt(gs.getProperty('glide.email_reply_parser.max_active_reply_separators', 100));
	if (count >= maxReplySeparators) {
		gs.addErrorMessage(gs.getMessage('Number of active email reply separators has exceeded maximum value configured in property glide.email_reply_parser.max_active_reply_separators', maxReplySeparators));
		current.setAbortAction(true);
	}
})(current, previous);
