/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        formatLastUpdInfoText
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    if (api.data.rejected_cis_last_updated.results && api.data.rejected_cis_last_updated.results[0]) {
        const {
            sys_updated_on: {
                displayValue: rejectedCIsLastUpdated
            },
        } = api.data.rejected_cis_last_updated.results[0];
        api.setState('rejectedCisLastUpdatedInfo', await formatLastUpdInfoText(helpers, rejectedCIsLastUpdated));
    }
}
