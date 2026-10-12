function script({api, event}) {
	if (event.payload && event.payload.requestedState) {
		const sbsEnabled = event.payload.requestedState.isSideBySideViewEnabled;
		const HTMLEditorAvailable = event.payload.requestedState.isHTMLEditorAvailable;
		const HTMLEditorEnabled = event.payload.requestedState.isHTMLEditorEnabled;
		api.setState('isSideBySideEnabled',  sbsEnabled, false);
		api.setState('activityStreamLayout',  sbsEnabled ? '' : 'stacked');
		api.setState('isHTMLEditorAvailable', HTMLEditorAvailable, false);
		api.setState('isHTMLEditorEnabled', HTMLEditorEnabled, false);

		const composeEmailInfo = event.payload.requestedState.composeEmailInfo;
		if (composeEmailInfo && composeEmailInfo.sysId) {
			api.setState('composeEmailInfo', composeEmailInfo);
		}
	}
}
