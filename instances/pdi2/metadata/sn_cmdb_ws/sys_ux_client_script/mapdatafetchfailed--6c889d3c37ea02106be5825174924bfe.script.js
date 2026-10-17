function script({ api, event, helpers, imports }) {
	//mapDataFetchFailed fired in mapSearchFilterController; Fired when map data has errors
	const { logErrorToConsole, addAlerts, removeAlerts, ALERT } = imports["sn_cmdb_ws.unifiedMapUtils"]();
	const { buildAlertObjList, resetReloadButtonState, setIsPageLoadFalse } = imports["sn_cmdb_ws.unifiedMapUtilsMapSearchFilter"]();
	var processErrorAlerts = {
		init: function () {
			this.errorAlerts();
			resetReloadButtonState(api, helpers);
			setIsPageLoadFalse(api, helpers);
		},

		errorAlerts: function () {
			api.setState('searchInProgress', false);
			removeAlerts(api.state.alerts, api);
			let errors = api.data.getMapDataController.errors;
			if (errors && errors.length) {
				const { withUIMessage, withoutUIMessage } = errors.reduce((acc, error) => {
						if (error.uiMessage && Object.keys(error.uiMessage).length > 0) {
							acc.withUIMessage.push(error);
						} else {
							acc.withoutUIMessage.push(error);
						}
						return acc;
					},
					{ withUIMessage: [], withoutUIMessage: []
				});

				var alerts = buildAlertObjList(api, withUIMessage, true);
				addAlerts(alerts, api);

				//Combine all codes and show the remaining errors
				var codes = withoutUIMessage.map((o) => o.code);
				if (codes.length > 0) {
					helpers.translate("ERROR. The server returned an error retrieving map data [error code: {0}]", codes.join(", "))
						.then((translatedText) => {
							addAlerts(
								[{
									status: ALERT.STATUS.CRITICAL,
									icon: ALERT.ICON.TRIANGLE_EXCLAMATION_OUTLINE,
									content: translatedText,
									action: { type: ALERT.TYPE.DISMISS },
								}], 
								api
							);

							api.setState("searchAlertIsHidden", false);
						});
				}
				//log all error codes to console
				logErrorToConsole(['Failed to fetch data for sysid="' +	api.context.props.ciSysid + 
					'" with levels="' +	api.context.props.levels +
					'" and returned the following errors: ', ...errors.map((o) => o.code + " - " + o.message),
				]);
			}
		},
	};
	processErrorAlerts.init();
}
