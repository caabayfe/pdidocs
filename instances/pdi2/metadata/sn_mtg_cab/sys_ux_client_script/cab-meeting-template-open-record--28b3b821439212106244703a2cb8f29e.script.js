/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.payload) {
        const {table, sysId} = event.payload;

        if (table && sysId) {
            const fields = {
                table,
                sysId
            };
            const params = {};

            helpers.navigate.to('record', fields, params);
        }
    }
}
