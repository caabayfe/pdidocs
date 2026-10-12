/**
* @param {params} params
* @param {api} params.api
* @param {event} params.event
* @param {any} params.imports
* @param {helpers} params.helpers
*/
function setResizePreferences({
	api,
	event,
	helpers,
	imports
}) {
    const { addDataToContext } = imports['sn_record_page.ContextHelper']();
    addDataToContext(...arguments);
    const recordCtrlUtils = imports['sn_record_page.recordPageControllerUtils'](...arguments);

	if (event.payload.interaction !== 'USER_ACTION')
		return;
	const newRatio = event.payload.dividerPosition;
	const name = event.payload.name;
	const resizePrefNames = recordCtrlUtils.getResizePrefNames();
	let prefName = '';
	if (name === 'form') {
		prefName = resizePrefNames.formRatioUserPreference;
		api.setState("formRatioSaved", newRatio);
	} else if (name === 'form_and_realted_list') {
		prefName = resizePrefNames.sidebarRatioPreference;
		api.setState('sidebarRatioSaved', newRatio);
	}
	api.data.setSidebarRatioPreference.execute({
		'name': prefName,
		'value': newRatio
	});
	
}
