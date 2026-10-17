function script({ api, event, helpers, imports }) {
	// ciSysidOrLevelsPropChanged script in Map Search Filter UI Controller; fired afer the ciSysid or Levels input props change and also on page load from macroponentReady
	const { ALERT, addAlerts, removeAlerts } = imports['sn_cmdb_ws.unifiedMapUtils']();
	const { SEARCH_IN_PROGRESS, CANCELLING_PREVIOUS_SEARCH } = imports['sn_cmdb_ws.unifiedMapUtilsMapSearchFilter']();

	var sysid = event.payload.value || api.context.props.ciSysid; //use controller input prop when page is loading

	//check if existing query is running
	if (api.state.searchInProgress) {
		addAlerts([{
            id: CANCELLING_PREVIOUS_SEARCH,
            status: ALERT.STATUS.INFO,
            icon: INFO_CIRCLE_OUTLINE,
            content: api.state.translations.CANCELLING_PREVIOUS_SEARCH,
            action: { type: ALERT.TYPE.DISMISS },
		}], api);
	} else { //no search running
        removeAlerts(api.state.alerts, api);
        addAlerts([{
            id: SEARCH_IN_PROGRESS,
            status: ALERT.STATUS.INFO,
            icon: ALERT.ICON.INFO_CIRCLE_OUTLINE,
            content: api.state.translations.SEARCH_IN_PROGRESS,
            action: { type: ALERT.TYPE.DISMISS },
        }], api);
	}

	api.setState('searchAlertIsHidden', false);
	api.setState('searchSysid', sysid);
	api.setState('searchInProgress', true);
}
