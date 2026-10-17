/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 * @param {helpers} params.helpers
 */
 function onUserPreferenceDRSuccess({ api, event, helpers, imports }) {
  const { addDataToContext } = imports['sn_record_page.ContextHelper']();
  addDataToContext(...arguments);
	const recordCtrlUtils = imports['sn_record_page.recordPageControllerUtils'](...arguments);
	recordCtrlUtils.onUserPreferenceDRSuccess();
}
