/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 * @param {helpers} params.helpers
 */

 function refreshSHNOnActivityLogsChange({ api, event, helpers, imports }) {
	const { name } = event.payload;
	const SHNDisplayed = api.state.specialHandlingNotesDisplayed;
	const isActiveScreen = api.context.props.screen.isActive;

	//Not refresh Special Handing Notes data resource when it's displayed before or current screen is inactive
	if (SHNDisplayed || !isActiveScreen)
		return;


	if (name == 'activityLogs') {
		const activityLogsMap = api.context.props.detailsContext;
		if (activityLogsMap.size === 0)
			return;

		var activityEntries = Array.from(activityLogsMap.values());

		//Only fetch the lastest activity entry
		const activityEntry = activityEntries[activityEntries.length - 1];
		const activityArray = activityEntry.activities.get('crud');
		if (!Array.isArray(activityArray) || activityArray.length === 0)
			return;

		//Only fetch the lastest operation
		const { operation } = activityArray[activityArray.length - 1];
		if (operation === 'inserted' || operation === 'updated') {
			api.data.get_special_handling_notes.refresh();
		}
	}
}
