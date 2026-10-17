(function() {
	var query, start, end,
		uri = action.getGlideURI(),
		txInfo = DiscoverySensorJob.getTxInfo(current, true);

	if (uri && txInfo) {
		start = (txInfo.earliest.getDisplayValue() + '').split(' ');
		end = (txInfo.latest.getDisplayValue() + '').split(' ');
		query = 'sys_created_onBETWEENjavascript:gs.dateGenerate("' + start[0] + '","' + start[1] + '")' +
				'@javascript:gs.dateGenerate("' + end[0] + '","' + end[1] + '")' +
				'^context_mapLIKE' + txInfo.txId;

		// Discovery logs a message when sensor processing starts, but this is configurable. If the message isn't present and event processing
		// is being used then we can't reliably limit messages to a single sensor
		if (txInfo.startSeq)
			query += '^sequence>=' + txInfo.startSeq;

		if (txInfo.endSeq)
			query += '^sequence<' + txInfo.endSeq;
		else if ((gs.getProperty('glide.discovery.log_sensor_start', 'false') == 'false') && (gs.getProperty('discovery.use.event.processing', 'false') == 'true'))
			gs.addInfoMessage(gs.getMessage('This list may contain messages for multiple sensors. Set glide.discovery.log_sensor_start to true for more precise logging.'));

		query += '^ORDERBYsequence';

		uri.set("sysparm_query", query);
		action.setRedirectURL(uri.toString("syslog_list.do"));
	} else {
		gs.addErrorMessage(gs.getMessage("Unable to find transaction for system logs"));
		action.setRedirectURL(current);
	}
})();
