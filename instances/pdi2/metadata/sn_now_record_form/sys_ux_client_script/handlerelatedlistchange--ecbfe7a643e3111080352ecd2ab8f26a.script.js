/**
 * @param {params} params
 * @param {api} params.api
 * @param {event} params.event
 * @param {imports} params.imports
 * @param {helpers} params.helpers
 */
 function handleRelatedList({ api, event, helpers, imports }) {
	const recordCtrlUtils = imports['sn_record_page.recordPageControllerUtils'](...arguments);
	recordCtrlUtils.setRelatedList();
}
