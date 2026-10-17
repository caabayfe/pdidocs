/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        data,
        state
    } = api;
    const {
        modal
    } = helpers;
    modal.close('[component-id$="wizard_model"]');
    if (event.name === "SN_CATALOG_BUILDER#RECORD_SUBMITED") {
       api.setState('listRefreshPayload', {
        timestamp: Date.now()
       });
       api.emit("SN_CATALOG_FORM_MACRO_VARIABLE#VALUE_CHANGED",{
					value: (api.state.listCount+1).toString(),
	   });
       api.emit("SN_CATALOG_FORM_MACRO_VARIABLE#SET_PAGE_LOAD_STATE_REQUESTED",{
					loading: false,
                    id:'blocking'
	   });
    }
    
}
