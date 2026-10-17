/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function onUserPrefsPropertyChange({ api, event, helpers, imports }) {
  const { addDataToContext } = imports['sn_record_page.ContextHelper']();
  addDataToContext(...arguments);
	const recordCtrlUtils = imports['sn_record_page.recordPageControllerUtils'](...arguments);
	recordCtrlUtils.onUserPrefsPropertyChange();
}
