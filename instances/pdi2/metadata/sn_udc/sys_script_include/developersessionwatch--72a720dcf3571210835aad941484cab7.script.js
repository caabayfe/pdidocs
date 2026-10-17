class DeveloperSessionWatch {
	static type = 'DeveloperSessionWatch';
	static TABLE = 'sn_udc_developer_session_watch';
	static Column = {
		SysId: 'sys_id',
		User: 'user',
		WatchType: 'watch_type',
		UpdateSetScope: 'update_set_scope',
	};

	static #WatchType = {
		SessionScope: 'session_scope',
		UpdateSet: 'update_set',
	};

	static getCurrentUpdateSetScopeForUser() {
		let currentUpdateSetScope = {};
		const developerSessionWatchGr = new GlideRecord(DeveloperSessionWatch.TABLE);
		developerSessionWatchGr.addQuery(DeveloperSessionWatch.Column.User, gs.getUserID());
		developerSessionWatchGr.addQuery(
			DeveloperSessionWatch.Column.WatchType,
			DeveloperSessionWatch.#WatchType.UpdateSet
		);
		developerSessionWatchGr.setLimit(1);
		developerSessionWatchGr.query();

		if (developerSessionWatchGr.next()) {
			currentUpdateSetScope = {
				value: developerSessionWatchGr.getValue(
					DeveloperSessionWatch.Column.UpdateSetScope
				),
				displayValue: developerSessionWatchGr.getDisplayValue(
					DeveloperSessionWatch.Column.UpdateSetScope
				),
			};
		}

		return currentUpdateSetScope;
	}
}
