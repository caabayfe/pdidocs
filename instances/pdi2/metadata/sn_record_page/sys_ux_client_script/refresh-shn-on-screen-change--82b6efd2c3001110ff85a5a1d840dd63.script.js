/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 * @param {helpers} params.helpers
 */

 function refreshSHNOnScreenChange({ api, event, helpers, imports }) {
	const { name } = event.payload;
	const SHNDisplayed = api.state.specialHandlingNotesDisplayed;
	const isActiveScreen = api.context.props.screen.isActive;

	//Not refresh Special Handing Notes data resource when it's displayed before or current screen is inactive
	if (SHNDisplayed || !isActiveScreen)
		return;
	if (name == 'screen') {
		const { value, previousValue } = event.payload;
		//Refresh Special Handling Notes resource when switch focus on current screen(tab)
		if (value.isActive && !previousValue.isActive) {
			api.data.get_special_handling_notes.refresh();
		}
	}
}
