(function executeRule(current, previous) {
	var abortDelete = false;

	if (current.type == 'group') {
		var sys_id = current.document;
		var table = current.table;
		var gr = new GlideRecord(table);
		gr.addQuery('sys_id', sys_id);
		gr.query();

		if (gr.next() && gr.state) {
			var state = gr.state;
			/* by default for any state it would be sys_updated_on, for state = resolved,cancelled,closed, if closed_at exists we consider that */
			var pastDate = gr.sys_updated_on;
			if (state == 6 || state == 7 || state == 8) {
				pastDate = gr.closed_at || gr.sys_updated_on;
			}
			var curDate = new GlideDateTime();
			var timeDiff = GlideDateTime.subtract(
				curDate,
				new GlideDateTime(pastDate)
			);
			var timeDiffDays = parseInt(
				Math.abs(timeDiff.getNumericValue()) / 86400000
			);

			if (timeDiffDays <= 90) {
				abortDelete = true;
			}
		}
	}

	if (abortDelete) {
		//abort the delete operation
		current.setWorkflow(false);
		current.setAbortAction(true);
	} else {
		if (current.type == 'group') {
			var lfFeed = new LiveFeedFeed();
			if (current.getValue(lfFeed.PUBLIC_CONVERSATION) == false) {
				lfFeed.deleteConversationMessages(current.sys_id);
				var favorite = new LiveFeedFavorite();
				favorite.deleteFavorites(lfFeed.LIVE_CONVERSATION, current.sys_id);
			}
			lfFeed.deleteConversationMembers(current.sys_id);
		} else if (current.type == 'team') {
			var lfTeam = new LiveFeedTeam();
			lfTeam.deleteGroupMembers(current.sys_id);
			lfTeam.deleteGroupConversations(current.sys_id);
			var favorite = new LiveFeedFavorite();
			favorite.deleteFavorites(lfTeam.LIVE_TEAM, current.sys_id);
		}
	}
})(current, previous);
