/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {deleteSkipDate} = imports["sn_app_ux_commons.EventRecurrenceHandlers"]({api, helpers});
   
   helpers.timing.setTimeout(() => {
     deleteSkipDate(event);
   }, 300);

}
